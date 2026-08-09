using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class TourActivity
    {
        public string Time { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
    }

    public class TourItineraryDay
    {
        public int Day { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Meals { get; set; } = string.Empty;
        public string Accommodation { get; set; } = string.Empty;
        public List<TourActivity> Activities { get; set; } = new();
    }

    public class Tour
    {
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("city_id")]
        public string CityId { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal Price { get; set; }

        [JsonPropertyName("childPrice")]
        public decimal ChildPrice { get; set; }

        public string Duration { get; set; } = string.Empty;

        [JsonPropertyName("durationDays")]
        public int DurationDays { get; set; } = 1;

        [JsonPropertyName("durationNights")]
        public int DurationNights { get; set; }

        public string Image { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int Reviews { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<string> Highlights { get; set; } = new();
        public List<string> Included { get; set; } = new();
        public List<string> Excluded { get; set; } = new();
        public List<TourItineraryDay>? Itinerary { get; set; }

        [JsonPropertyName("category_id")]
        public int? CategoryId { get; set; }

        [JsonPropertyName("category_name")]
        public string CategoryName { get; set; } = string.Empty;

        [JsonPropertyName("is_domestic")]
        public bool IsDomestic { get; set; } = true;

        public bool? Status { get; set; }
    }
}
