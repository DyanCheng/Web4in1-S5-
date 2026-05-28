using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using System.Linq;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToursController : ControllerBase
    {
        private readonly DataStoreService _dataStore;

        public ToursController(DataStoreService dataStore)
        {
            _dataStore = dataStore;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] string? destination)
        {
            var tours = _dataStore.Tours.AsQueryable();

            if (!string.IsNullOrEmpty(destination))
            {
                var destLower = destination.ToLower();
                tours = tours.Where(t => t.Location.ToLower().Contains(destLower) || t.Title.ToLower().Contains(destLower));
            }

            return Ok(tours.ToList());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            var tour = _dataStore.Tours.FirstOrDefault(t => t.Id == id);
            if (tour == null)
            {
                return NotFound(new { message = "Không tìm thấy tour này" });
            }
            return Ok(tour);
        }
    }
}
