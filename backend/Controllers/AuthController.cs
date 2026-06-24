using Microsoft.AspNetCore.Mvc;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthDbService _authDb;
        private readonly GoogleAuthService _googleAuth;

        public AuthController(AuthDbService authDb, GoogleAuthService googleAuth)
        {
            _authDb = authDb;
            _googleAuth = googleAuth;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _authDb.LoginAsync(request.Email, request.Password);

                if (user == null)
                {
                    return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác" });
                }

                return Ok(new
                {
                    id = user.Id,
                    email = user.Email,
                    name = user.Name,
                    role = user.Role,
                    avatar = user.Avatar
                });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(503, new { message = ex.Message });
            }
            catch (AuthException ex)
            {
                return StatusCode(503, new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var newUser = await _authDb.RegisterAsync(request.Email, request.Password, request.Name);

                return Ok(new
                {
                    id = newUser.Id,
                    email = newUser.Email,
                    name = newUser.Name,
                    role = newUser.Role,
                    avatar = newUser.Avatar
                });
            }
            catch (AuthException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(503, new { message = ex.Message });
            }
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Credential))
                return BadRequest(new { message = "Thiếu thông tin xác thực Google" });

            try
            {
                var googleUser = await _googleAuth.ValidateIdTokenAsync(request.Credential);
                var user = await _authDb.LoginOrRegisterGoogleAsync(
                    googleUser.GoogleId,
                    googleUser.Email,
                    googleUser.Name,
                    googleUser.Picture);

                return Ok(new
                {
                    id = user.Id,
                    email = user.Email,
                    name = user.Name,
                    role = user.Role,
                    avatar = user.Avatar
                });
            }
            catch (AuthException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(503, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
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

    public class GoogleLoginRequest
    {
        public string Credential { get; set; } = string.Empty;
    }
}
