using Google.Apis.Auth;

namespace Backend.Services;

public class GoogleAuthService
{
    private readonly string[] _clientIds;

    public GoogleAuthService(IConfiguration configuration)
    {
        _clientIds = new[]
            {
                configuration["GOOGLE_CLIENT_ID"],
                configuration["NEXT_PUBLIC_GOOGLE_CLIENT_ID"],
                configuration["Google:ClientId"],
            }
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id!.Trim())
            .Distinct(StringComparer.Ordinal)
            .ToArray();
    }

    public async Task<GoogleUserPayload> ValidateIdTokenAsync(string idToken)
    {
        if (_clientIds.Length == 0)
            throw new InvalidOperationException("GOOGLE_CLIENT_ID is not configured.");

        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = _clientIds
            });

            if (string.IsNullOrWhiteSpace(payload.Subject) || string.IsNullOrWhiteSpace(payload.Email))
                throw new AuthException("Thông tin tài khoản Google không hợp lệ");

            return new GoogleUserPayload
            {
                GoogleId = payload.Subject,
                Email = payload.Email,
                Name = payload.Name ?? payload.Email.Split('@')[0],
                Picture = payload.Picture
            };
        }
        catch (InvalidJwtException)
        {
            throw new AuthException(
                "Xác thực Google thất bại. Đảm bảo GOOGLE_CLIENT_ID trên Railway khớp với NEXT_PUBLIC_GOOGLE_CLIENT_ID trên Vercel.");
        }
    }
}

public class GoogleUserPayload
{
    public string GoogleId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Picture { get; set; }
}
