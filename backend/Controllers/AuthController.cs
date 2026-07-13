using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthDbService _authDb;
    private readonly GoogleAuthService _googleAuth;
    private readonly RealtimeAuthService _realtimeAuth;
    private readonly AuthLogService _authLog;

    public AuthController(
        AuthDbService authDb,
        GoogleAuthService googleAuth,
        RealtimeAuthService realtimeAuth,
        AuthLogService authLog)
    {
        _authDb = authDb;
        _googleAuth = googleAuth;
        _realtimeAuth = realtimeAuth;
        _authLog = authLog;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ipAddress = GetClientIp();
        var userAgent = GetUserAgent();

        try
        {
            var user = await _authDb.LoginAsync(request.Email, request.Password);
            if (user == null)
            {
                await _authLog.LogLoginAsync(
                    request.Email,
                    "failed",
                    ipAddress: ipAddress,
                    userAgent: userAgent);
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác" });
            }

            await _authLog.LogLoginAsync(
                request.Email,
                "success",
                userId: ParseUserId(user.Id),
                ipAddress: ipAddress,
                userAgent: userAgent);

            return Ok(await BuildAuthResponseAsync(user, request.Password));
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
        var ipAddress = GetClientIp();
        var userAgent = GetUserAgent();

        try
        {
            var newUser = await _authDb.RegisterAsync(request.Email, request.Password, request.Name);

            await _authLog.LogRegistrationAsync(
                request.Email,
                "success",
                registeredUserId: ParseUserId(newUser.Id),
                ipAddress: ipAddress,
                userAgent: userAgent);

            return Ok(await BuildAuthResponseAsync(newUser, request.Password));
        }
        catch (AuthException ex)
        {
            await _authLog.LogRegistrationAsync(
                request.Email,
                "failed",
                ipAddress: ipAddress,
                userAgent: userAgent);
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

        var ipAddress = GetClientIp();
        var userAgent = GetUserAgent();
        string? googleEmail = null;

        try
        {
            var googleUser = await _googleAuth.ValidateIdTokenAsync(request.Credential);
            googleEmail = googleUser.Email;
            var user = await _authDb.LoginOrRegisterGoogleAsync(
                googleUser.GoogleId,
                googleUser.Email,
                googleUser.Name,
                googleUser.Picture);

            await _authLog.LogLoginAsync(
                googleUser.Email,
                "success",
                userId: ParseUserId(user.Id),
                ipAddress: ipAddress,
                userAgent: userAgent);

            return Ok(await BuildAuthResponseAsync(user));
        }
        catch (AuthException ex)
        {
            await _authLog.LogLoginAsync(
                googleEmail ?? "google",
                "failed",
                ipAddress: ipAddress,
                userAgent: userAgent);
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

    [HttpPost("realtime-token")]
    public async Task<IActionResult> RefreshRealtimeToken([FromBody] RealtimeTokenRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Id) || string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Thiếu thông tin người dùng" });

        try
        {
            var user = await _authDb.GetUserByIdAndEmailAsync(request.Id, request.Email);
            if (user == null)
                return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ" });

            var token = await _realtimeAuth.IssueTokenAsync(
                user.Email,
                user.Id,
                user.Name,
                user.Role,
                request.Password);

            if (token == null)
            {
                return StatusCode(503, new
                {
                    message = "Không thể tạo token Realtime. Kiểm tra SUPABASE_SERVICE_ROLE_KEY và đăng nhập lại.",
                });
            }

            return Ok(new
            {
                accessToken = token.AccessToken,
                tokenExpiresAt = token.ExpiresAt,
            });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
    }

    private async Task<object> BuildAuthResponseAsync(AuthResult user, string? password = null)
    {
        var token = await _realtimeAuth.IssueTokenAsync(
            user.Email,
            user.Id,
            user.Name,
            user.Role,
            password);

        return new
        {
            id = user.Id,
            email = user.Email,
            name = user.Name,
            role = user.Role,
            avatar = user.Avatar,
            accessToken = token?.AccessToken,
            tokenExpiresAt = token?.ExpiresAt,
            realtimeConfigured = token != null,
        };
    }

    private string? GetClientIp()
    {
        var forwarded = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwarded))
            return forwarded.Split(',')[0].Trim();

        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private string? GetUserAgent() =>
        Request.Headers.UserAgent.ToString();

    private static long? ParseUserId(string? userId) =>
        long.TryParse(userId, out var parsed) ? parsed : null;
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

public class RealtimeTokenRequest
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
}
