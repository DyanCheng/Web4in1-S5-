using System;
using Backend.Extensions;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BusController : ControllerBase
    {
        private readonly IBusService _busService;

        public BusController(IBusService busService)
        {
            _busService = busService;
        }

        [HttpGet("trips")]
        [AllowAnonymous]
        public IActionResult GetAllTrips()
        {
            var trips = _busService.GetAllTrips();
            return Ok(new { success = true, data = trips });
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public IActionResult SearchTrips([FromQuery] string? from, [FromQuery] string? to, [FromQuery] DateTime? date)
        {
            var trips = _busService.SearchTrips(from, to, date);
            return Ok(new { success = true, data = trips });
        }

        [HttpGet("trips/{id}")]
        [AllowAnonymous]
        public IActionResult GetTripById(string id)
        {
            var trip = _busService.GetTripById(id);
            if (trip == null)
                return NotFound(new { success = false, message = "Không tìm thấy chuyến xe" });

            return Ok(new { success = true, data = trip });
        }

        [HttpGet("trips/{id}/seats")]
        [AllowAnonymous]
        public IActionResult GetAvailableSeats(string id)
        {
            var seats = _busService.GetAvailableSeats(id);
            return Ok(new { success = true, data = seats });
        }

        [HttpGet("location/{location}")]
        [AllowAnonymous]
        public IActionResult GetTripsByLocation(string location)
        {
            var trips = _busService.GetTripsByLocation(location);
            return Ok(new { success = true, data = trips });
        }

        [HttpPost("book")]
        [Authorize]
        public IActionResult BookTicket([FromBody] BookTicketRequest request)
        {
            try
            {
                var userId = User.GetUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { success = false, message = "Token không hợp lệ" });

                var booking = _busService.BookTicket(
                    request.TripId,
                    userId,
                    request.SeatNumber,
                    request.PassengerName,
                    request.PassengerPhone,
                    request.PassengerEmail
                );

                return Ok(new
                {
                    success = true,
                    data = booking,
                    message = "Đặt vé thành công!"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("my-bookings")]
        [Authorize]
        public IActionResult GetMyBookings()
        {
            var userId = User.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Token không hợp lệ" });

            var bookings = _busService.GetUserBookings(userId);
            return Ok(new { success = true, data = bookings });
        }

        [HttpDelete("cancel/{id}")]
        [Authorize]
        public IActionResult CancelBooking(string id)
        {
            try
            {
                var userId = User.GetUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { success = false, message = "Token không hợp lệ" });

                var result = _busService.CancelBooking(id, userId);
                if (!result)
                    return BadRequest(new { success = false, message = "Không thể hủy vé" });

                return Ok(new { success = true, message = "Hủy vé thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }

    public class BookTicketRequest
    {
        public string TripId { get; set; } = string.Empty;
        public string SeatNumber { get; set; } = string.Empty;
        public string PassengerName { get; set; } = string.Empty;
        public string PassengerPhone { get; set; } = string.Empty;
        public string? PassengerEmail { get; set; }
    }
}
