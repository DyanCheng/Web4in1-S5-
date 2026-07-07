using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class HotelBooking
    {
        [JsonPropertyName("hotel_booking_id")]
        public long HotelBookingId { get; set; }
        
        [JsonPropertyName("booking_code")]
        public string BookingCode { get; set; } = string.Empty;
        
        [JsonPropertyName("user_id")]
        public long UserId { get; set; }
        
        [JsonPropertyName("hotel_id")]
        public long HotelId { get; set; }
        
        [JsonPropertyName("check_in_date")]
        public string CheckInDate { get; set; } = string.Empty;
        
        [JsonPropertyName("check_out_date")]
        public string CheckOutDate { get; set; } = string.Empty;
        
        [JsonPropertyName("total_nights")]
        public int TotalNights { get; set; }
        
        [JsonPropertyName("total_price")]
        public decimal TotalPrice { get; set; }
        
        [JsonPropertyName("booking_status")]
        public string BookingStatus { get; set; } = string.Empty;
        
        [JsonPropertyName("payment_status")]
        public string PaymentStatus { get; set; } = string.Empty;
        
        [JsonPropertyName("hotel_name")]
        public string? HotelName { get; set; }
        
        [JsonPropertyName("details")]
        public List<HotelBookingDetail>? Details { get; set; }
    }

    public class HotelBookingDetail
    {
        [JsonPropertyName("detail_id")]
        public long DetailId { get; set; }
        
        [JsonPropertyName("hotel_booking_id")]
        public long HotelBookingId { get; set; }
        
        [JsonPropertyName("room_id")]
        public long RoomId { get; set; }
        
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }
        
        [JsonPropertyName("price")]
        public decimal Price { get; set; }
    }
}
