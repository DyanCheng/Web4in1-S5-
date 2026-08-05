using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;

namespace Backend.Services
{
    public class RevenueService
    {
        private readonly string? _supabaseUrl;
        private readonly string? _supabaseKey;
        private readonly HttpClient _http;
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        public RevenueService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _supabaseUrl = FirstConfig(configuration, "SUPABASE_URL", "Supabase:Url");
            _supabaseKey = FirstConfig(
                configuration,
                "SUPABASE_SERVICE_ROLE_KEY",
                "SUPABASE_KEY",
                "Supabase:Key");
            _http = httpClientFactory.CreateClient("Supabase");
        }

        public async Task<RevenueStatisticsResponse> GetMonthlyRevenueAsync(int? year = null)
        {
            var targetYear = year ?? DateTime.UtcNow.Year;
            var startDate = new DateTime(targetYear, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = new DateTime(targetYear, 12, 31, 23, 59, 59, DateTimeKind.Utc);

            var rows = await FetchSuccessfulPaymentsAsync(startDate, endDate);
            var monthlyData = Enumerable.Range(1, 12)
                .Select(month =>
                {
                    var monthRows = rows.Where(x => x.PaidAt.HasValue && x.PaidAt.Value.Month == month).ToList();
                    return new RevenuePoint
                    {
                        Month = month,
                        MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month),
                        TotalRevenue = monthRows.Sum(x => x.Amount ?? 0m),
                        OrderCount = monthRows.Count
                    };
                })
                .ToList();

            var totalRevenue = monthlyData.Sum(x => x.TotalRevenue);
            var totalOrders = monthlyData.Sum(x => x.OrderCount);

            return new RevenueStatisticsResponse
            {
                Year = targetYear,
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                Data = monthlyData
            };
        }

        public async Task<RevenueStatisticsResponse> GetRevenueByRangeAsync(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Ngày bắt đầu không được lớn hơn ngày kết thúc.");

            var rows = await FetchSuccessfulPaymentsAsync(startDate, endDate);
            var monthlyData = rows
                .Where(x => x.PaidAt.HasValue)
                .GroupBy(x => x.PaidAt!.Value.Month)
                .Select(group => new RevenuePoint
                {
                    Month = group.Key,
                    MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(group.Key),
                    TotalRevenue = group.Sum(x => x.Amount ?? 0m),
                    OrderCount = group.Count()
                })
                .OrderBy(x => x.Month)
                .ToList();

            return new RevenueStatisticsResponse
            {
                Year = startDate.Year,
                StartDate = startDate.ToString("yyyy-MM-dd"),
                EndDate = endDate.ToString("yyyy-MM-dd"),
                TotalRevenue = monthlyData.Sum(x => x.TotalRevenue),
                TotalOrders = monthlyData.Sum(x => x.OrderCount),
                Data = monthlyData
            };
        }

        private async Task<List<PaymentRevenueRow>> FetchSuccessfulPaymentsAsync(DateTime startDate, DateTime endDate)
        {
            if (string.IsNullOrWhiteSpace(_supabaseUrl) || string.IsNullOrWhiteSpace(_supabaseKey))
                throw new InvalidOperationException("Configure SUPABASE_URL + SUPABASE_KEY.");

            var start = startDate.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);
            var end = endDate.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);

            var query = string.Join("&", new[]
            {
                "select=amount,paid_at,payment_status",
                "payment_status=eq.true",
                $"paid_at=gte.{start}",
                $"paid_at=lte.{end}",
                "limit=10000"
            });

            using var request = new HttpRequestMessage(HttpMethod.Get, $"{_supabaseUrl.TrimEnd('/')}/rest/v1/payments?{query}");
            request.Headers.Add("apikey", _supabaseKey);
            request.Headers.Add("Authorization", $"Bearer {_supabaseKey}");

            var response = await _http.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"Không thể tải doanh thu từ Supabase: {content}");

            if (string.IsNullOrWhiteSpace(content) || content == "null" || content == "[]")
                return new List<PaymentRevenueRow>();

            return JsonSerializer.Deserialize<List<PaymentRevenueRow>>(content, JsonOptions) ?? new List<PaymentRevenueRow>();
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
    }

    public class RevenueStatisticsResponse
    {
        public int Year { get; set; }
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public List<RevenuePoint> Data { get; set; } = new();
    }

    public class RevenuePoint
    {
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class PaymentRevenueRow
    {
        public decimal? Amount { get; set; }
        public DateTime? PaidAt { get; set; }
        public bool? PaymentStatus { get; set; }
    }
}
