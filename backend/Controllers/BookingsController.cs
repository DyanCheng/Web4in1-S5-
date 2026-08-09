using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using System;
using System.Linq;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly TourDbService _tourDb;

        public BookingsController(TourDbService tourDb)
        {
            _tourDb = tourDb;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var bookings = await _tourDb.GetAllBookingsAsync();
            return Ok(bookings);
        }

        [HttpGet("user/{email}")]
        public async Task<IActionResult> GetByUser(string email)
        {
            var userBookings = await _tourDb.GetBookingsByUserEmailAsync(email);
            return Ok(userBookings);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BookingRequest request)
        {
            try
            {
                var newBooking = await _tourDb.CreateBookingAsync(request);
                if (newBooking == null)
                {
                    return BadRequest(new { message = "Tour hoặc thông tin đặt phòng không hợp lệ" });
                }

                return Ok(newBooking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.", error = ex.Message });
            }
        }

        /// <summary>
        /// Customer cancel request → cancel_pending (requires ≥ 2 days before tour start).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var result = await _tourDb.RequestCancelBookingAsync(id);
                if (result == null)
                    return NotFound(new { message = "Không tìm thấy đơn hàng này" });

                return Ok(new
                {
                    message = result.Value.TryGetProperty("message", out var msg)
                        ? msg.GetString()
                        : "Đã gửi yêu cầu hủy. Chờ quản trị viên duyệt.",
                    status = result.Value.TryGetProperty("status", out var status)
                        ? status.GetString()
                        : "cancel_pending",
                });
            }
            catch (Exception ex)
            {
                var message = ExtractRpcMessage(ex.Message) ?? "Không thể hủy đơn đặt tour";
                if (message.Contains("Không tìm thấy", StringComparison.OrdinalIgnoreCase))
                    return NotFound(new { message });
                return BadRequest(new { message });
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> RequestCancel(string id) => await Delete(id);

        [HttpPost("{id}/accept-cancel")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "admin")]
        public async Task<IActionResult> AcceptCancel(string id)
        {
            try
            {
                var result = await _tourDb.AcceptCancelBookingAsync(id);
                if (result == null)
                    return NotFound(new { message = "Không tìm thấy đơn hàng này" });

                return Ok(new
                {
                    message = result.Value.TryGetProperty("message", out var msg)
                        ? msg.GetString()
                        : "Đã duyệt hủy đơn đặt tour",
                    status = "cancelled",
                });
            }
            catch (Exception ex)
            {
                var message = ExtractRpcMessage(ex.Message) ?? "Không thể duyệt hủy";
                return BadRequest(new { message });
            }
        }

        [HttpPost("{id}/confirm")]
        public async Task<IActionResult> Confirm(string id)
        {
            var success = await _tourDb.ConfirmBookingAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng này" });
            }

            return Ok(new { message = "Đã duyệt đơn đặt tour thành công" });
        }

        private static string? ExtractRpcMessage(string raw)
        {
            try
            {
                var jsonStart = raw.IndexOf('{');
                if (jsonStart >= 0)
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(raw[jsonStart..]);
                    if (doc.RootElement.TryGetProperty("message", out var message))
                        return message.GetString();
                }
            }
            catch { }

            const string marker = "failed: ";
            var idx = raw.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
            return idx >= 0 ? raw[(idx + marker.Length)..].Trim() : raw;
        }
    }

    public class BookingRequest
    {
        public string TourId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public int Guests { get; set; }
        public int Quantity { get; set; } = 1;
        public string TourTitle { get; set; } = string.Empty;
        public string TourImage { get; set; } = string.Empty;
        public decimal? Total { get; set; }
    }
}
