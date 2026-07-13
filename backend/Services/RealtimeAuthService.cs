using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Backend.Services;

/// <summary>
/// Issues Supabase Auth access tokens for Realtime private channels.
/// Requires SUPABASE_URL, SUPABASE_KEY (anon), and SUPABASE_SERVICE_ROLE_KEY.
/// </summary>
public class RealtimeAuthService
{
    //URL của Supabase
    private readonly string? _supabaseUrl;
    private readonly string? _supabaseKey;
    private readonly string? _serviceRoleKey;
    private readonly HttpClient _http;

    public RealtimeAuthService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _supabaseUrl = TrimConfig(configuration, "SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
        _supabaseKey = TrimConfig(
            configuration,
            "SUPABASE_KEY",
            "SUPABASE_ANON_KEY",
            "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
        _serviceRoleKey = TrimConfig(configuration, "SUPABASE_SERVICE_ROLE_KEY");
        _http = httpClientFactory.CreateClient("Supabase"); //Tạo client HTTP để gửi yêu cầu đến Supabase
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(_supabaseKey); //Kiểm tra xem Supabase đã được cấu hình chưa

    public bool HasServiceRole => !string.IsNullOrWhiteSpace(_serviceRoleKey); //Kiểm tra xem có service role không

    //Phát hành token Auth JWT cho Realtime
    public async Task<RealtimeAccessToken?> IssueTokenAsync(
        string email,
        string userId,
        string name,
        string role,
        string? password = null)
    {
        if (!IsConfigured)
            return null;

        if (!string.IsNullOrWhiteSpace(password))
        {
            if (HasServiceRole) //Kiểm tra xem có service role không
                await EnsureAuthUserAsync(email, password, userId, name, role);

            return await RequestPasswordTokenAsync(email, password); //Gửi yêu cầu đến Supabase để lấy token Auth JWT
        }

        if (!HasServiceRole)
            return null; 

        var syncPassword = BuildInternalSyncPassword(userId);
        await EnsureAuthUserAsync(email, syncPassword, userId, name, role);
        return await RequestPasswordTokenAsync(email, syncPassword);
    }

    //Tạo password sync cho người dùng
    private string BuildInternalSyncPassword(string userId)
    {
        // Mật khẩu sync cố định cho Google/OAuth user — không lộ cho client
        var key = Encoding.UTF8.GetBytes(_serviceRoleKey!);
        using var hmac = new HMACSHA256(key);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes($"cmc-realtime-sync:{userId}"));
        return $"{Convert.ToBase64String(hash)}!Aa1";
    }

    //Gửi yêu cầu đến Supabase để lấy token Auth JWT
    private async Task<RealtimeAccessToken?> RequestPasswordTokenAsync(string email, string password)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{_supabaseUrl!.TrimEnd('/')}/auth/v1/token?grant_type=password")
        {
            Content = JsonContent.Create(new { email = email.Trim(), password }),
        };
        AddSupabaseHeaders(request, _supabaseKey!);

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return null;

        var payload = await response.Content.ReadFromJsonAsync<SupabaseTokenResponse>();
        if (string.IsNullOrWhiteSpace(payload?.AccessToken))
            return null;

        return new RealtimeAccessToken
        {
            AccessToken = payload.AccessToken,
            ExpiresAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds() + payload.ExpiresIn,
        };
    }

    //Đảm bảo người dùng đã được đăng ký trong Supabase
    private async Task EnsureAuthUserAsync(
        string email,
        string password,
        string userId,
        string name,
        string role)
    {
        var existingId = await FindAuthUserIdByEmailAsync(email);
        if (existingId != null)
        {
            await UpdateAuthUserAsync(existingId, email, password, userId, name, role);
            return;
        }

        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{_supabaseUrl!.TrimEnd('/')}/auth/v1/admin/users")
        {
            Content = JsonContent.Create(new
            {
                email = email.Trim(),
                password,
                email_confirm = true,
                user_metadata = BuildUserMetadata(userId, name, role),
            }),
        };
        AddSupabaseHeaders(request, _serviceRoleKey!);
        await _http.SendAsync(request);
    }

    //Cập nhật thông tin người dùng trong Supabase
    private async Task UpdateAuthUserAsync(
        string authUserId,
        string email,
        string password,
        string userId,
        string name,
        string role)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Put,
            $"{_supabaseUrl!.TrimEnd('/')}/auth/v1/admin/users/{authUserId}")
        {
            Content = JsonContent.Create(new
            {
                email = email.Trim(),
                password,
                email_confirm = true,
                user_metadata = BuildUserMetadata(userId, name, role),
            }),
        };
        AddSupabaseHeaders(request, _serviceRoleKey!);
        await _http.SendAsync(request);
    }

    //Tạo metadata cho người dùng
    private static object BuildUserMetadata(string userId, string name, string role) =>
        new { user_id = userId, name, app_role = role };

    //Tìm kiếm id người dùng trong Supabase dựa vào email
    private async Task<string?> FindAuthUserIdByEmailAsync(string email)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"{_supabaseUrl!.TrimEnd('/')}/auth/v1/admin/users?email={Uri.EscapeDataString(email.Trim())}");
        AddSupabaseHeaders(request, _serviceRoleKey!);

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return null;

        var payload = await response.Content.ReadFromJsonAsync<SupabaseAdminUsersResponse>();
        return payload?.Users?.FirstOrDefault()?.Id;
    }

    //Thêm headers cho yêu cầu đến Supabase
    private static void AddSupabaseHeaders(HttpRequestMessage request, string apiKey)
    {
        request.Headers.Add("apikey", apiKey);
        request.Headers.Add("Authorization", $"Bearer {apiKey}");
    }

    //Cắt cấu hình cho Supabase
    private static string? TrimConfig(IConfiguration configuration, params string[] keys)
    {
        foreach (var key in keys)
        {
            var value = configuration[key]?.Trim().Trim('"');
            if (!string.IsNullOrWhiteSpace(value) && value is not "#")
                return value;
        }

        return null;
    }

    //Response cho token Auth JWT
    private sealed class SupabaseTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; } = 3600;
    }

    //Response cho user trong Supabase
    private sealed class SupabaseAdminUserResponse
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
    }

    private sealed class SupabaseAdminUsersResponse
    {
        [JsonPropertyName("users")]
        public List<SupabaseAdminUserResponse>? Users { get; set; }
    }
}
//Response cho token Auth JWT
public sealed class RealtimeAccessToken
{
    public required string AccessToken { get; init; }
    public required long ExpiresAt { get; init; }
}
