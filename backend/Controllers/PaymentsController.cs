using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;


namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly PaymentDbService _paymentDb;
    private readonly SePayService _sePay;
    private readonly CheckoutService _checkout;
    private readonly EmailService _emailService;
    private readonly ILogger<PaymentsController> _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public PaymentsController(
        PaymentDbService paymentDb,
        SePayService sePay,
        CheckoutService checkout,
        EmailService emailService,
        ILogger<PaymentsController> logger,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _paymentDb = paymentDb;
        _sePay = sePay;
        _checkout = checkout;
        _emailService = emailService;
        _logger = logger;
        _environment = environment;
        _configuration = configuration;
    }
    
    private bool CanSimulatePayment() =>
        _environment.IsDevelopment()
        || string.Equals(_configuration["ALLOW_PAYMENT_SIMULATION"], "true", StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// order_payments timestamps are UTC wall-clock without timezone.
    /// Always emit ISO-8601 with Z so browsers in UTC+7 don't treat them as local.
    /// </summary>
    private static string? ToUtcIso(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return null;

        if (DateTimeOffset.TryParse(
                raw,
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.AssumeUniversal | System.Globalization.DateTimeStyles.AdjustToUniversal,
                out var dto))
        {
            return dto.UtcDateTime.ToString("yyyy-MM-dd'T'HH:mm:ss.fffffff'Z'");
        }

        return raw;
    }

    private static string UtcExpiresAtIso(string? createdAtIso, int minutes = 5)
    {
        if (!string.IsNullOrWhiteSpace(createdAtIso)
            && DateTimeOffset.TryParse(
                createdAtIso,
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.AssumeUniversal | System.Globalization.DateTimeStyles.AdjustToUniversal,
                out var created))
        {
            return created.UtcDateTime.AddMinutes(minutes).ToString("yyyy-MM-dd'T'HH:mm:ss.fffffff'Z'");
        }

        return DateTime.UtcNow.AddMinutes(minutes).ToString("yyyy-MM-dd'T'HH:mm:ss.fffffff'Z'");
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request,string a = "Tạo một đơn thanh toán mới và trả về mã thanh toán, số tiền, trạng thái và URL QR code để người dùng thực hiện thanh toán.")
    {
        if (request.Amount <= 0)
            return BadRequest(new { message = "Số tiền thanh toán không hợp lệ" });

        try
        {
            var paymentCode = _sePay.GeneratePaymentCode();
            long? userId = long.TryParse(request.UserId, out var parsedUserId) ? parsedUserId : null;

            var created = await _paymentDb.CreateOrderPaymentAsync
            (
                paymentCode,
                userId,
                request.UserEmail,
                request.UserName,
                request.Amount,
                request.OrderItems,
                request.BookingRefs
            );

            var qrUrl = _sePay.BuildQrUrl(paymentCode, request.Amount);
            var createdAt = ToUtcIso(
                created.TryGetProperty("created_at", out var createdProp) && createdProp.ValueKind != JsonValueKind.Null
                    ? createdProp.GetString()
                    : null) ?? DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss.fffffff'Z'");
            var expiresAt = ToUtcIso(
                created.TryGetProperty("expires_at", out var expiresProp) && expiresProp.ValueKind != JsonValueKind.Null
                    ? expiresProp.GetString()
                    : null) ?? UtcExpiresAtIso(createdAt);

            return Ok(new
            {
                paymentCode,
                amount = request.Amount,
                status = "pending",
                qrUrl,
                createdAt,
                expiresAt,
                orderPaymentId = created.GetProperty("order_payment_id").GetInt64()
            });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
        catch (PaymentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{paymentCode}/status")]
    public async Task<IActionResult> GetPaymentStatus(string paymentCode,string a = "Trả về trạng thái thanh toán của một đơn thanh toán dựa trên mã thanh toán. Nếu đơn thanh toán không tồn tại, trả về lỗi 404.")
    {
        try
        {
            // Auto-expire unpaid payment codes older than 5 minutes
            JsonElement? payment = null;
            try
            {
                payment = await _paymentDb.ExpireOrderPaymentAsync(paymentCode);
            }
            catch (PaymentException ex)
            {
                _logger.LogWarning(ex, "expire_order_payment failed for {PaymentCode}, falling back to get", paymentCode);
                payment = await _paymentDb.GetOrderPaymentByCodeAsync(paymentCode);
            }

            if (payment == null)
                return NotFound(new { message = "Không tìm thấy đơn thanh toán" });

            var p = payment.Value;
            var status = p.TryGetProperty("payment_status", out var statusProp)
                ? statusProp.GetString()
                : p.TryGetProperty("status", out var statusAlt) ? statusAlt.GetString() : null;

            string? createdAt = ToUtcIso(
                p.TryGetProperty("created_at", out var createdAtProp) && createdAtProp.ValueKind != JsonValueKind.Null
                    ? createdAtProp.GetString()
                    : null);
            string? expiresAt = ToUtcIso(
                p.TryGetProperty("expires_at", out var expiresAtProp) && expiresAtProp.ValueKind != JsonValueKind.Null
                    ? expiresAtProp.GetString()
                    : null);

            if (string.IsNullOrWhiteSpace(expiresAt))
                expiresAt = UtcExpiresAtIso(createdAt);

            // Fallback if expire RPC returned slim payload without order_items
            if (!p.TryGetProperty("order_items", out _) || !p.TryGetProperty("booking_refs", out _))
            {
                var full = await _paymentDb.GetOrderPaymentByCodeAsync(paymentCode);
                if (full != null)
                    p = full.Value;
            }

            var amount = p.TryGetProperty("amount", out var amountProp) ? amountProp.GetDecimal() : 0m;
            var resolvedStatus = status ?? p.GetProperty("payment_status").GetString();
            string? qrUrl = null;
            if (!string.Equals(resolvedStatus, "expired", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(resolvedStatus, "paid", StringComparison.OrdinalIgnoreCase)
                && amount > 0)
            {
                try
                {
                    qrUrl = _sePay.BuildQrUrl(paymentCode, amount);
                }
                catch (InvalidOperationException ex)
                {
                    _logger.LogWarning(ex, "Unable to build QR URL for {PaymentCode}", paymentCode);
                }
            }

            return Ok(new
            {
                paymentCode = p.TryGetProperty("payment_code", out var codeProp) ? codeProp.GetString() : paymentCode,
                amount,
                status = resolvedStatus,
                paidAt = p.TryGetProperty("paid_at", out var paidAt) && paidAt.ValueKind != JsonValueKind.Null
                    ? paidAt.GetString()
                    : null,
                createdAt,
                expiresAt,
                qrUrl,
                orderItems = p.TryGetProperty("order_items", out var items) ? items : (object?)null,
                bookingRefs = p.TryGetProperty("booking_refs", out var refs) ? refs : (object?)null
            });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
        catch (PaymentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("user/{email}")]
    public async Task<IActionResult> GetUserPayments(string email)
    {
        try
        {
            var payments = await _paymentDb.ListUserOrderPaymentsAsync(email, null);
            return Ok(JsonSerializer.Deserialize<object>(payments.GetRawText()));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
        catch (PaymentException ex)
        {
            _logger.LogWarning(ex, "list_user_order_payments failed for {Email}", email);
            return StatusCode(502, new { message = ex.Message });
        }
    }

    [HttpPost("{paymentCode}/expire")]
    public async Task<IActionResult> ExpirePayment(string paymentCode)
    {
        try
        {
            var result = await _paymentDb.ExpireOrderPaymentAsync(paymentCode);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy đơn thanh toán" });

            return Ok(new
            {
                paymentCode,
                status = result.Value.TryGetProperty("payment_status", out var s) ? s.GetString() : null,
                expired = result.Value.TryGetProperty("expired", out var e) && e.ValueKind == JsonValueKind.True,
                expiresAt = ToUtcIso(
                    result.Value.TryGetProperty("expires_at", out var exp) && exp.ValueKind != JsonValueKind.Null
                        ? exp.GetString()
                        : null),
            });
        }
        catch (PaymentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    //SePayWebhookHealthCheck trả về trạng thái thành công để kiểm tra sức khỏe của webhook SePay. SePay dashboard / trình duyệt có thể gửi yêu cầu GET trước khi gửi POST.
    [HttpGet("webhook/sepay")]
    public IActionResult SePayWebhookHealthCheck()
    {
        return Ok(new { success = true });
    }

    //SePayWebhook xử lý các webhook từ SePay khi có thanh toán được thực hiện. Nó xác thực chữ ký, kiểm tra mã thanh toán, xác nhận thanh toán trong cơ sở dữ liệu và gửi email xác nhận nếu cần.
    [HttpPost("webhook/sepay")]
    public async Task<IActionResult> SePayWebhook([FromBody] SePayWebhookPayload payload)
    {
        _logger.LogInformation(
            "SePay webhook received: id={Id}, code={Code}, amount={Amount}",
            payload.Id, payload.Code, payload.TransferAmount);

        if (!_sePay.IsWebhookAuthorized(Request.Headers.Authorization))
        {
            _logger.LogWarning("SePay webhook unauthorized: missing or invalid Authorization header");
            return Unauthorized(new { success = false });
        }

        if (!string.Equals(payload.TransferType, "in", StringComparison.OrdinalIgnoreCase))
            return Ok(new { success = true });

        var paymentCode = _sePay.ExtractPaymentCode(payload.Code, payload.Content);
        if (string.IsNullOrWhiteSpace(paymentCode))
        {
            _logger.LogWarning("SePay webhook ignored: no payment code in payload");
            return Ok(new { success = true });
        }

        try
        {
            JsonElement? existing = null;
            try
            {
                existing = await _paymentDb.ExpireOrderPaymentAsync(paymentCode);
            }
            catch (PaymentException ex)
            {
                _logger.LogWarning(ex, "expire_order_payment failed during webhook for {PaymentCode}", paymentCode);
                existing = await _paymentDb.GetOrderPaymentByCodeAsync(paymentCode);
            }

            if (existing != null
                && existing.Value.TryGetProperty("payment_status", out var existingStatus)
                && string.Equals(existingStatus.GetString(), "expired", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("SePay webhook ignored: payment {PaymentCode} expired", paymentCode);
                return Ok(new { success = true, expired = true });
            }

            var wasAlreadyPaid = IsPaymentPaid(existing);

            var result = await _paymentDb.ConfirmOrderPaymentAsync(
                paymentCode,
                payload.Id,
                payload.TransferAmount,
                payload);

            // Never email on duplicate / already-paid confirm responses
            var isDuplicate = result.TryGetProperty("duplicate", out var dup) && dup.ValueKind == JsonValueKind.True;
            var isAlreadyPaidFlag = result.TryGetProperty("already_paid", out var ap) && ap.ValueKind == JsonValueKind.True;
            if (isDuplicate || isAlreadyPaidFlag || wasAlreadyPaid)
            {
                _logger.LogInformation("Skip confirm side-effects for {PaymentCode}: duplicate/already paid", paymentCode);
                return Ok(new { success = true });
            }

            if (!IsPaymentPaid(result))
            {
                _logger.LogWarning("SePay webhook did not mark {PaymentCode} as paid", paymentCode);
                return Ok(new { success = true });
            }

            await ConfirmBookingsAsync(result);
            var emailData = await GetPaymentDataForEmailAsync(result, paymentCode);
            await TrySendPaymentConfirmationEmailAsync(emailData, payload, wasAlreadyPaid: false, paymentCode);

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SePay webhook processing failed for {PaymentCode}", paymentCode);
            return Ok(new { success = true });
        }
    }

    //SimulatePayment là một endpoint chỉ dành cho môi trường phát triển hoặc khi được bật bằng biến môi trường ALLOW_PAYMENT_SIMULATION. Nó mô phỏng một thanh toán thành công cho một mã thanh toán đã tồn tại, xác nhận thanh toán trong cơ sở dữ liệu và gửi email xác nhận nếu cần.
    [HttpPost("simulate/{paymentCode}")]
    public async Task<IActionResult> SimulatePayment(string paymentCode)
    {
        if (!CanSimulatePayment())
            return NotFound(new { message = "Mã thanh toán chưa được kích hoạt trên server (ALLOW_PAYMENT_SIMULATION)" });

        try
        {
            JsonElement? payment = null;
            try
            {
                payment = await _paymentDb.ExpireOrderPaymentAsync(paymentCode);
            }
            catch (PaymentException)
            {
                payment = await _paymentDb.GetOrderPaymentByCodeAsync(paymentCode);
            }

            if (payment == null)
                return NotFound(new { message = "Không tìm thấy đơn thanh toán" });

            var status = payment.Value.TryGetProperty("payment_status", out var st)
                ? st.GetString()
                : null;
            if (string.Equals(status, "expired", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Mã thanh toán đã hết hạn. Vui lòng tạo thanh toán mới." });

            if (string.Equals(status, "paid", StringComparison.OrdinalIgnoreCase))
                return Ok(new { success = true, simulated = true, alreadyPaid = true });

            var amount = payment.Value.GetProperty("amount").GetDecimal();
            var payload = new SePayWebhookPayload
            {
                Id = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                Code = paymentCode,
                TransferAmount = amount,
                TransferType = "in",
                Gateway = "Simulated",
                AccountNumber = "0000000000",
                Content = paymentCode,
                Description = "Simulated payment",
                TransactionDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            };
            var result = await _paymentDb.ConfirmOrderPaymentAsync(paymentCode, payload.Id, amount, payload);

            if (!IsPaymentPaid(result))
                return BadRequest(new { message = "Mô phỏng thanh toán thất bại" });

            await ConfirmBookingsAsync(result);
            var emailData = await GetPaymentDataForEmailAsync(result, paymentCode);
            await TrySendPaymentConfirmationEmailAsync(emailData, payload, wasAlreadyPaid: false, paymentCode);

            return Ok(new { success = true, simulated = true });
        }
        catch (PaymentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
    }

    [HttpPost("{code}/approve")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ApprovePayment(string code)
    {
        try
        {
            var result = await _paymentDb.ApprovePaymentAdminAsync(code);
            return Ok(result);
        }
        catch (PaymentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("admin/summary")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAdminSummary()
    {
        try
        {
            var summary = await _paymentDb.GetPaymentAdminSummaryAsync();
            return Ok(JsonSerializer.Deserialize<object>(summary.GetRawText()));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
    }

    [HttpGet("admin/transactions")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAdminTransactions()
    {
        try
        {
            var transactions = await _paymentDb.ListOrderPaymentsAdminAsync();
            return Ok(JsonSerializer.Deserialize<object>(transactions.GetRawText()));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
    }

    //GetAdminTransactionByCode trả về thông tin chi tiết của một đơn thanh toán dựa trên mã thanh toán cho quản trị viên. Nếu đơn thanh toán không tồn tại, trả về lỗi 404. Nếu cơ sở dữ liệu không khả dụng, trả về lỗi 503.
    private async Task ConfirmBookingsAsync(JsonElement result)
    {
        if (!result.TryGetProperty("booking_refs", out var bookingRefs)
            || bookingRefs.ValueKind != JsonValueKind.Array)
            return;

        var refs = bookingRefs.EnumerateArray()
            .Select(bookingRef => bookingRef.GetString())
            .Where(bookingId => !string.IsNullOrWhiteSpace(bookingId))
            .Select(bookingId => bookingId!)
            .ToList();

        await _checkout.ConfirmBookingsAsync(refs);
    }

    //GetPaymentDataForEmailAsync kiểm tra xem thanh toán đã được xác nhận chưa và có email người dùng hay không. Nếu chưa, nó làm mới dữ liệu thanh toán từ cơ sở dữ liệu để đảm bảo thông tin email là chính xác trước khi gửi email xác nhận.
    private async Task<JsonElement> GetPaymentDataForEmailAsync(JsonElement confirmResult, string paymentCode)
    {
        if (IsPaymentPaid(confirmResult)
            && confirmResult.TryGetProperty("user_email", out _))
            return confirmResult;

        var refreshed = await _paymentDb.GetOrderPaymentByCodeAsync(paymentCode);
        return refreshed ?? confirmResult;
    }

    //IsPaymentPaid kiểm tra xem một đơn thanh toán đã được xác nhận là "paid" hay chưa dựa trên dữ liệu JSON trả về từ cơ sở dữ liệu.
    private static bool IsPaymentPaid(JsonElement? payment)
    {
        return payment != null
            && payment.Value.TryGetProperty("payment_status", out var status)
            && string.Equals(status.GetString(), "paid", StringComparison.OrdinalIgnoreCase);
    }

    //TrySendPaymentConfirmationEmailAsync gửi email xác nhận thanh toán nếu thanh toán chưa được xác nhận trước đó và trạng thái thanh toán là "paid". Nó lấy thông tin email người dùng từ dữ liệu thanh toán và sử dụng EmailService để gửi email. Nếu gửi email thất bại, nó ghi log lỗi nhưng không làm gián đoạn quá trình xử lý webhook.
    private async Task TrySendPaymentConfirmationEmailAsync(
        JsonElement result,
        SePayWebhookPayload payload,
        bool wasAlreadyPaid,
        string paymentCode)
    {
        if (wasAlreadyPaid)
        {
            _logger.LogInformation("Skip email for {PaymentCode}: already paid", paymentCode);
            return;
        }

        if (!result.TryGetProperty("payment_status", out var status)
            || !string.Equals(status.GetString(), "paid", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Skip email for {PaymentCode}: status is not paid", paymentCode);
            return;
        }

        if (!result.TryGetProperty("user_email", out var emailProp))
        {
            _logger.LogWarning("Skip email for {PaymentCode}: missing user_email", paymentCode);
            return;
        }

        var email = emailProp.GetString()?.Trim();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            _logger.LogWarning("Skip email for {PaymentCode}: invalid user_email '{Email}'", paymentCode, email);
            return;
        }

        var amount = result.TryGetProperty("amount", out var amountProp)
            ? amountProp.GetDecimal()
            : payload.TransferAmount;

        var transactionDate = !string.IsNullOrWhiteSpace(payload.TransactionDate)
            ? payload.TransactionDate
            : result.TryGetProperty("paid_at", out var paidAt) && paidAt.ValueKind != JsonValueKind.Null
                ? paidAt.GetString() ?? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                : DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

        var description = !string.IsNullOrWhiteSpace(payload.Description)
            ? payload.Description
            : !string.IsNullOrWhiteSpace(payload.Content)
                ? payload.Content
                : $"Thanh to├ín ─æ╞ín h├áng {paymentCode}";

        JsonElement? orderItems = result.TryGetProperty("order_items", out var items) ? items : null;

        try
        {
            await _emailService.SendPaymentConfirmationAsync(new PaymentConfirmationEmail
            {
                ToEmail = email,
                ToName = result.TryGetProperty("user_name", out var nameProp) ? nameProp.GetString() : null,
                PaymentCode = paymentCode,
                Amount = amount,
                TransactionDate = transactionDate,
                Description = description,
                OrderItems = orderItems
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send payment confirmation email for {PaymentCode}", paymentCode);
        }
    }
}

public class CreatePaymentRequest
{
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public object OrderItems { get; set; } = Array.Empty<object>();
    public object BookingRefs { get; set; } = Array.Empty<object>();
}

public class SePayWebhookPayload
{

    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("gateway")]
    public string Gateway { get; set; } = string.Empty;

    [JsonPropertyName("transactionDate")]
    public string TransactionDate { get; set; } = string.Empty;

    [JsonPropertyName("accountNumber")]
    public string AccountNumber { get; set; } = string.Empty;

    [JsonPropertyName("subAccount")]
    public string? SubAccount { get; set; }

    [JsonPropertyName("code")]
    public string? Code { get; set; }

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("transferType")]
    public string TransferType { get; set; } = "in";

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("transferAmount")]
    public decimal TransferAmount { get; set; }

    [JsonPropertyName("accumulated")]
    public decimal Accumulated { get; set; }

    [JsonPropertyName("referenceCode")]
    public string? ReferenceCode { get; set; }
}
