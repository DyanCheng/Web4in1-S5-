using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase
    {
        private readonly HotelDbService _hotelDbService;

        public HotelsController(HotelDbService hotelDbService)
        {
            _hotelDbService = hotelDbService;
        }

        [HttpGet]
        public async Task<IActionResult> GetHotels()
        {
            var hotels = await _hotelDbService.GetHotelsAsync();
            return Ok(hotels);
        }

        [HttpGet("{hotelId}/rooms")]
        public async Task<IActionResult> GetHotelRooms(string hotelId)
        {
            var rooms = await _hotelDbService.GetHotelRoomsAsync(hotelId);
            return Ok(rooms);
        }
    }
}
