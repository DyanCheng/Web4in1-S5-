using System.Net.Http.Json;
using System.Text.Json;

namespace Backend.Services;

public class PaymentDbService
{
    private readonly string? _supabaseUrl;
    private readonly string? _supabaseKey;
    private readonly HttpClient _http;

    public PaymentDbService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {

        _supabaseUrl = FirstConfig(configuration, "SUPABASE_URL", "Supabase:Url");
        _supabaseKey = FirstConfig(
            configuration,
            "SUPABASE_SERVICE_ROLE_KEY",
            "SUPABASE_KEY",
            "Supabase:Key");
        _http = httpClientFactory.CreateClient("Supabase");
    }

    private static string? FirstConfig(IConfiguration configuration, params string[] keys)
    {
        foreach (var key in keys)
        {
            var value = configuration[key]?.Trim();
            if (!string.IsNullOrWhiteSpace(value))
                return value;
        }

        return null;
    }

    public async Task<JsonElement> CreateOrderPaymentAsync(
        string paymentCode,
        long? userId,
        string userEmail,
        string? userName,
        decimal amount,
        object orderItems,
        object bookingRefs)
    {
        var response = await PostRpcAsync("create_order_payment", new
        {
            p_payment_code = paymentCode,
            p_user_id = userId,
            p_user_email = userEmail,
            p_user_name = userName ?? string.Empty,
            p_amount = amount,
            p_order_items = orderItems,
            p_booking_refs = bookingRefs
        });

        return response ?? throw new PaymentException("Không thể tạo đơn thanh toán");
    }

    public async Task<JsonElement?> GetOrderPaymentByCodeAsync(string paymentCode)
    {
        return await PostRpcAsync("get_order_payment_by_code", new { p_payment_code = paymentCode });
    }

    public async Task<JsonElement> ConfirmOrderPaymentAsync(
        string paymentCode,
        long sepayTransactionId,
        decimal transferAmount,
        object webhookPayload)
    {
        var response = await PostRpcAsync("confirm_order_payment", new
        {
            p_payment_code = paymentCode,
            p_sepay_transaction_id = sepayTransactionId,
            p_transfer_amount = transferAmount,
            p_webhook_payload = webhookPayload
        });

        return response ?? throw new PaymentException("Xác nhận thanh toán thất bại");
    }

    public async Task<JsonElement> ListOrderPaymentsAdminAsync()
    {
        var response = await PostRpcAsync("list_order_payments_admin", new { });
        return response ?? JsonDocument.Parse("[]").RootElement;
    }

    public async Task<JsonElement> GetPaymentAdminSummaryAsync()
    {
        var response = await PostRpcAsync("get_payment_admin_summary", new { });
        return response ?? throw new PaymentException("Không thể tải thống kê thanh toán");
    }

    private async Task<JsonElement?> PostRpcAsync(string functionName, object body)
    {
        if (string.IsNullOrWhiteSpace(_supabaseUrl) || string.IsNullOrWhiteSpace(_supabaseKey))
            throw new InvalidOperationException("Configure SUPABASE_URL + SUPABASE_KEY.");

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{_supabaseUrl!.TrimEnd('/')}/rest/v1/rpc/{functionName}")
        {
            Content = JsonContent.Create(body)
        };
        request.Headers.Add("apikey", _supabaseKey);
        request.Headers.Add("Authorization", $"Bearer {_supabaseKey}");

        var response = await _http.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new PaymentException(ParseError(content));

        if (string.IsNullOrWhiteSpace(content) || content == "null")
            return null;

        using var doc = JsonDocument.Parse(content);
        return doc.RootElement.Clone();
    }

    private static string ParseError(string content)
    {
        try
        {
            using var doc = JsonDocument.Parse(content);
            if (doc.RootElement.TryGetProperty("message", out var message))
                return message.GetString() ?? "Yêu cầu thất bại";
        }
        catch { }

        return content;
    }
}

public class PaymentException : Exception
{
    public PaymentException(string message) : base(message) { }
}
