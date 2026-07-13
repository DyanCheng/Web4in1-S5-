using Backend.Models;
using System.Net.Http.Json;
using System.Text.Json;

namespace Backend.Services
{
    public class HotelDbService
    {
        private readonly DataStoreService _dataStore;
        private readonly string? _supabaseUrl;
        private readonly string? _supabaseKey;
        private readonly HttpClient _http;
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        public HotelDbService(DataStoreService dataStore, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _dataStore = dataStore;
            _supabaseUrl = configuration["SUPABASE_URL"] ?? configuration["Supabase:Url"];
            var svcKey = configuration["SUPABASE_SERVICE_ROLE_KEY"];
            var anonKey = configuration["SUPABASE_KEY"] ?? configuration["Supabase:Key"];
            _supabaseKey = !string.IsNullOrWhiteSpace(svcKey) ? svcKey : anonKey;
            _http = httpClientFactory.CreateClient("Supabase");
        }

        private async Task<JsonElement?> PostRpcAsync(string functionName, object body)
        {
            if (string.IsNullOrWhiteSpace(_supabaseUrl) || string.IsNullOrWhiteSpace(_supabaseKey))
                throw new InvalidOperationException("Configure SUPABASE_URL + SUPABASE_KEY.");

            using var request = new HttpRequestMessage(HttpMethod.Post, $"{_supabaseUrl.TrimEnd('/')}/rest/v1/rpc/{functionName}")
            {
                Content = JsonContent.Create(body)
            };
            request.Headers.Add("apikey", _supabaseKey);
            request.Headers.Add("Authorization", $"Bearer {_supabaseKey}");

            var response = await _http.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Supabase RPC '{functionName}' failed: {content}");
            }

            if (string.IsNullOrWhiteSpace(content) || content == "null")
                return null;

            using var doc = JsonDocument.Parse(content);
            return doc.RootElement.Clone();
        }

        public async Task<List<Hotel>> GetHotelsAsync()
        {
            try
            {
                var response = await PostRpcAsync("get_hotels", new { });
                if (response == null) return new List<Hotel>();

                return JsonSerializer.Deserialize<List<Hotel>>(response.Value.GetRawText(), _jsonOptions) ?? new List<Hotel>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetHotelsAsync: {ex.Message}");
                return new List<Hotel>();
            }
        }

        public async Task<List<HotelRoom>> GetHotelRoomsAsync(string hotelId)
        {
            try
            {
                var response = await PostRpcAsync("get_hotel_rooms", new { p_hotel_id = hotelId });
                if (response == null) return new List<HotelRoom>();

                return JsonSerializer.Deserialize<List<HotelRoom>>(response.Value.GetRawText(), _jsonOptions) ?? new List<HotelRoom>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetHotelRoomsAsync: {ex.Message}");
                return new List<HotelRoom>();
            }
        }

        public async Task<JsonElement?> CreateBookingAsync(
            long hotelId, string hotelName, string hotelImage,
            long roomId, string roomName,
            string userId, string userEmail,
            string checkInDate, string checkOutDate,
            int roomQuantity, int adults, int children,
            decimal totalAmount, int totalNights, decimal roomPrice)
        {
            var bookingCode = "HOTEL-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            var payload = new {
                p_booking_code = bookingCode,
                p_auth_user_id = userId,
                p_hotel_id = hotelId,
                p_room_id = roomId,
                p_check_in_date = checkInDate,
                p_check_out_date = checkOutDate,
                p_total_nights = totalNights,
                p_total_price = totalAmount,
                p_quantity = roomQuantity,
                p_room_price = roomPrice,
                p_payment_status = "unpaid"
            };

            var response = await PostRpcAsync("create_real_hotel_booking", payload);
            if (response == null) throw new Exception("Failed to create hotel booking in Supabase");

            return response;
        }

        public async Task<JsonElement?> GetUserBookingsAsync(string userId)
        {
            try
            {
                var response = await PostRpcAsync("get_real_user_hotel_bookings", new { p_auth_user_id = userId });
                if (response == null) return null;

                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserBookingsAsync: {ex.Message}");
                return null;
            }
        }
    }
}


