using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Extensions;
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
        [Authorize(Roles = "admin,employee")]
        public async Task<IActionResult> GetAll()
        {
            var bookings = await _tourDb.GetAllBookingsAsync();
            return Ok(bookings);
        }

        [HttpGet("user/{email}")]
        [Authorize]
        public async Task<IActionResult> GetByUser(string email)
        {
            var callerEmail = User.GetUserEmail();
            var role = User.GetUserRole();
            if (!string.Equals(callerEmail, email, StringComparison.OrdinalIgnoreCase)
                && !string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            var userBookings = await _tourDb.GetBookingsByUserEmailAsync(email);
            return Ok(userBookings);
        }

        [HttpPost]
        [Authorize]
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

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _tourDb.DeleteBookingAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng này" });
            }

            return Ok(new { message = "Đã hủy đơn đặt tour thành công" });
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
