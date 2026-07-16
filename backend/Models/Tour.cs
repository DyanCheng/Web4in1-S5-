using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class Tour
    {
        public string Id { get; set; } = string.Empty;
        
        [JsonPropertyName("city_id")]
        public string CityId { get; set; } = string.Empty;
        
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int Reviews { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<string> Highlights { get; set; } = new();
        public List<string> Included { get; set; } = new();
        public List<string> Excluded { get; set; } = new();

        [JsonPropertyName("is_domestic")]
        public bool IsDomestic { get; set; } = true;
    }
}
