using System;

namespace Backend.Models
{
    public class BusTrip
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string RouteName { get; set; } = string.Empty; // "Hà Nội - Đà Nẵng"
        public string DeparturePoint { get; set; } = string.Empty;
        public string ArrivalPoint { get; set; } = string.Empty;
        public DateTime DepartureTime { get; set; }
        public DateTime ArrivalTime { get; set; }
        public decimal Price { get; set; }
        public int TotalSeats { get; set; } = 40;
        public int AvailableSeats { get; set; }
        public string? BusCompany { get; set; } // Tên công ty xe
        public string? Description { get; set; }
        public string? Image { get; set; }
        public bool IsActive { get; set; } = true;
    }
}