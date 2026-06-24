using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add CORS - Allow all origins for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.SetIsOriginAllowed(_ => true)
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
builder.Services.AddSingleton<SePayService>();
// Đăng ký DiscountService
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

// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();