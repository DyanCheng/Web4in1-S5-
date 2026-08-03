using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using System;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelBookingsController : ControllerBase
    {
        private readonly HotelDbService _hotelDb;

        public HotelBookingsController(HotelDbService hotelDb)
        {
            _hotelDb = hotelDb;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(string userId)
        {
            var userBookings = await _hotelDb.GetUserBookingsAsync(userId);
            if (userBookings == null) return Ok(new object[0]);
            return Ok(userBookings);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var bookings = await _hotelDb.GetAllBookingsAsync();
            if (bookings == null) return Ok(new object[0]);
            return Ok(bookings);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] HotelBookingRequest request)
        {
            try
            {
                var newBooking = await _hotelDb.CreateBookingAsync(
                    request.HotelId,
                    request.HotelName,
                    request.HotelImage,
                    request.RoomId,
                    request.RoomName,
                    request.UserId,
                    request.UserEmail,
                    request.CheckInDate,
                    request.CheckOutDate,
                    request.RoomQuantity,
                    request.Adults,
                    request.Children,
                    request.TotalAmount,
                    request.TotalNights,
                    request.RoomPrice
                );

                return Ok(newBooking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.", error = ex.Message });
            }
        }

        [HttpPost("{id}/confirm")]
        public async Task<IActionResult> Confirm(string id)
        {
            var success = await _hotelDb.ConfirmBookingAsync(id);
            if (success == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng này" });
            }

            return Ok(new { message = "Đã duyệt đơn đặt phòng khách sạn thành công" });
        }
    }

    public class HotelBookingRequest
    {
        public string HotelId { get; set; } = string.Empty;
        public string HotelName { get; set; } = string.Empty;
        public string HotelImage { get; set; } = string.Empty;
        public string RoomId { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty; // Auth UUID
        public string UserEmail { get; set; } = string.Empty;
        public string CheckInDate { get; set; } = string.Empty;
        public string CheckOutDate { get; set; } = string.Empty;
        public int RoomQuantity { get; set; } = 1;
        public int Adults { get; set; } = 2;
        public int Children { get; set; } = 0;
        public decimal TotalAmount { get; set; }
        public int TotalNights { get; set; } = 1;
        public decimal RoomPrice { get; set; }
    }
}
