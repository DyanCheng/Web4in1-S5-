using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.Services;

using Backend.Models;
using System.Linq;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToursController : ControllerBase
    {
        private readonly TourDbService _tourDb;

        public ToursController(TourDbService tourDb)
        {
            _tourDb = tourDb;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? destination)
        {
            var tours = await _tourDb.GetAllToursAsync(destination);
            return Ok(tours);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "admin,accountant")]
        public async Task<IActionResult> GetAllAdmin([FromQuery] string? destination)
        {
            var tours = await _tourDb.GetAllToursAdminAsync(destination);
            return Ok(tours);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var tour = await _tourDb.GetTourByIdAsync(id);
            if (tour == null)
            {
                return NotFound(new { message = "Không tìm thấy tour này" });
            }

            return Ok(tour);
        }

        [HttpPost]
        [Authorize(Roles = "admin,accountant")]
        public async Task<IActionResult> Create([FromBody] TourRequest request)
        {

            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest(new { message = "Tên tour không được để trống" });

            var tour = await _tourDb.CreateTourAsync(request);
            if (tour == null)
                return BadRequest(new { message = "Thêm tour thất bại" });

            return Ok(tour);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,accountant")]
        public async Task<IActionResult> Update(string id, [FromBody] TourRequest request)
        {

            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest(new { message = "Tên tour không được để trống" });

            var tour = await _tourDb.UpdateTourAsync(id, request);
            if (tour == null)
                return NotFound(new { message = "Không tìm thấy tour này hoặc cập nhật thất bại" });

            return Ok(tour);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,accountant")]
        public async Task<IActionResult> Delete(string id)
        {

            var success = await _tourDb.DeleteTourAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy tour này" });

            return Ok(new { message = "Đã xóa tour thành công" });
        }

        [HttpPatch("{id}/toggle-status")]
        [Authorize(Roles = "admin,accountant")]
        public async Task<IActionResult> ToggleStatus(string id)
        {
            var success = await _tourDb.ToggleTourStatusAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy tour này" });

            return Ok(new { message = "Đã cập nhật trạng thái tour thành công" });
        }
    }

    public class TourRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal ChildPrice { get; set; }
        public string Duration { get; set; } = string.Empty;
        public int DurationDays { get; set; } = 1;
        public int DurationNights { get; set; }
        public string Image { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int Reviews { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<string>? Highlights { get; set; }
        public List<string>? Included { get; set; }
        public List<string>? Excluded { get; set; }
        public List<TourItineraryDay>? Itinerary { get; set; }
    }
}
