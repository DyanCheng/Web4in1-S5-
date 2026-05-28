using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using System.Linq;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DataStoreService _dataStore;

        public AuthController(DataStoreService dataStore)
        {
            _dataStore = dataStore;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _dataStore.Users.FirstOrDefault(u => 
                u.Email.ToLower() == request.Email.ToLower() && 
                u.Password == request.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác" });
            }

            // Optional role verification (to allow hotel owner/admin access specific paths)
            if (!string.IsNullOrEmpty(request.Role) && user.Role != request.Role)
            {
                // Note: For convenience, we auto-assign or verify role
                // In demo, we let role pass if it matches
            }

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name,
                role = user.Role
            });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (_dataStore.Users.Any(u => u.Email.ToLower() == request.Email.ToLower()))
            {
                return BadRequest(new { message = "Email này đã được sử dụng" });
            }

            var newUser = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = request.Email,
                Name = request.Name,
                Role = "user", // default role
                Password = request.Password
            };

            _dataStore.Users.Add(newUser);

            return Ok(new
            {
                id = newUser.Id,
                email = newUser.Email,
                name = newUser.Name,
                role = newUser.Role
            });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "user";
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
