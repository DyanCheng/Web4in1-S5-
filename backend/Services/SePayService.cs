namespace Backend.Services;

public class SePayService
{
    private readonly string? _bankAccount;
    private readonly string? _bankName;
    private readonly string? _paymentCodePrefix;
    private readonly string? _webhookApiKey;

    public SePayService(IConfiguration configuration)
    {
        _bankAccount = configuration["SEPAY_BANK_ACCOUNT"];
        _bankName = configuration["SEPAY_BANK_NAME"] ?? "Vietcombank";
        _paymentCodePrefix = configuration["SEPAY_PAYMENT_CODE_PREFIX"] ?? "CMCTOUR";
        _webhookApiKey = configuration["SEPAY_WEBHOOK_API_KEY"];
    }

    public string GeneratePaymentCode()
    {
        var suffix = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
        return $"{_paymentCodePrefix}{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}{suffix}";
    }

    public string BuildQrUrl(string paymentCode, decimal amount)
    {
        if (string.IsNullOrWhiteSpace(_bankAccount))
            throw new InvalidOperationException("SEPAY_BANK_ACCOUNT is not configured.");

        var query = new Dictionary<string, string>
        {
            ["acc"] = _bankAccount,
            ["bank"] = _bankName ?? "Vietcombank",
            ["amount"] = ((long)Math.Round(amount, 0)).ToString(),
            ["des"] = paymentCode
        };

        return "https://qr.sepay.vn/img?" + string.Join("&", query.Select(kv =>
            $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));
    }

    public bool IsWebhookAuthorized(string? authorizationHeader)
    {
        if (string.IsNullOrWhiteSpace(_webhookApiKey))
            return true;

        if (string.IsNullOrWhiteSpace(authorizationHeader))
            return false;

        return authorizationHeader == $"Apikey {_webhookApiKey}"
            || authorizationHeader == _webhookApiKey;
    }
}
