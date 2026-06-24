using System.Net.Http.Json;
using System.Text.Json;
using Npgsql;

namespace Backend.Services;

public class AuthDbService
{
    private readonly string? _connectionString;
    private readonly string? _supabaseUrl;
    private readonly string? _supabaseKey;
    private readonly HttpClient _http;

    public AuthDbService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");

        _supabaseUrl = TrimConfig(configuration, "SUPABASE_URL", "Supabase:Url", "NEXT_PUBLIC_SUPABASE_URL");
        _supabaseKey = TrimConfig(
            configuration,
            "SUPABASE_KEY",
            "SUPABASE_ANON_KEY",
            "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
            "Supabase:Key");
        _http = httpClientFactory.CreateClient("Supabase");
    }

    private static string? TrimConfig(IConfiguration configuration, params string[] keys)
    {
        foreach (var key in keys)
        {
            var value = configuration[key]?.Trim();
            if (!string.IsNullOrWhiteSpace(value))
                return value;
        }

        return null;
    }

    public async Task<AuthResult?> LoginAsync(string email, string password)
    {
        if (!string.IsNullOrWhiteSpace(_connectionString))
            return await LoginViaDatabaseAsync(email, password);

        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(_supabaseKey))
            return await LoginViaSupabaseRpcAsync(email, password);

        throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection or SUPABASE_URL + SUPABASE_KEY.");
    }

    public async Task<AuthResult> RegisterAsync(string email, string password, string name)
    {
        if (!string.IsNullOrWhiteSpace(_connectionString))
            return await RegisterViaDatabaseAsync(email, password, name);

        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(_supabaseKey))
            return await RegisterViaSupabaseRpcAsync(email, password, name);

        throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection or SUPABASE_URL + SUPABASE_KEY.");
    }

    public async Task<AuthResult> LoginOrRegisterGoogleAsync(string googleId, string email, string fullName, string? avatarUrl)
    {
        if (!string.IsNullOrWhiteSpace(_connectionString))
            return await LoginOrRegisterGoogleViaDatabaseAsync(googleId, email, fullName, avatarUrl);

        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(_supabaseKey))
            return await LoginOrRegisterGoogleViaSupabaseRpcAsync(googleId, email, fullName, avatarUrl);

        throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection or SUPABASE_URL + SUPABASE_KEY.");
    }

    private async Task<AuthResult> LoginOrRegisterGoogleViaSupabaseRpcAsync(
        string googleId, string email, string fullName, string? avatarUrl)
    {
        var response = await PostRpcAsync("login_or_register_google", new
        {
            p_google_id = googleId,
            p_email = email.Trim(),
            p_full_name = fullName.Trim(),
            p_avatar_url = avatarUrl
        });

        if (response == null)
            throw new AuthException("Đăng nhập Google thất bại");

        return MapRpcResult(response.Value);
    }

    private async Task<AuthResult> LoginOrRegisterGoogleViaDatabaseAsync(
        string googleId, string email, string fullName, string? avatarUrl)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            long userId;

            await using (var findGoogleCmd = new NpgsqlCommand(
                "SELECT user_id FROM public.user_auth WHERE provider = 'google' AND provider_key = @googleId LIMIT 1",
                conn, tx))
            {
                findGoogleCmd.Parameters.AddWithValue("googleId", googleId);
                var result = await findGoogleCmd.ExecuteScalarAsync();
                if (result != null)
                {
                    userId = Convert.ToInt64(result);
                    await UpdateGoogleProfileAsync(conn, tx, userId, email, fullName, avatarUrl);
                    await UpdateGoogleLoginAsync(conn, tx, userId);
                }
                else
                {
                    await using var findEmailCmd = new NpgsqlCommand(
                        "SELECT user_id FROM public.users WHERE LOWER(email) = LOWER(@email) LIMIT 1", conn, tx);
                    findEmailCmd.Parameters.AddWithValue("email", email.Trim());
                    var emailResult = await findEmailCmd.ExecuteScalarAsync();

                    if (emailResult != null)
                    {
                        userId = Convert.ToInt64(emailResult);
                        await UpdateGoogleProfileAsync(conn, tx, userId, email, fullName, avatarUrl);
                        await using var linkCmd = new NpgsqlCommand(
                            """
                            INSERT INTO public.user_auth (user_id, provider, provider_key, password_hash)
                            SELECT @userId, 'google', @googleId, NULL
                            WHERE NOT EXISTS (
                              SELECT 1 FROM public.user_auth WHERE user_id = @userId AND provider = 'google'
                            )
                            """, conn, tx);
                        linkCmd.Parameters.AddWithValue("userId", userId);
                        linkCmd.Parameters.AddWithValue("googleId", googleId);
                        await linkCmd.ExecuteNonQueryAsync();
                    }
                    else
                    {
                        await using var userCmd = new NpgsqlCommand(
                            """
                            INSERT INTO public.users (full_name, email, avatar_url, status)
                            VALUES (@name, @email, @avatarUrl, 'active')
                            RETURNING user_id
                            """, conn, tx);
                        userCmd.Parameters.AddWithValue("name", fullName.Trim());
                        userCmd.Parameters.AddWithValue("email", email.Trim());
                        userCmd.Parameters.AddWithValue("avatarUrl", (object?)avatarUrl ?? DBNull.Value);
                        userId = Convert.ToInt64(await userCmd.ExecuteScalarAsync());

                        await using var authCmd = new NpgsqlCommand(
                            "INSERT INTO public.user_auth (user_id, provider, provider_key) VALUES (@userId, 'google', @googleId)",
                            conn, tx);
                        authCmd.Parameters.AddWithValue("userId", userId);
                        authCmd.Parameters.AddWithValue("googleId", googleId);
                        await authCmd.ExecuteNonQueryAsync();

                        await using var roleCmd = new NpgsqlCommand(
                            "INSERT INTO public.user_roles (user_id, role_id) VALUES (@userId, 3)", conn, tx);
                        roleCmd.Parameters.AddWithValue("userId", userId);
                        await roleCmd.ExecuteNonQueryAsync();
                    }
                }
            }

            await tx.CommitAsync();
            return await GetUserByIdAsync(conn, userId);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    private static async Task UpdateGoogleProfileAsync(
        NpgsqlConnection conn, NpgsqlTransaction tx, long userId, string email, string fullName, string? avatarUrl)
    {
        await using var cmd = new NpgsqlCommand(
            """
            UPDATE public.users
            SET full_name = COALESCE(NULLIF(@name, ''), full_name),
                email = COALESCE(NULLIF(@email, ''), email),
                avatar_url = COALESCE(NULLIF(@avatarUrl, ''), avatar_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = @userId
            """, conn, tx);
        cmd.Parameters.AddWithValue("userId", userId);
        cmd.Parameters.AddWithValue("name", fullName.Trim());
        cmd.Parameters.AddWithValue("email", email.Trim());
        cmd.Parameters.AddWithValue("avatarUrl", (object?)avatarUrl ?? DBNull.Value);
        await cmd.ExecuteNonQueryAsync();
    }

    private static async Task UpdateGoogleLoginAsync(NpgsqlConnection conn, NpgsqlTransaction tx, long userId)
    {
        await using var cmd = new NpgsqlCommand(
            "UPDATE public.user_auth SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = @userId AND provider = 'google'",
            conn, tx);
        cmd.Parameters.AddWithValue("userId", userId);
        await cmd.ExecuteNonQueryAsync();
    }

    private static async Task<AuthResult> GetUserByIdAsync(NpgsqlConnection conn, long userId)
    {
        const string sql = """
            SELECT u.user_id, u.email, u.full_name, u.avatar_url, r.role_name
            FROM public.users u
            LEFT JOIN public.user_roles ur ON u.user_id = ur.user_id
            LEFT JOIN public.roles r ON ur.role_id = r.role_id
            WHERE u.user_id = @userId
            LIMIT 1
            """;

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("userId", userId);
        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            throw new AuthException("Không tìm thấy người dùng");

        return new AuthResult
        {
            Id = reader.GetInt64(0).ToString(),
            Email = reader.GetString(1),
            Name = reader.GetString(2),
            Avatar = reader.IsDBNull(3) ? null : reader.GetString(3),
            Role = MapRole(reader.IsDBNull(4) ? "CUSTOMER" : reader.GetString(4))
        };
    }

    private async Task<AuthResult?> LoginViaSupabaseRpcAsync(string email, string password)
    {
        var response = await PostRpcAsync("login_user", new { p_email = email.Trim(), p_password = password });
        if (response == null)
            return null;

        return MapRpcResult(response.Value);
    }

    private async Task<AuthResult> RegisterViaSupabaseRpcAsync(string email, string password, string name)
    {
        try
        {
            var response = await PostRpcAsync("register_user", new
            {
                p_email = email.Trim(),
                p_password = password,
                p_name = name.Trim()
            });

            if (response == null)
                throw new AuthException("Đăng ký thất bại");

            return MapRpcResult(response.Value);
        }
        catch (AuthException)
        {
            throw;
        }
    }

    private async Task<JsonElement?> PostRpcAsync(string functionName, object body)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{_supabaseUrl!.TrimEnd('/')}/rest/v1/rpc/{functionName}")
        {
            Content = JsonContent.Create(body)
        };
        request.Headers.Add("apikey", _supabaseKey);
        request.Headers.Add("Authorization", $"Bearer {_supabaseKey}");

        var response = await _http.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            var message = ParseSupabaseError(content);
            throw new AuthException(message);
        }

        if (string.IsNullOrWhiteSpace(content) || content == "null")
            return null;

        using var doc = JsonDocument.Parse(content);
        return doc.RootElement.Clone();
    }

    private static AuthResult MapRpcResult(JsonElement data)
    {
        var roleName = data.TryGetProperty("role_name", out var roleProp)
            ? roleProp.GetString() ?? "CUSTOMER"
            : "CUSTOMER";

        return new AuthResult
        {
            Id = data.GetProperty("user_id").GetInt64().ToString(),
            Email = data.GetProperty("email").GetString() ?? string.Empty,
            Name = data.GetProperty("full_name").GetString() ?? string.Empty,
            Role = MapRole(roleName),
            Avatar = data.TryGetProperty("avatar_url", out var avatar) && avatar.ValueKind != JsonValueKind.Null
                ? avatar.GetString()
                : null
        };
    }

    private static string ParseSupabaseError(string content)
    {
        try
        {
            using var doc = JsonDocument.Parse(content);
            if (doc.RootElement.TryGetProperty("message", out var message))
                return message.GetString() ?? "Yêu cầu thất bại";
        }
        catch
        {
            // fall through
        }

        return content;
    }

    private async Task<AuthResult?> LoginViaDatabaseAsync(string email, string password)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        const string sql = """
            SELECT u.user_id, u.email, u.full_name, u.avatar_url, u.status,
                   ua.password_hash, r.role_name
            FROM public.user_auth ua
            JOIN public.users u ON ua.user_id = u.user_id
            LEFT JOIN public.user_roles ur ON u.user_id = ur.user_id
            LEFT JOIN public.roles r ON ur.role_id = r.role_id
            WHERE ua.provider = 'local'
              AND LOWER(ua.provider_key) = LOWER(@email)
            LIMIT 1
            """;

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("email", email.Trim());

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        var status = reader.GetString(reader.GetOrdinal("status"));
        if (status != "active")
            return null;

        var passwordHash = reader.IsDBNull(reader.GetOrdinal("password_hash"))
            ? null
            : reader.GetString(reader.GetOrdinal("password_hash"));

        if (passwordHash == null || !BCrypt.Net.BCrypt.Verify(password, passwordHash))
            return null;

        var userId = reader.GetInt64(reader.GetOrdinal("user_id"));
        var userEmail = reader.GetString(reader.GetOrdinal("email"));
        var fullName = reader.GetString(reader.GetOrdinal("full_name"));
        var avatarUrl = reader.IsDBNull(reader.GetOrdinal("avatar_url"))
            ? null
            : reader.GetString(reader.GetOrdinal("avatar_url"));
        var roleName = reader.IsDBNull(reader.GetOrdinal("role_name"))
            ? "CUSTOMER"
            : reader.GetString(reader.GetOrdinal("role_name"));

        await reader.CloseAsync();

        await using var updateCmd = new NpgsqlCommand(
            "UPDATE public.user_auth SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = @userId",
            conn);
        updateCmd.Parameters.AddWithValue("userId", userId);
        await updateCmd.ExecuteNonQueryAsync();

        return new AuthResult
        {
            Id = userId.ToString(),
            Email = userEmail,
            Name = fullName,
            Role = MapRole(roleName),
            Avatar = avatarUrl
        };
    }

    private async Task<AuthResult> RegisterViaDatabaseAsync(string email, string password, string name)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();
        await using var tx = await conn.BeginTransactionAsync();

        try
        {
            await using (var existsCmd = new NpgsqlCommand(
                "SELECT 1 FROM public.users WHERE LOWER(email) = LOWER(@email) LIMIT 1", conn, tx))
            {
                existsCmd.Parameters.AddWithValue("email", email.Trim());
                if (await existsCmd.ExecuteScalarAsync() != null)
                    throw new AuthException("Email này đã được sử dụng");
            }

            long userId;
            await using (var userCmd = new NpgsqlCommand(
                """
                INSERT INTO public.users (full_name, email, status)
                VALUES (@name, @email, 'active')
                RETURNING user_id
                """,
                conn, tx))
            {
                userCmd.Parameters.AddWithValue("name", name.Trim());
                userCmd.Parameters.AddWithValue("email", email.Trim());
                userId = Convert.ToInt64(await userCmd.ExecuteScalarAsync());
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            await using (var authCmd = new NpgsqlCommand(
                """
                INSERT INTO public.user_auth (user_id, provider, provider_key, password_hash)
                VALUES (@userId, 'local', @email, @passwordHash)
                """,
                conn, tx))
            {
                authCmd.Parameters.AddWithValue("userId", userId);
                authCmd.Parameters.AddWithValue("email", email.Trim());
                authCmd.Parameters.AddWithValue("passwordHash", passwordHash);
                await authCmd.ExecuteNonQueryAsync();
            }

            await using (var roleCmd = new NpgsqlCommand(
                "INSERT INTO public.user_roles (user_id, role_id) VALUES (@userId, 3)", conn, tx))
            {
                roleCmd.Parameters.AddWithValue("userId", userId);
                await roleCmd.ExecuteNonQueryAsync();
            }

            await tx.CommitAsync();

            return new AuthResult
            {
                Id = userId.ToString(),
                Email = email.Trim(),
                Name = name.Trim(),
                Role = "user"
            };
        }
        catch (AuthException)
        {
            await tx.RollbackAsync();
            throw;
        }
        catch (PostgresException ex) when (ex.SqlState == "23505")
        {
            await tx.RollbackAsync();
            throw new AuthException("Email này đã được sử dụng");
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    private static string MapRole(string dbRole) => dbRole switch
    {
        "ADMIN" => "admin",
        "PROVIDER" => "hotel_owner",
        "EMPLOYEE" => "employee",
        "ACCOUNTANT" => "accountant",


        _ => "user"
    };
}

public class AuthResult
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public string? Avatar { get; set; }
}

public class AuthException : Exception
{
    public AuthException(string message) : base(message) { }
}
