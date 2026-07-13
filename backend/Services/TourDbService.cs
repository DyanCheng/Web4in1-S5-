using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;
using Backend.Controllers;

namespace Backend.Services
{
    public class TourDbService
    {
        private const long DefaultFallbackTourId = 1;

        private readonly string? _supabaseUrl;
        private readonly string? _supabaseKey;
        private readonly HttpClient _http;
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        public TourDbService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _supabaseUrl = FirstConfig(configuration, "SUPABASE_URL", "Supabase:Url");
            _supabaseKey = FirstConfig(
                configuration,
                "SUPABASE_SERVICE_ROLE_KEY",
                "SUPABASE_KEY",
                "Supabase:Key");
            _http = httpClientFactory.CreateClient("Supabase");
        }

        private static string? FirstConfig(IConfiguration configuration, params string[] keys)
        {
            foreach (var key in keys)
            {
                var value = configuration[key]?.Trim();
                if (!string.IsNullOrWhiteSpace(value))
                    return value;
            }

            return null;
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

        // --- TOURS SERVICE ---

        public async Task<List<Tour>> GetAllToursAsync(string? destination)
        {
            try
            {
                var response = await PostRpcAsync("get_tours", new { p_destination = destination ?? string.Empty });
                if (response == null) return new List<Tour>();

                return JsonSerializer.Deserialize<List<Tour>>(response.Value.GetRawText(), _jsonOptions) ?? new List<Tour>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllToursAsync: {ex.Message}");
                return new List<Tour>();
            }
        }

        private async Task<Tour?> FetchTourByIdAsync(long tourId)
        {
            var response = await PostRpcAsync("get_tour_by_id", new { p_id = tourId });
            if (response == null) return null;

            return JsonSerializer.Deserialize<Tour>(response.Value.GetRawText(), _jsonOptions);
        }

        public async Task<Tour?> GetTourByIdAsync(string id)
        {
            try
            {
                if (long.TryParse(id, out var parsedId))
                {
                    var tour = await FetchTourByIdAsync(parsedId);
                    if (tour != null) return tour;
                }

                return await FetchTourByIdAsync(DefaultFallbackTourId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetTourByIdAsync: {ex.Message}");
                return null;
            }
        }

        public async Task<Tour?> CreateTourAsync(TourRequest request)
        {
            try
            {
                var response = await PostRpcAsync("create_tour", new
                {
                    p_title = request.Title,
                    p_location = request.Location,
                    p_price = request.Price,
                    p_duration = request.Duration,
                    p_image = request.Image,
                    p_description = request.Description,
                    p_highlights = request.Highlights ?? new List<string>(),
                    p_included = request.Included ?? new List<string>(),
                    p_excluded = request.Excluded ?? new List<string>()
                });

                if (response == null) return null;
                return JsonSerializer.Deserialize<Tour>(response.Value.GetRawText(), _jsonOptions);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateTourAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<Tour?> UpdateTourAsync(string id, TourRequest request)
        {
            if (!long.TryParse(id, out var parsedId)) return null;

            try
            {
                var response = await PostRpcAsync("update_tour", new
                {
                    p_id = parsedId,
                    p_title = request.Title,
                    p_location = request.Location,
                    p_price = request.Price,
                    p_duration = request.Duration,
                    p_image = request.Image,
                    p_description = request.Description,
                    p_highlights = request.Highlights ?? new List<string>(),
                    p_included = request.Included ?? new List<string>(),
                    p_excluded = request.Excluded ?? new List<string>()
                });

                if (response == null) return null;
                return JsonSerializer.Deserialize<Tour>(response.Value.GetRawText(), _jsonOptions);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateTourAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteTourAsync(string id)
        {
            if (!long.TryParse(id, out var parsedId)) return false;

            try
            {
                await PostRpcAsync("delete_tour", new { p_id = parsedId });
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteTourAsync: {ex.Message}");
                return false;
            }
        }

        // --- BOOKINGS SERVICE ---

        public async Task<List<Booking>> GetAllBookingsAsync()
        {
            try
            {
                var response = await PostRpcAsync("get_bookings", new { });
                if (response == null) return new List<Booking>();

                return JsonSerializer.Deserialize<List<Booking>>(response.Value.GetRawText(), _jsonOptions) ?? new List<Booking>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllBookingsAsync: {ex.Message}");
                return new List<Booking>();
            }
        }

        public async Task<List<Booking>> GetBookingsByUserEmailAsync(string email)
        {
            try
            {
                var response = await PostRpcAsync("get_user_bookings", new { p_email = email });
                if (response == null) return new List<Booking>();

                return JsonSerializer.Deserialize<List<Booking>>(response.Value.GetRawText(), _jsonOptions) ?? new List<Booking>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetBookingsByUserEmailAsync: {ex.Message}");
                return new List<Booking>();
            }
        }

        public async Task<Booking?> CreateBookingAsync(BookingRequest request)
        {
            if (!long.TryParse(request.TourId, out var parsedTourId)) return null;

            try
            {
                var response = await PostRpcAsync("create_booking", new
                {
                    p_tour_id = parsedTourId,
                    p_user_id = request.UserId,
                    p_user_email = request.UserEmail,
                    p_date = request.Date,
                    p_guests = request.Guests,
                    p_quantity = request.Quantity
                });

                if (response == null) return null;
                return JsonSerializer.Deserialize<Booking>(response.Value.GetRawText(), _jsonOptions);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateBookingAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteBookingAsync(string id)
        {
            try
            {
                await PostRpcAsync("delete_booking", new { p_booking_code = id });
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteBookingAsync: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> ConfirmBookingAsync(string id)
        {
            try
            {
                await PostRpcAsync("confirm_booking", new { p_booking_code = id });
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ConfirmBookingAsync: {ex.Message}");
                return false;
            }
        }
    }
}


