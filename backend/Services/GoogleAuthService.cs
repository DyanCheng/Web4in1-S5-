using Google.Apis.Auth;

namespace Backend.Services;

public class GoogleAuthService
{

    }

    public async Task<GoogleUserPayload> ValidateIdTokenAsync(string idToken)
    {

    }
}

public class GoogleUserPayload
{
    public string GoogleId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Picture { get; set; }
}
