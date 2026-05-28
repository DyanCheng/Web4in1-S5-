namespace Backend.Models
{
    public class Booking
    {
        public string Id { get; set; } = string.Empty;
        public string TourId { get; set; } = string.Empty;
        public string TourTitle { get; set; } = string.Empty;
        public string TourImage { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public int Guests { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = "pending"; // "pending", "confirmed"
    }
}
