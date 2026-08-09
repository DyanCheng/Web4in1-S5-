using System.Text.RegularExpressions;

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
    //Tạo mã thanh toán 
    public string GeneratePaymentCode()
    {
        var suffix = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
        return $"{_paymentCodePrefix}{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}{suffix}";
    }
    //Tạo url qr code
    public string BuildQrUrl(string paymentCode, decimal amount)
    {
        if (string.IsNullOrWhiteSpace(_bankAccount))
            throw new InvalidOperationException("SEPAY_BANK_ACCOUNT is not configured.");

        var query = new Dictionary<string, string>
        {
            ["acc"] = _bankAccount,
            ["bank"] = _bankName ?? "Vietcombank",
            ["amount"] = ((long)Math.Round(amount, 0)).ToString(),
            // SePay/VietQR: des must be letters/digits only (no spaces/accents)
            ["des"] = paymentCode.Trim(),
            ["template"] = "QR"
        };

        return "https://qr.sepay.vn/img?" + string.Join("&", query.Select(kv =>
            $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));
    }
    //Xác thực webhook
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
    //Trích xuất mã thanh toán từ code hoặc nội dung
    public string? ExtractPaymentCode(string? code, string? content)
    {
        var prefix = _paymentCodePrefix ?? "CMCTOUR";
        var pattern = $@"{Regex.Escape(prefix)}[A-Z0-9]+";

        if (!string.IsNullOrWhiteSpace(code))
        {
            var fromCode = Regex.Match(code.Trim(), pattern, RegexOptions.IgnoreCase);
            if (fromCode.Success)
                return fromCode.Value.ToUpperInvariant();
        }

        if (string.IsNullOrWhiteSpace(content))
            return null;

        var match = Regex.Match(content, pattern, RegexOptions.IgnoreCase);
        return match.Success ? match.Value.ToUpperInvariant() : null;
    }
}
