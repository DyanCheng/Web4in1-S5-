namespace Backend.Models
{
    public class Room
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "Deluxe", "Suite", "Standard", "Family"
        public decimal Price { get; set; }
        public string Status { get; set; } = "available"; // "available", "booked"
        public int Beds { get; set; }
        public int Guests { get; set; }
    }
}
