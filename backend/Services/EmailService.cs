using System.Globalization;
using System.Text;
using System.Text.Json;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Backend.Services;

public class EmailService
{
    private readonly string? _smtpHost;
    private readonly int _smtpPort;
    private readonly string? _smtpUsername;
    private readonly string? _smtpPassword;
    private readonly string? _fromEmail;
    private readonly string _fromName;
    private readonly ILogger<EmailService> _logger;
    private readonly bool _isDevelopment;

    public EmailService(
        IConfiguration configuration,
        IHostEnvironment environment,
        ILogger<EmailService> logger)
    {
        _smtpHost = configuration["SMTP_HOST"];
        _smtpPort = int.TryParse(configuration["SMTP_PORT"], out var port) ? port : 587;
        _smtpUsername = configuration["SMTP_USERNAME"]?.Trim();
        _smtpPassword = configuration["SMTP_PASSWORD"]?.Replace(" ", "");
        _fromEmail = configuration["SMTP_FROM_EMAIL"] ?? _smtpUsername;
        _fromName = configuration["SMTP_FROM_NAME"] ?? "CMC Tour";
        _isDevelopment = environment.IsDevelopment();
        _logger = logger;
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_smtpHost)
        && !string.IsNullOrWhiteSpace(_fromEmail)
        && !string.IsNullOrWhiteSpace(_smtpUsername)
        && !string.IsNullOrWhiteSpace(_smtpPassword);

    public async Task SendPaymentConfirmationAsync(PaymentConfirmationEmail data)
    {
        if (!IsConfigured)
        {
            _logger.LogWarning("SMTP is not configured. Skipping payment confirmation email to {Email}", data.ToEmail);
            return;
        }

        if (string.IsNullOrWhiteSpace(data.ToEmail))
        {
            _logger.LogWarning("No recipient email for payment {PaymentCode}", data.PaymentCode);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _fromEmail!));
        message.To.Add(new MailboxAddress(data.ToName ?? data.ToEmail, data.ToEmail));
        message.Subject = $"Xác nhận thanh toán thành công - {data.PaymentCode}";

        var body = new BodyBuilder
        {
            HtmlBody = BuildPaymentConfirmationHtml(data),
            TextBody = BuildPaymentConfirmationText(data)
        };
        message.Body = body.ToMessageBody();

        using var client = new SmtpClient();
        if (_isDevelopment)
            client.ServerCertificateValidationCallback = (_, _, _, _) => true;

        var socketOptions = _smtpPort == 465
            ? SecureSocketOptions.SslOnConnect
            : SecureSocketOptions.StartTls;

        await client.ConnectAsync(_smtpHost!, _smtpPort, socketOptions);
        await client.AuthenticateAsync(_smtpUsername!, _smtpPassword!);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("Payment confirmation email sent to {Email} for {PaymentCode}", data.ToEmail, data.PaymentCode);
    }

    private static string BuildPaymentConfirmationHtml(PaymentConfirmationEmail data)
    {
        var amount = FormatCurrency(data.Amount);
        var orderItemsHtml = BuildOrderItemsHtml(data.OrderItems);

        return $"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; font-size: 22px;">Thanh toán thành công</h1>
                    <p style="margin: 8px 0 0; opacity: 0.9;">Cảm ơn bạn đã đặt tour với CMC Tour</p>
                </div>
                <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
                    <p>Xin chào <strong>{EscapeHtml(data.ToName ?? data.ToEmail)}</strong>,</p>
                    <p>Chúng tôi đã nhận được thanh toán của bạn. Dưới đây là thông tin giao dịch:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 10px 0; color: #64748b; width: 40%;">Mã thanh toán</td>
                            <td style="padding: 10px 0; font-weight: bold;">{EscapeHtml(data.PaymentCode)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #64748b;">Số tiền</td>
                            <td style="padding: 10px 0; font-weight: bold; color: #16a34a; font-size: 18px;">{amount}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #64748b;">Ngày giao dịch</td>
                            <td style="padding: 10px 0; font-weight: bold;">{EscapeHtml(data.TransactionDate)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #64748b;">Mô tả</td>
                            <td style="padding: 10px 0;">{EscapeHtml(data.Description)}</td>
                        </tr>
                    </table>
                    {orderItemsHtml}
                    <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
                        Nếu bạn có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ khách hàng.
                    </p>
                </div>
            </body>
            </html>
            """;
    }

    private static string BuildPaymentConfirmationText(PaymentConfirmationEmail data)
    {
        var sb = new StringBuilder();
        sb.AppendLine("THANH TOÁN THÀNH CÔNG");
        sb.AppendLine();
        sb.AppendLine($"Xin chào {data.ToName ?? data.ToEmail},");
        sb.AppendLine();
        sb.AppendLine("Chúng tôi đã nhận được thanh toán của bạn.");
        sb.AppendLine();
        sb.AppendLine($"Mã thanh toán: {data.PaymentCode}");
        sb.AppendLine($"Số tiền: {FormatCurrency(data.Amount)}");
        sb.AppendLine($"Ngày giao dịch: {data.TransactionDate}");
        sb.AppendLine($"Mô tả: {data.Description}");
        sb.AppendLine();
        sb.AppendLine(BuildOrderItemsText(data.OrderItems));
        return sb.ToString();
    }

    private static string BuildOrderItemsHtml(JsonElement? orderItems)
    {
        if (orderItems is not { ValueKind: JsonValueKind.Array } items || items.GetArrayLength() == 0)
            return string.Empty;

        var rows = new StringBuilder();
        foreach (var item in items.EnumerateArray())
        {
            var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "Tour" : "Tour";
            var quantity = item.TryGetProperty("quantity", out var q) ? q.GetInt32() : 1;
            var guests = item.TryGetProperty("guests", out var g) ? g.GetInt32() : 0;
            var price = item.TryGetProperty("price", out var p) ? p.GetDecimal() : 0;
            var date = item.TryGetProperty("date", out var d) ? d.GetString() : null;

            rows.Append($"""
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{EscapeHtml(title)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">{quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">{guests}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{EscapeHtml(date ?? "-")}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">{FormatCurrency(price)}</td>
                </tr>
                """);
        }

        return $"""
            <h3 style="margin: 24px 0 12px; font-size: 16px;">Chi tiết đơn hàng</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="padding: 8px; text-align: left;">Tour</th>
                        <th style="padding: 8px; text-align: center;">SL</th>
                        <th style="padding: 8px; text-align: center;">Khách</th>
                        <th style="padding: 8px; text-align: left;">Ngày đi</th>
                        <th style="padding: 8px; text-align: right;">Giá</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
            """;
    }

    private static string BuildOrderItemsText(JsonElement? orderItems)
    {
        if (orderItems is not { ValueKind: JsonValueKind.Array } items || items.GetArrayLength() == 0)
            return string.Empty;

        var sb = new StringBuilder("Chi tiết đơn hàng:\n");
        foreach (var item in items.EnumerateArray())
        {
            var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "Tour" : "Tour";
            var quantity = item.TryGetProperty("quantity", out var q) ? q.GetInt32() : 1;
            var guests = item.TryGetProperty("guests", out var g) ? g.GetInt32() : 0;
            var price = item.TryGetProperty("price", out var p) ? p.GetDecimal() : 0;
            var date = item.TryGetProperty("date", out var d) ? d.GetString() : "-";

            sb.AppendLine($"- {title} | SL: {quantity} | Khách: {guests} | Ngày: {date} | {FormatCurrency(price)}");
        }

        return sb.ToString();
    }

    private static string FormatCurrency(decimal amount) =>
        string.Format(CultureInfo.GetCultureInfo("vi-VN"), "{0:N0} ₫", amount);

    private static string EscapeHtml(string? text) =>
        string.IsNullOrEmpty(text) ? string.Empty : System.Net.WebUtility.HtmlEncode(text);
}

public class PaymentConfirmationEmail
{
    public string ToEmail { get; set; } = string.Empty;
    public string? ToName { get; set; }
    public string PaymentCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string TransactionDate { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public JsonElement? OrderItems { get; set; }
}
