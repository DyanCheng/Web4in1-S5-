using System.Text;
using System.Threading.RateLimiting;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
var builder = WebApplication.CreateBuilder(args);

// Add CORS for Vercel preview/production and local dev
var allowedOrigins = builder.Configuration["ALLOWED_ORIGINS"]?.Split(',')
    ?? new[] { "http://localhost:3000", "http://127.0.0.1:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
});

// Configure JWT Authentication
var jwtSecret = builder.Configuration["JWT_SECRET"] ?? "ThisIsADefaultSecretKeyForDevelopmentOnly123!";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

// Register in-memory demo store (see DataStoreService for migration status)
builder.Services.AddSingleton<DataStoreService>();
builder.Services.AddHttpClient("Supabase");
builder.Services.AddSingleton<AuthDbService>();
builder.Services.AddSingleton<AuthLogService>();
builder.Services.AddSingleton<RealtimeAuthService>();
builder.Services.AddSingleton<GoogleAuthService>();
builder.Services.AddSingleton<PaymentDbService>();
builder.Services.AddSingleton<TourDbService>();
builder.Services.AddSingleton<HotelDbService>();
builder.Services.AddSingleton<RevenueService>();
builder.Services.AddSingleton<CheckoutService>();

builder.Services.AddSingleton<SePayService>();
builder.Services.AddSingleton<EmailService>();
builder.Services.AddSingleton<DiscountService>();
builder.Services.AddSingleton<IBusService, BusService>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        // Do not leak exception details to client
        await context.Response.WriteAsJsonAsync(new { message = "Lỗi máy chủ nội bộ" });
    });
});

// Security Headers Middleware
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

// HTTPS tắt trong Docker dev; production dùng reverse proxy (Vercel/Railway)
// app.UseHttpsRedirection();

// Lưu ý: chưa có JWT middleware — API mở, chỉ dựa vào logic từng controller
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();