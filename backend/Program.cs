using System.Text;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add CORS for Vercel preview/production and local dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                return origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase)
                    || origin.StartsWith("http://127.0.0.1:", StringComparison.OrdinalIgnoreCase)
                    || origin.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase);
            })
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]?.Trim()
    ?? builder.Configuration["JWT_SECRET"]?.Trim();
if (string.IsNullOrEmpty(jwtSecret) || jwtSecret == "#")
{
    if (builder.Environment.IsDevelopment())
        jwtSecret = "cmc-travel-dev-jwt-secret-min-32-chars!!";
    else
        throw new InvalidOperationException("JWT_SECRET is required in production");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        };
    });
builder.Services.AddAuthorization();

// Register DataStoreService as a Singleton
builder.Services.AddSingleton<DataStoreService>();
builder.Services.AddHttpClient("Supabase");
builder.Services.AddSingleton<AuthDbService>();
builder.Services.AddSingleton<GoogleAuthService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddSingleton<PaymentDbService>();
builder.Services.AddSingleton<TourDbService>();
builder.Services.AddSingleton<CheckoutService>();

builder.Services.AddSingleton<SePayService>();
builder.Services.AddSingleton<EmailService>();
builder.Services.AddSingleton<DiscountService>();
builder.Services.AddSingleton<IBusService, BusService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

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
        await context.Response.WriteAsJsonAsync(new { message = "Lỗi máy chủ nội bộ" });
    });
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
