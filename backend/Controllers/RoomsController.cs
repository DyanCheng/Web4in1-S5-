using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using System.Linq;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly DataStoreService _dataStore;

        public RoomsController(DataStoreService dataStore)
        {
            _dataStore = dataStore;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll()
        {
            return Ok(_dataStore.Rooms);
        }

        [HttpPost]
        [Authorize(Roles = "admin,hotel_owner")]
        public IActionResult Create([FromBody] RoomRequest request)
        {
            var newRoom = new Room
            {
                Id = _dataStore.Rooms.Count > 0 ? _dataStore.Rooms.Max(r => r.Id) + 1 : 1,
                Name = request.Name,
                Type = request.Type,
                Price = request.Price,
                Beds = request.Beds,
                Guests = request.Guests,
                Status = "available"
            };

            _dataStore.Rooms.Add(newRoom);
            return Ok(newRoom);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,hotel_owner")]
        public IActionResult Update(int id, [FromBody] RoomRequest request)
        {
            var room = _dataStore.Rooms.FirstOrDefault(r => r.Id == id);
            if (room == null)
            {
                return NotFound(new { message = "Không tìm thấy phòng này" });
            }

            room.Name = request.Name;
            room.Type = request.Type;
            room.Price = request.Price;
            room.Beds = request.Beds;
            room.Guests = request.Guests;

            if (!string.IsNullOrEmpty(request.Status))
            {
                room.Status = request.Status;
            }

            return Ok(room);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,hotel_owner")]
        public IActionResult Delete(int id)
        {
            var room = _dataStore.Rooms.FirstOrDefault(r => r.Id == id);
            if (room == null)
            {
                return NotFound(new { message = "Không tìm thấy phòng này" });
            }

            _dataStore.Rooms.Remove(room);
            return Ok(new { message = "Đã xóa phòng thành công" });
        }
    }

    public class RoomRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Beds { get; set; }
        public int Guests { get; set; }
        public string? Status { get; set; }
    }
}
