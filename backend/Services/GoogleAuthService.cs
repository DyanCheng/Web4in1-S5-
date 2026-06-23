using Google.Apis.Auth;

namespace Backend.Services;

public class GoogleAuthService
{
    private readonly string? _clientId;

    public GoogleAuthService(IConfiguration configuration)
    {
        _clientId = configuration["GOOGLE_CLIENT_ID"] ?? configuration["Google:ClientId"];
    }

    public async Task<GoogleUserPayload> ValidateIdTokenAsync(string idToken)
    {
        if (string.IsNullOrWhiteSpace(_clientId))
            throw new InvalidOperationException("GOOGLE_CLIENT_ID is not configured.");

        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _clientId }
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
}

public class GoogleUserPayload
{
    public string GoogleId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Picture { get; set; }
}
