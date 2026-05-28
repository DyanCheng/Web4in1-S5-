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
        private readonly DataStoreService _dataStore;

        public BookingsController(DataStoreService dataStore)
        {
            _dataStore = dataStore;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_dataStore.Bookings);
        }

        [HttpGet("user/{email}")]
        public IActionResult GetByUser(string email)
        {
            var userBookings = _dataStore.Bookings
                .Where(b => b.UserEmail.ToLower() == email.ToLower())
                .ToList();
            return Ok(userBookings);
        }

        [HttpPost]
        public IActionResult Create([FromBody] BookingRequest request)
        {
            var tour = _dataStore.Tours.FirstOrDefault(t => t.Id == request.TourId);
            if (tour == null)
            {
                return BadRequest(new { message = "Tour không hợp lệ" });
            }

            var newBooking = new Booking
            {
                Id = "ORD-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                TourId = request.TourId,
                TourTitle = tour.Title,
                TourImage = tour.Image,
                UserId = request.UserId,
                UserEmail = request.UserEmail,
                Date = request.Date,
                Guests = request.Guests,
                Total = tour.Price * request.Guests * request.Quantity,
                Status = "pending"
            };

            _dataStore.Bookings.Insert(0, newBooking); // Prepend to show at top

            return Ok(newBooking);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            var booking = _dataStore.Bookings.FirstOrDefault(b => b.Id == id);
            if (booking == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng này" });
            }

            _dataStore.Bookings.Remove(booking);
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
    }
}
