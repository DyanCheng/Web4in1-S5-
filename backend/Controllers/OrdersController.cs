using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly CheckoutService _checkout;

    public OrdersController(CheckoutService checkout)
    {
        _checkout = checkout;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        try
        {
            var result = await _checkout.CheckoutAsync(request);
            return Ok(new
            {
                paymentCode = result.PaymentCode,
                amount = result.Amount,
                subtotal = result.Subtotal,
                discountAmount = result.DiscountAmount,
                discountCode = result.DiscountCode,
                status = "pending",
                qrUrl = result.QrUrl,
                bookingRefs = result.BookingRefs,
                orderItems = result.OrderItems,
            });
        }
        catch (CheckoutException ex)
        {
            return BadRequest(new { message = ex.Message });
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
}
