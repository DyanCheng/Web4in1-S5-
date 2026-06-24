using System.Text.Json;

using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly PaymentDbService _paymentDb;
    private readonly SePayService _sePay;
    private readonly DataStoreService _dataStore;

    {
        _paymentDb = paymentDb;
        _sePay = sePay;
        _dataStore = dataStore;

    [HttpPost("create")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        if (request.Amount <= 0)
            return BadRequest(new { message = "Số tiền thanh toán không hợp lệ" });

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
                return NotFound(new { message = "Không tìm thấy đơn thanh toán" });

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


            var result = await _paymentDb.ConfirmOrderPaymentAsync(
                paymentCode,
                payload.Id,
                payload.TransferAmount,
                payload);


            return Ok(new { success = true });
        }
    }

    [HttpPost("simulate/{paymentCode}")]
    public async Task<IActionResult> SimulatePayment(string paymentCode)
    {


        try
        {
            var payment = await _paymentDb.GetOrderPaymentByCodeAsync(paymentCode);
            if (payment == null)
                return NotFound(new { message = "Không tìm thấy đơn thanh toán" });

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

    public string? ReferenceCode { get; set; }
}
