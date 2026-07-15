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
    }

    public class HotelBookingRequest
    {
        public long HotelId { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string HotelImage { get; set; } = string.Empty;
        public long RoomId { get; set; }
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
