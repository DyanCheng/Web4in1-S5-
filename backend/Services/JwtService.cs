using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

public class JwtService
{
    private readonly string _secret;
    private readonly int _expiresInSeconds;

    public JwtService(IConfiguration configuration)
    {
        _secret = ResolveSecret(configuration);
        _expiresInSeconds = ParseExpiresIn(
            configuration["Jwt:ExpiresIn"]?.Trim()
            ?? configuration["JWT_EXPIRES_IN"]?.Trim());
    }

    public (string Token, int ExpiresIn) GenerateToken(AuthResult user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role),
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddSeconds(_expiresInSeconds),
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), _expiresInSeconds);
    }

    private static string ResolveSecret(IConfiguration configuration)
    {
        var secret = configuration["Jwt:Secret"]?.Trim()
            ?? configuration["JWT_SECRET"]?.Trim();

        if (!string.IsNullOrEmpty(secret) && secret != "#")
            return secret;

        var env = configuration["ASPNETCORE_ENVIRONMENT"];
        if (string.Equals(env, "Development", StringComparison.OrdinalIgnoreCase))
            return "cmc-travel-dev-jwt-secret-min-32-chars!!";

        throw new InvalidOperationException("JWT_SECRET is required in production");
    }

    private static int ParseExpiresIn(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value == "#")
            return 7 * 24 * 60 * 60;

        value = value.Trim().ToLowerInvariant();

        if (value.EndsWith('d') && int.TryParse(value[..^1], out var days))
            return days * 24 * 60 * 60;

        if (value.EndsWith('h') && int.TryParse(value[..^1], out var hours))
            return hours * 60 * 60;

        if (int.TryParse(value, out var seconds))
            return seconds;

        return 7 * 24 * 60 * 60;
    }
}
