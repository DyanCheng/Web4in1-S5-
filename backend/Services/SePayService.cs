
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


        var normalized = authorizationHeader.Trim();
        if (normalized.Equals(_webhookApiKey, StringComparison.Ordinal))
            return true;

        // SePay: Authorization: Apikey YOUR_API_KEY
        const string apiKeyPrefix = "apikey ";
        if (normalized.StartsWith(apiKeyPrefix, StringComparison.OrdinalIgnoreCase))
        {
            var providedKey = normalized[apiKeyPrefix.Length..].Trim();
            return providedKey.Equals(_webhookApiKey, StringComparison.Ordinal);
        }

        const string bearerPrefix = "bearer ";
        if (normalized.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            var providedKey = normalized[bearerPrefix.Length..].Trim();
            return providedKey.Equals(_webhookApiKey, StringComparison.Ordinal);
        }

        return false;
    }

    public string? ExtractPaymentCode(string? code, string? content)
    {
        if (!string.IsNullOrWhiteSpace(code))
            return code.Trim();

        if (string.IsNullOrWhiteSpace(content) || string.IsNullOrWhiteSpace(_paymentCodePrefix))
            return null;

        var pattern = $@"{Regex.Escape(_paymentCodePrefix)}[A-Z0-9]+";
        var match = Regex.Match(content, pattern, RegexOptions.IgnoreCase);
        return match.Success ? match.Value.ToUpperInvariant() : null;
    }
}
