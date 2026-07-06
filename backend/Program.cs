using Backend.Services;

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

// Register DataStoreService as a Singleton
builder.Services.AddSingleton<DataStoreService>();
builder.Services.AddHttpClient("Supabase");
builder.Services.AddSingleton<AuthDbService>();
builder.Services.AddSingleton<GoogleAuthService>();
builder.Services.AddSingleton<PaymentDbService>();
builder.Services.AddSingleton<TourDbService>();
builder.Services.AddSingleton<HotelDbService>();

builder.Services.AddSingleton<SePayService>();
builder.Services.AddSingleton<EmailService>();
//Đăng ký DiscountService
builder.Services.AddSingleton<DiscountService>();

// 👇 THÊM DÒNG NÀY ĐỂ ĐĂNG KÝ BUS SERVICE
builder.Services.AddScoped<IBusService, BusService>();

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
        await context.Response.WriteAsJsonAsync(new { message = "Lỗi máy chủ nội bộ" });
    });
});

// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();