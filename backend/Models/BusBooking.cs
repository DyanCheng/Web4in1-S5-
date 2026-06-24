using System;

namespace Backend.Models
{
    public class BusBooking
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string BusTripId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string SeatNumber { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public DateTime BookingDate { get; set; } = DateTime.Now;
        public string Status { get; set; } = "pending"; // pending, confirmed, cancelled
        
        // Thông tin hành khách
        public string PassengerName { get; set; } = string.Empty;
        public string PassengerPhone { get; set; } = string.Empty;
        public string? PassengerEmail { get; set; }
        
        // Liên kết với Tour (nếu đặt kèm)
        public string? TourBookingId { get; set; }
        
        // Navigation properties
        public BusTrip? BusTrip { get; set; }
        public User? User { get; set; }
    }
}