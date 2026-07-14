namespace Backend.Models
{
    public class Hotel
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Location { get; set; }
        public string? Area { get; set; }
        public string? Image { get; set; }
        public decimal? Rating { get; set; }
        public int? Reviews { get; set; }
        public decimal? Price { get; set; }
        public decimal? OldPrice { get; set; }
        public string? Badge { get; set; }
        public int? Stars { get; set; }
        public List<string>? Features { get; set; }
    }

    public class HotelRoom
    {
        public string? Id { get; set; }
        public string? HotelId { get; set; }
        public string? Name { get; set; }
        public string? Image { get; set; }
        public int? MaxAdults { get; set; }
        public int? MaxChildren { get; set; }
        public string? Beds { get; set; }
        public decimal? SizeSqm { get; set; }
        public decimal? Price { get; set; }
        public decimal? TaxAndFee { get; set; }
        public List<string>? Facilities { get; set; }
    }
}
