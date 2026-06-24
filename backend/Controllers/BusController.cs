using System;
using Backend.Models;
using Backend.Services;
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

        // GET: api/bus/trips
        [HttpGet("trips")]
        public IActionResult GetAllTrips()
        {
            var trips = _busService.GetAllTrips();
            return Ok(new { success = true, data = trips });
        }

        // GET: api/bus/search?from=Hà Nội&to=Đà Nẵng&date=2026-01-01
        [HttpGet("search")]
        public IActionResult SearchTrips([FromQuery] string? from, [FromQuery] string? to, [FromQuery] DateTime? date)
        {
            var trips = _busService.SearchTrips(from, to, date);
            return Ok(new { success = true, data = trips });
        }

        // GET: api/bus/trips/{id}
        [HttpGet("trips/{id}")]
        public IActionResult GetTripById(string id)
        {
            var trip = _busService.GetTripById(id);
            if (trip == null)
                return NotFound(new { success = false, message = "Không tìm thấy chuyến xe" });

            return Ok(new { success = true, data = trip });
        }

        // GET: api/bus/trips/{id}/seats
        [HttpGet("trips/{id}/seats")]
        public IActionResult GetAvailableSeats(string id)
        {
            var seats = _busService.GetAvailableSeats(id);
            return Ok(new { success = true, data = seats });
        }

        // GET: api/bus/location/{location}
        [HttpGet("location/{location}")]
        public IActionResult GetTripsByLocation(string location)
        {
            var trips = _busService.GetTripsByLocation(location);
            return Ok(new { success = true, data = trips });
        }

        // POST: api/bus/book
        [HttpPost("book")]
        public IActionResult BookTicket([FromBody] BookTicketRequest request)
        {
            try
            {
                // TODO: Lấy UserId từ JWT token, tạm thời dùng user mặc định
                var userId = "3";

                var booking = _busService.BookTicket(
                    request.TripId,
                    userId,
                    request.SeatNumber,
                    request.PassengerName,
                    request.PassengerPhone,
                    request.PassengerEmail
                );

                return Ok(new { 
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

        // GET: api/bus/my-bookings
        [HttpGet("my-bookings")]
        public IActionResult GetMyBookings()
        {
            // TODO: Lấy UserId từ JWT token
            var userId = "3";
            var bookings = _busService.GetUserBookings(userId);
            return Ok(new { success = true, data = bookings });
        }

        // DELETE: api/bus/cancel/{id}
        [HttpDelete("cancel/{id}")]
        public IActionResult CancelBooking(string id)
        {
            try
            {
                // TODO: Lấy UserId từ JWT token
                var userId = "3";
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