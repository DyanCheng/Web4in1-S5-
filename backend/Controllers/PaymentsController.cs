using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

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

    [HttpPost("create")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        if (request.Amount <= 0)
            return BadRequest(new { message = "Sß╗æ tiß╗ün thanh to├ín kh├┤ng hß╗úp lß╗ç" });

        try
        {
            var paymentCode = _sePay.GeneratePaymentCode();
            long? userId = long.TryParse(request.UserId, out var parsedUserId) ? parsedUserId : null;

            var created = await _paymentDb.CreateOrderPaymentAsync(
                paymentCode,
                userId,
                request.UserEmail,
                request.UserName,
                request.Amount,
                request.OrderItems,
                request.BookingRefs);

            var qrUrl = _sePay.BuildQrUrl(paymentCode, request.Amount);

            return Ok(new
            {
                paymentCode,
                amount = request.Amount,
                status = "pending",
                qrUrl,
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
    public async Task<IActionResult> GetPaymentStatus(string paymentCode)
    {
        try
        {
            var payment = await _paymentDb.GetOrderPaymentByCodeAsync(paymentCode);
            if (payment == null)
                return NotFound(new { message = "Kh├┤ng t├¼m thß║Ñy ─æ╞ín thanh to├ín" });

            return Ok(new
            {
                paymentCode = payment.Value.GetProperty("payment_code").GetString(),
                amount = payment.Value.GetProperty("amount").GetDecimal(),
                status = payment.Value.GetProperty("payment_status").GetString(),
                paidAt = payment.Value.TryGetProperty("paid_at", out var paidAt) && paidAt.ValueKind != JsonValueKind.Null
                    ? paidAt.GetString()
                    : null,
                orderItems = payment.Value.GetProperty("order_items"),
                bookingRefs = payment.Value.GetProperty("booking_refs")
            });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
    }

    [HttpGet("webhook/sepay")]
    public IActionResult SePayWebhookHealthCheck()
    {
        // SePay dashboard / browser may probe with GET before POST deliveries.
        return Ok(new { success = true });
    }

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
            var existing = await _paymentDb.GetOrderPaymentByCodeAsync(paymentCode);
            var wasAlreadyPaid = IsPaymentPaid(existing);

            var result = await _paymentDb.ConfirmOrderPaymentAsync(
                paymentCode,
                payload.Id,
                payload.TransferAmount,
                payload);
            await ConfirmBookingsAsync(result);
            var emailData = await GetPaymentDataForEmailAsync(result, paymentCode);
            await TrySendPaymentConfirmationEmailAsync(emailData, payload, wasAlreadyPaid, paymentCode);

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SePay webhook processing failed for {PaymentCode}", paymentCode);
            return Ok(new { success = true });
        }
    }

    [HttpPost("simulate/{paymentCode}")]
    public async Task<IActionResult> SimulatePayment(string paymentCode)
    {
        if (!CanSimulatePayment())
            return NotFound(new { message = "M├┤ phß╗Ång thanh to├ín ch╞░a ─æ╞░ß╗úc bß║¡t tr├¬n server (ALLOW_PAYMENT_SIMULATION)" });

        try
        {
            var payment = await _paymentDb.GetOrderPaymentByCodeAsync(paymentCode);
            if (payment == null)
                return NotFound(new { message = "Kh├┤ng t├¼m thß║Ñy ─æ╞ín thanh to├ín" });

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
            var wasAlreadyPaid = IsPaymentPaid(payment);
            var result = await _paymentDb.ConfirmOrderPaymentAsync(paymentCode, payload.Id, amount, payload);

            await ConfirmBookingsAsync(result);
            var emailData = await GetPaymentDataForEmailAsync(result, paymentCode);
            await TrySendPaymentConfirmationEmailAsync(emailData, payload, wasAlreadyPaid, paymentCode);

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

    [HttpGet("admin/summary")]
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

    private async Task<JsonElement> GetPaymentDataForEmailAsync(JsonElement confirmResult, string paymentCode)
    {
        if (IsPaymentPaid(confirmResult)
            && confirmResult.TryGetProperty("user_email", out _))
            return confirmResult;

        var refreshed = await _paymentDb.GetOrderPaymentByCodeAsync(paymentCode);
        return refreshed ?? confirmResult;
    }

    private static bool IsPaymentPaid(JsonElement? payment)
    {
        return payment != null
            && payment.Value.TryGetProperty("payment_status", out var status)
            && string.Equals(status.GetString(), "paid", StringComparison.OrdinalIgnoreCase);
    }

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
            return;

        var email = emailProp.GetString();
        if (string.IsNullOrWhiteSpace(email))
            return;

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
