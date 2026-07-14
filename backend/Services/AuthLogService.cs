using System.Net.Http.Json;
using System.Text.Json;
using Npgsql;

namespace Backend.Services;

public class AuthLogService
{
    private readonly string? _connectionString;
    private readonly string? _supabaseUrl;
    private readonly string? _supabaseKey;
    private readonly HttpClient _http;

    public AuthLogService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
        _supabaseUrl = TrimConfig(configuration, "SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
        _supabaseKey = TrimConfig(
            configuration,
            "SUPABASE_SERVICE_ROLE_KEY",
            "SUPABASE_KEY",
            "SUPABASE_ANON_KEY",
            "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
        _http = httpClientFactory.CreateClient("Supabase");
    }

    public Task LogLoginAsync(
        string email,
        string status,
        long? userId = null,
        string? ipAddress = null,
        string? userAgent = null) =>
        WriteLoginLogAsync(email, status, userId, ipAddress, userAgent);

    public Task LogRegistrationAsync(
        string email,
        string status,
        long? registeredUserId = null,
        string? ipAddress = null,
        string? userAgent = null) =>
        WriteRegistrationLogAsync(email, status, registeredUserId, ipAddress, userAgent);

    private async Task WriteLoginLogAsync(
        string email,
        string status,
        long? userId,
        string? ipAddress,
        string? userAgent)
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(_connectionString))
            {
                await using var conn = new NpgsqlConnection(_connectionString);
                await conn.OpenAsync();

                await using var cmd = new NpgsqlCommand(
                    """
                    INSERT INTO public.user_login_logs
                      (email_attempted, status, ip_address, user_agent, user_id)
                    VALUES
                      (@email, @status, @ipAddress, @userAgent, @userId)
                    """,
                    conn);
                cmd.Parameters.AddWithValue("email", email.Trim());
                cmd.Parameters.AddWithValue("status", status);
                cmd.Parameters.AddWithValue("ipAddress", (object?)ipAddress ?? DBNull.Value);
                cmd.Parameters.AddWithValue("userAgent", (object?)userAgent ?? DBNull.Value);
                cmd.Parameters.AddWithValue("userId", (object?)userId ?? DBNull.Value);
                await cmd.ExecuteNonQueryAsync();
                return;
            }

            await InsertViaSupabaseAsync("user_login_logs", new
            {
                email_attempted = email.Trim(),
                status,
                ip_address = ipAddress,
                user_agent = userAgent,
                user_id = userId,
            });
        }
        catch
        {
            // Auth logging must not block login/register.
        }
    }

    private async Task WriteRegistrationLogAsync(
        string email,
        string status,
        long? registeredUserId,
        string? ipAddress,
        string? userAgent)
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(_connectionString))
            {
                await using var conn = new NpgsqlConnection(_connectionString);
                await conn.OpenAsync();

                await using var cmd = new NpgsqlCommand(
                    """
                    INSERT INTO public.user_registration_logs
                      (email_attempted, status, ip_address, user_agent, registered_user_id)
                    VALUES
                      (@email, @status, @ipAddress, @userAgent, @registeredUserId)
                    """,
                    conn);
                cmd.Parameters.AddWithValue("email", email.Trim());
                cmd.Parameters.AddWithValue("status", status);
                cmd.Parameters.AddWithValue("ipAddress", (object?)ipAddress ?? DBNull.Value);
                cmd.Parameters.AddWithValue("userAgent", (object?)userAgent ?? DBNull.Value);
                cmd.Parameters.AddWithValue("registeredUserId", (object?)registeredUserId ?? DBNull.Value);
                await cmd.ExecuteNonQueryAsync();
                return;
            }

            await InsertViaSupabaseAsync("user_registration_logs", new
            {
                email_attempted = email.Trim(),
                status,
                ip_address = ipAddress,
                user_agent = userAgent,
                registered_user_id = registeredUserId,
            });
        }
        catch
        {
            // Auth logging must not block login/register.
        }
    }

    private async Task InsertViaSupabaseAsync(string table, object row)
    {
        if (string.IsNullOrWhiteSpace(_supabaseUrl) || string.IsNullOrWhiteSpace(_supabaseKey))
            return;

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{_supabaseUrl.TrimEnd('/')}/rest/v1/{table}")
        {
            Content = JsonContent.Create(row),
        };
        request.Headers.Add("apikey", _supabaseKey);
        request.Headers.Add("Authorization", $"Bearer {_supabaseKey}");
        request.Headers.Add("Prefer", "return=minimal");

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Failed to write {table}: {body}");
        }
    }

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
}
