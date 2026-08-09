using System.Net.Http.Json;
using System.Text.Json;
using Npgsql;

namespace Backend.Services;

/// <summary>
/// Xác thực người dùng qua 2 đường dẫn (ưu tiên theo thứ tự cấu hình):
/// 1. PostgreSQL trực tiếp (ConnectionStrings:DefaultConnection) — RPC qua Npgsql
/// 2. Supabase REST/RPC (SUPABASE_URL + SUPABASE_KEY) — khi không có connection string
/// Service role key dùng cho thao tác admin (tạo user Auth) khi cần.
/// </summary>
public class AuthDbService
{
    private readonly string? _connectionString;
    private readonly string? _supabaseUrl;
    private readonly string? _supabaseKey;
    private readonly string? _serviceRoleKey;
    private readonly HttpClient _http;
    //Constructor của AuthDbService
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
        _serviceRoleKey = TrimConfig(configuration, "SUPABASE_SERVICE_ROLE_KEY");
        _http = httpClientFactory.CreateClient("Supabase");
    }
    //Key cho Supabase REST
    private string? SupabaseRestKey => _serviceRoleKey ?? _supabaseKey;

    //Cắt cấu hình cho Supabase
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

    //Đăng nhập người dùng từ database hoặc Supabase
    public async Task<AuthResult?> LoginAsync(string email, string password)
    {
        if (!string.IsNullOrWhiteSpace(_connectionString))
            return await LoginViaDatabaseAsync(email, password);

        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(_supabaseKey))
            return await LoginViaSupabaseRpcAsync(email, password);

        throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection or SUPABASE_URL + SUPABASE_KEY.");
    }
    
    public async Task<AuthResult> RegisterAsync(string email, string password, string name , string a = "Đăng ký người dùng từ database hoặc Supabase")
    {
        if (!string.IsNullOrWhiteSpace(_connectionString))
            return await RegisterViaDatabaseAsync(email, password, name);

        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(_supabaseKey))
            return await RegisterViaSupabaseRpcAsync(email, password, name);

        throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection or SUPABASE_URL + SUPABASE_KEY.");
    }

    //Đăng nhập hoặc đăng ký người dùng Google từ database hoặc Supabase
    public async Task<AuthResult> LoginOrRegisterGoogleAsync(string googleId, string email, string fullName, string? avatarUrl)
    {
        if (!string.IsNullOrWhiteSpace(_connectionString))
            return await LoginOrRegisterGoogleViaDatabaseAsync(googleId, email, fullName, avatarUrl);

        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(_supabaseKey))
            return await LoginOrRegisterGoogleViaSupabaseRpcAsync(googleId, email, fullName, avatarUrl);

        throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection or SUPABASE_URL + SUPABASE_KEY.");
    }
//Lấy thông tin người dùng từ database hoặc Supabase dựa vào id và email của người dùng  
    public async Task<AuthResult?> GetUserByIdAndEmailAsync(string id, string email)
    {
        if (!long.TryParse(id, out var userId))
            return null;

        AuthResult? user;
        if (!string.IsNullOrWhiteSpace(_connectionString))
            user = await GetUserByIdAndEmailViaDatabaseAsync(userId, email);
        else if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(_supabaseKey))
            user = await GetUserByIdAndEmailViaSupabaseAsync(userId, email);
        else
            throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection or SUPABASE_URL + SUPABASE_KEY.");

        if (user != null)
            await EnrichProfileAsync(user);
        return user;
    }

    public async Task<AuthResult?> GetProfileAsync(string id)
    {
        if (!long.TryParse(id, out var userId))
            return null;

        if (!string.IsNullOrWhiteSpace(_connectionString))
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();
            var user = await GetUserByIdAsync(conn, userId);
            await EnrichProfileViaDatabaseAsync(conn, user);
            return user;
        }

        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(SupabaseRestKey))
        {
            var email = await GetEmailByIdViaSupabaseAsync(userId);
            if (string.IsNullOrWhiteSpace(email))
                return null;
            var user = await GetUserByIdAndEmailViaSupabaseAsync(userId, email);
            if (user != null)
                await EnrichProfileViaSupabaseAsync(user);
            return user;
        }

        throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection or SUPABASE_URL + SUPABASE_KEY.");
    }

    public async Task<AuthResult> UpdateProfileAsync(string id, string? fullName, string? phone, DateOnly? dateOfBirth, string? gender)
    {
        if (!long.TryParse(id, out var userId))
            throw new AuthException("Người dùng không hợp lệ");

        if (!string.IsNullOrWhiteSpace(gender)
            && gender is not ("male" or "female" or "other"))
            throw new AuthException("Giới tính không hợp lệ");

        if (!string.IsNullOrWhiteSpace(_connectionString))
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            await using var cmd = new NpgsqlCommand(
                """
                UPDATE public.users
                SET full_name = COALESCE(NULLIF(@name, ''), full_name),
                    phone = COALESCE(@phone, phone),
                    date_of_birth = COALESCE(@dob, date_of_birth),
                    gender = COALESCE(@gender, gender),
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = @userId
                """, conn);
            cmd.Parameters.AddWithValue("userId", userId);
            cmd.Parameters.AddWithValue("name", (object?)fullName?.Trim() ?? DBNull.Value);
            cmd.Parameters.AddWithValue("phone", string.IsNullOrWhiteSpace(phone) ? DBNull.Value : phone.Trim());
            cmd.Parameters.AddWithValue("dob", dateOfBirth.HasValue ? dateOfBirth.Value : DBNull.Value);
            cmd.Parameters.AddWithValue("gender", string.IsNullOrWhiteSpace(gender) ? DBNull.Value : gender.Trim());
            var rows = await cmd.ExecuteNonQueryAsync();
            if (rows == 0)
                throw new AuthException("Không tìm thấy người dùng");

            var user = await GetUserByIdAsync(conn, userId);
            await EnrichProfileViaDatabaseAsync(conn, user);
            return user;
        }

        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(SupabaseRestKey))
        {
            var patch = new Dictionary<string, object?>();
            if (!string.IsNullOrWhiteSpace(fullName))
                patch["full_name"] = fullName.Trim();
            if (phone != null)
                patch["phone"] = string.IsNullOrWhiteSpace(phone) ? null : phone.Trim();
            if (dateOfBirth.HasValue)
                patch["date_of_birth"] = dateOfBirth.Value.ToString("yyyy-MM-dd");
            if (!string.IsNullOrWhiteSpace(gender))
                patch["gender"] = gender.Trim();
            patch["updated_at"] = DateTime.UtcNow.ToString("o");

            using var request = new HttpRequestMessage(
                HttpMethod.Patch,
                $"{_supabaseUrl!.TrimEnd('/')}/rest/v1/users?user_id=eq.{userId}")
            {
                Content = JsonContent.Create(patch)
            };
            request.Headers.Add("apikey", SupabaseRestKey);
            request.Headers.Add("Authorization", $"Bearer {SupabaseRestKey}");
            request.Headers.Add("Prefer", "return=representation");

            var response = await _http.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new AuthException(ParseSupabaseError(content));

            var profile = await GetProfileAsync(id);
            return profile ?? throw new AuthException("Không tìm thấy người dùng");
        }

        throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection or SUPABASE_URL + SUPABASE_KEY.");
    }

    public async Task ChangePasswordAsync(string id, string currentPassword, string newPassword)
    {
        if (!long.TryParse(id, out var userId))
            throw new AuthException("Người dùng không hợp lệ");
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            throw new AuthException("Mật khẩu mới phải có ít nhất 6 ký tự");

        if (!string.IsNullOrWhiteSpace(_connectionString))
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            await using var cmd = new NpgsqlCommand(
                """
                SELECT password_hash FROM public.user_auth
                WHERE user_id = @userId AND provider = 'local'
                LIMIT 1
                """, conn);
            cmd.Parameters.AddWithValue("userId", userId);
            var hashObj = await cmd.ExecuteScalarAsync();
            if (hashObj == null || hashObj == DBNull.Value)
                throw new AuthException("Tài khoản Google không thể đổi mật khẩu tại đây");

            var hash = Convert.ToString(hashObj);
            if (string.IsNullOrEmpty(hash) || !BCrypt.Net.BCrypt.Verify(currentPassword, hash))
                throw new AuthException("Mật khẩu hiện tại không chính xác");

            var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await using var updateCmd = new NpgsqlCommand(
                """
                UPDATE public.user_auth
                SET password_hash = @hash
                WHERE user_id = @userId AND provider = 'local'
                """, conn);
            updateCmd.Parameters.AddWithValue("hash", newHash);
            updateCmd.Parameters.AddWithValue("userId", userId);
            await updateCmd.ExecuteNonQueryAsync();
            return;
        }

        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(SupabaseRestKey))
        {
            // Verify via login_user RPC then patch password_hash through service role
            var email = await GetEmailByIdViaSupabaseAsync(userId)
                ?? throw new AuthException("Không tìm thấy người dùng");

            var loginCheck = await PostRpcAsync("login_user", new { p_email = email, p_password = currentPassword });
            if (loginCheck == null)
                throw new AuthException("Mật khẩu hiện tại không chính xác");

            var authReq = new HttpRequestMessage(
                HttpMethod.Get,
                $"{_supabaseUrl!.TrimEnd('/')}/rest/v1/user_auth?user_id=eq.{userId}&provider=eq.local&select=auth_id,password_hash&limit=1");
            authReq.Headers.Add("apikey", SupabaseRestKey);
            authReq.Headers.Add("Authorization", $"Bearer {SupabaseRestKey}");
            var authRes = await _http.SendAsync(authReq);
            var authContent = await authRes.Content.ReadAsStringAsync();
            if (!authRes.IsSuccessStatusCode)
                throw new AuthException("Không thể đổi mật khẩu");

            using var authDoc = JsonDocument.Parse(authContent);
            if (authDoc.RootElement.GetArrayLength() == 0)
                throw new AuthException("Tài khoản Google không thể đổi mật khẩu tại đây");

            // Prefer DB path; for REST-only, call a small RPC if available. Fallback: reject with guidance.
            throw new AuthException("Đổi mật khẩu yêu cầu kết nối database trực tiếp. Vui lòng thử lại sau.");
        }

        throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection or SUPABASE_URL + SUPABASE_KEY.");
    }

    public async Task<string> UpdateAvatarAsync(string id, byte[] imageBytes, string contentType)
    {
        if (!long.TryParse(id, out var userId))
            throw new AuthException("Người dùng không hợp lệ");
        if (imageBytes.Length == 0)
            throw new AuthException("Ảnh không hợp lệ");
        if (imageBytes.Length > 5 * 1024 * 1024)
            throw new AuthException("Ảnh tối đa 5MB");

        var ext = contentType.Contains("png", StringComparison.OrdinalIgnoreCase) ? "png"
            : contentType.Contains("webp", StringComparison.OrdinalIgnoreCase) ? "webp"
            : "jpg";
        var objectPath = $"{userId}/{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}.{ext}";
        string avatarUrl;

        var apiKey = SupabaseRestKey;
        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(apiKey))
        {
            using var upload = new HttpRequestMessage(
                HttpMethod.Post,
                $"{_supabaseUrl!.TrimEnd('/')}/storage/v1/object/avt-t/{objectPath}")
            {
                Content = new ByteArrayContent(imageBytes)
            };
            upload.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(
                string.IsNullOrWhiteSpace(contentType) ? "image/jpeg" : contentType);
            upload.Headers.Add("apikey", apiKey);
            upload.Headers.Add("Authorization", $"Bearer {apiKey}");
            upload.Headers.Add("x-upsert", "true");

            var uploadRes = await _http.SendAsync(upload);
            var uploadBody = await uploadRes.Content.ReadAsStringAsync();
            if (!uploadRes.IsSuccessStatusCode)
                throw new AuthException($"Không thể tải ảnh lên: {ParseSupabaseError(uploadBody)}");

            avatarUrl = $"{_supabaseUrl!.TrimEnd('/')}/storage/v1/object/public/avt-t/{objectPath}";
        }
        else
        {
            throw new AuthException("Chưa cấu hình Supabase Storage để lưu ảnh đại diện");
        }

        if (!string.IsNullOrWhiteSpace(_connectionString))
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();
            await using var cmd = new NpgsqlCommand(
                "UPDATE public.users SET avatar_url = @url, updated_at = CURRENT_TIMESTAMP WHERE user_id = @userId",
                conn);
            cmd.Parameters.AddWithValue("url", avatarUrl);
            cmd.Parameters.AddWithValue("userId", userId);
            await cmd.ExecuteNonQueryAsync();
        }
        else if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(apiKey))
        {
            using var patch = new HttpRequestMessage(
                HttpMethod.Patch,
                $"{_supabaseUrl!.TrimEnd('/')}/rest/v1/users?user_id=eq.{userId}")
            {
                Content = JsonContent.Create(new { avatar_url = avatarUrl, updated_at = DateTime.UtcNow.ToString("o") })
            };
            patch.Headers.Add("apikey", apiKey);
            patch.Headers.Add("Authorization", $"Bearer {apiKey}");
            var patchRes = await _http.SendAsync(patch);
            if (!patchRes.IsSuccessStatusCode)
            {
                var body = await patchRes.Content.ReadAsStringAsync();
                throw new AuthException(ParseSupabaseError(body));
            }
        }

        return avatarUrl;
    }

    public async Task EnrichProfileAsync(AuthResult user)
    {
        if (!long.TryParse(user.Id, out var userId))
            return;

        if (!string.IsNullOrWhiteSpace(_connectionString))
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();
            await EnrichProfileViaDatabaseAsync(conn, user);
            return;
        }

        if (!string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(SupabaseRestKey))
            await EnrichProfileViaSupabaseAsync(user);
    }

    private async Task EnrichProfileViaDatabaseAsync(NpgsqlConnection conn, AuthResult user)
    {
        if (!long.TryParse(user.Id, out var userId))
            return;

        await using (var cmd = new NpgsqlCommand(
            """
            SELECT phone, date_of_birth, gender, avatar_url
            FROM public.users WHERE user_id = @userId LIMIT 1
            """, conn))
        {
            cmd.Parameters.AddWithValue("userId", userId);
            await using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                user.Phone = reader.IsDBNull(0) ? null : reader.GetString(0);
                user.DateOfBirth = reader.IsDBNull(1) ? null : DateOnly.FromDateTime(reader.GetDateTime(1));
                user.Gender = reader.IsDBNull(2) ? null : reader.GetString(2);
                if (!reader.IsDBNull(3))
                    user.Avatar = reader.GetString(3);
            }
        }

        await using var authCmd = new NpgsqlCommand(
            """
            SELECT
              BOOL_OR(provider = 'local' AND password_hash IS NOT NULL) AS has_local,
              BOOL_OR(provider = 'google') AS has_google
            FROM public.user_auth
            WHERE user_id = @userId
            """, conn);
        authCmd.Parameters.AddWithValue("userId", userId);
        await using var authReader = await authCmd.ExecuteReaderAsync();
        if (await authReader.ReadAsync())
        {
            var hasLocal = !authReader.IsDBNull(0) && authReader.GetBoolean(0);
            var hasGoogle = !authReader.IsDBNull(1) && authReader.GetBoolean(1);
            user.CanChangePassword = hasLocal;
            user.AuthProvider = hasLocal ? "local" : hasGoogle ? "google" : "local";
        }
    }

    private async Task EnrichProfileViaSupabaseAsync(AuthResult user)
    {
        if (!long.TryParse(user.Id, out var userId) || string.IsNullOrWhiteSpace(SupabaseRestKey))
            return;

        var userReq = new HttpRequestMessage(
            HttpMethod.Get,
            $"{_supabaseUrl!.TrimEnd('/')}/rest/v1/users?user_id=eq.{userId}&select=phone,date_of_birth,gender,avatar_url&limit=1");
        userReq.Headers.Add("apikey", SupabaseRestKey);
        userReq.Headers.Add("Authorization", $"Bearer {SupabaseRestKey}");
        var userRes = await _http.SendAsync(userReq);
        if (userRes.IsSuccessStatusCode)
        {
            await using var stream = await userRes.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);
            if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
            {
                var row = doc.RootElement[0];
                user.Phone = row.TryGetProperty("phone", out var phone) && phone.ValueKind != JsonValueKind.Null
                    ? phone.GetString() : null;
                if (row.TryGetProperty("date_of_birth", out var dob) && dob.ValueKind == JsonValueKind.String
                    && DateOnly.TryParse(dob.GetString(), out var parsedDob))
                    user.DateOfBirth = parsedDob;
                user.Gender = row.TryGetProperty("gender", out var gender) && gender.ValueKind != JsonValueKind.Null
                    ? gender.GetString() : null;
                if (row.TryGetProperty("avatar_url", out var avatar) && avatar.ValueKind == JsonValueKind.String)
                    user.Avatar = avatar.GetString();
            }
        }

        var authReq = new HttpRequestMessage(
            HttpMethod.Get,
            $"{_supabaseUrl!.TrimEnd('/')}/rest/v1/user_auth?user_id=eq.{userId}&select=provider,password_hash");
        authReq.Headers.Add("apikey", SupabaseRestKey);
        authReq.Headers.Add("Authorization", $"Bearer {SupabaseRestKey}");
        var authRes = await _http.SendAsync(authReq);
        if (!authRes.IsSuccessStatusCode)
            return;

        await using var authStream = await authRes.Content.ReadAsStreamAsync();
        using var authDoc = await JsonDocument.ParseAsync(authStream);
        var hasLocal = false;
        var hasGoogle = false;
        if (authDoc.RootElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var row in authDoc.RootElement.EnumerateArray())
            {
                var provider = row.TryGetProperty("provider", out var p) ? p.GetString() : null;
                if (provider == "local"
                    && row.TryGetProperty("password_hash", out var hash)
                    && hash.ValueKind == JsonValueKind.String
                    && !string.IsNullOrWhiteSpace(hash.GetString()))
                    hasLocal = true;
                if (provider == "google")
                    hasGoogle = true;
            }
        }

        user.CanChangePassword = hasLocal;
        user.AuthProvider = hasLocal ? "local" : hasGoogle ? "google" : "local";
    }

    private async Task<string?> GetEmailByIdViaSupabaseAsync(long userId)
    {
        if (string.IsNullOrWhiteSpace(SupabaseRestKey))
            return null;
        var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"{_supabaseUrl!.TrimEnd('/')}/rest/v1/users?user_id=eq.{userId}&select=email&limit=1");
        request.Headers.Add("apikey", SupabaseRestKey);
        request.Headers.Add("Authorization", $"Bearer {SupabaseRestKey}");
        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return null;
        await using var stream = await response.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);
        if (doc.RootElement.ValueKind != JsonValueKind.Array || doc.RootElement.GetArrayLength() == 0)
            return null;
        return doc.RootElement[0].GetProperty("email").GetString();
    }

    private async Task<AuthResult?> GetUserByIdAndEmailViaDatabaseAsync(long userId, string email)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync();

        const string sql = """
            SELECT u.user_id, u.email, u.full_name, u.avatar_url, r.role_name
            FROM public.users u
            LEFT JOIN public.user_roles ur ON u.user_id = ur.user_id
            LEFT JOIN public.roles r ON ur.role_id = r.role_id
            WHERE u.user_id = @userId AND LOWER(u.email) = LOWER(@email)
            LIMIT 1
            """;

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("userId", userId);
        cmd.Parameters.AddWithValue("email", email.Trim());
        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return MapAuthResult(reader);
    }

    private async Task<AuthResult?> GetUserByIdAndEmailViaSupabaseAsync(long userId, string email)
    {
        var apiKey = SupabaseRestKey;
        if (string.IsNullOrWhiteSpace(apiKey))
            return null;

        var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"{_supabaseUrl!.TrimEnd('/')}/rest/v1/users?user_id=eq.{userId}&email=eq.{Uri.EscapeDataString(email.Trim())}&select=user_id,email,full_name,avatar_url&limit=1");
        request.Headers.Add("apikey", apiKey);
        request.Headers.Add("Authorization", $"Bearer {apiKey}");

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return null;

        await using var stream = await response.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);
        if (doc.RootElement.ValueKind != JsonValueKind.Array || doc.RootElement.GetArrayLength() == 0)
            return null;

        var row = doc.RootElement[0];
        var role = await GetUserRoleViaSupabaseAsync(userId) ?? "user";

        return new AuthResult
        {
            Id = row.GetProperty("user_id").GetRawText().Trim('"'),
            Email = row.GetProperty("email").GetString() ?? email,
            Name = row.GetProperty("full_name").GetString() ?? string.Empty,
            Role = role,
            Avatar = row.TryGetProperty("avatar_url", out var avatar) && avatar.ValueKind != JsonValueKind.Null
                ? avatar.GetString()
                : null,
        };
    }

    private async Task<string?> GetUserRoleViaSupabaseAsync(long userId)
    {
        var apiKey = SupabaseRestKey;
        if (string.IsNullOrWhiteSpace(apiKey))
            return null;

        var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"{_supabaseUrl!.TrimEnd('/')}/rest/v1/user_roles?user_id=eq.{userId}&select=roles(role_name)&limit=1");
        request.Headers.Add("apikey", apiKey);
        request.Headers.Add("Authorization", $"Bearer {apiKey}");

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            return null;

        await using var stream = await response.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);
        if (doc.RootElement.ValueKind != JsonValueKind.Array || doc.RootElement.GetArrayLength() == 0)
            return null;

        var row = doc.RootElement[0];
        if (!row.TryGetProperty("roles", out var rolesEl))
            return null;

        var roleName = rolesEl.GetProperty("role_name").GetString();
        return string.IsNullOrWhiteSpace(roleName) ? null : MapRole(roleName);
    }

    private static AuthResult MapAuthResult(NpgsqlDataReader reader) =>
        new()
        {
            Id = reader.GetInt64(0).ToString(),
            Email = reader.GetString(1),
            Name = reader.GetString(2),
            Avatar = reader.IsDBNull(3) ? null : reader.GetString(3),
            Role = reader.IsDBNull(4) ? "user" : MapRole(reader.GetString(4)),
        };

    //Đăng nhập hoặc đăng ký người dùng Google từ Supabase RPC
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

    //Đăng nhập hoặc đăng ký người dùng Google từ database
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

    //Cập nhật thông tin người dùng Google từ database
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

    //Cập nhật thời gian đăng nhập người dùng Google từ database
    private static async Task UpdateGoogleLoginAsync(NpgsqlConnection conn, NpgsqlTransaction tx, long userId)
    {
        await using var cmd = new NpgsqlCommand(
            "UPDATE public.user_auth SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = @userId AND provider = 'google'",
            conn, tx);
        cmd.Parameters.AddWithValue("userId", userId);
        await cmd.ExecuteNonQueryAsync();
    }

    //Lấy thông tin người dùng từ database dựa vào id của người dùng
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

    //Đăng nhập người dùng từ Supabase RPC
    private async Task<AuthResult?> LoginViaSupabaseRpcAsync(string email, string password)
    {
        var response = await PostRpcAsync("login_user", new { p_email = email.Trim(), p_password = password });
        if (response == null)
            return null;

        return MapRpcResult(response.Value);
    }

    //Đăng ký người dùng từ Supabase RPC
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

    //Gửi yêu cầu đến Supabase RPC
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

    //Chuyển đổi kết quả từ Supabase RPC thành AuthResult
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

    //Phân tích lỗi từ Supabase RPC
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

    //Đăng nhập người dùng từ database
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

    //Đăng ký người dùng từ database
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

    //Chuyển đổi vai trò từ database thành AuthResult
    private static string MapRole(string dbRole) => dbRole switch
    {
        "ADMIN" => "admin",
        "PROVIDER" => "hotel_owner",
        "EMPLOYEE" => "employee",
        "ACCOUNTANT" => "accountant",


        _ => "user"
    };
}
//Kết quả đăng nhập hoặc đăng ký người dùng
public class AuthResult
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public string? Avatar { get; set; }
    public string? Phone { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string AuthProvider { get; set; } = "local";
    public bool CanChangePassword { get; set; } = true;
}

public class AuthException : Exception
{
    public AuthException(string message) : base(message) { }
}
