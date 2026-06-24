using System.Linq;
using Backend.Models;

namespace Backend.Services
{
    public class DataStoreService
    {
        public List<User> Users { get; } = new();
        public List<Tour> Tours { get; } = new();
        public List<Booking> Bookings { get; } = new();
        public List<Room> Rooms { get; } = new();

        public DataStoreService()
        {
            // Seed Demo Users
            Users.Add(new User { Id = "1", Email = "admin@travelhub.com", Name = "Admin", Role = "admin", Password = "admin123" });
            Users.Add(new User { Id = "2", Email = "hotel@travelhub.com", Name = "Hotel Owner", Role = "hotel_owner", Password = "hotel123" });
            Users.Add(new User { Id = "3", Email = "user@travelhub.com", Name = "Khách Hàng", Role = "user", Password = "user123" });

            // Seed Tours
            Tours.Add(new Tour
            {
                Id = "1",
                Title = "Du ngoạn Vịnh Hạ Long",
                Location = "Quảng Ninh",
                Price = 3500000,
                Duration = "2 ngày 1 đêm",
                Image = "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16",
                Rating = 4.9,
                Reviews = 1234,
                Description = "Khám phá kỳ quan thiên nhiên thế giới với hàng ngàn đảo đá vôi kỳ vĩ. Tour bao gồm du thuyền sang trọng, thăm hang động, chèo kayak và thưởng thức hải sản tươi ngon trên vịnh.",
                Highlights = new List<string> { "Du thuyền 5 sao ngủ đêm trên vịnh", "Thăm hang Sửng Sốt, động Thiên Cung", "Chèo kayak khám phá làng chài", "Câu mực đêm trên biển", "Buffet hải sản tươi sống", "Tập Thái Cực Quyền trên boong tàu" },
                Included = new List<string> { "Xe đưa đón từ Hà Nội", "Du thuyền 5 sao", "2 bữa ăn chính + bữa sáng", "Vé thăm quan", "Hướng dẫn viên tiếng Việt", "Bảo hiểm du lịch" },
                Excluded = new List<string> { "Chi phí cá nhân", "Đồ uống có cồn", "Tip hướng dẫn viên" }
            });

            Tours.Add(new Tour
            {
                Id = "2",
                Title = "Thiên đường Phú Quốc",
                Location = "Kiên Giang",
                Price = 5200000,
                Duration = "4 ngày 3 đêm",
                Image = "https://images.unsplash.com/photo-1732243395944-cb3ff9311091",
                Rating = 4.8,
                Reviews = 892,
                Description = "Nghỉ dưỡng tại đảo ngọc với bãi biển xanh ngọc bích, resort 5 sao và ẩm thực hải sản tươi ngon. Trải nghiệm lặn ngắm san hô, câu cá và tham quan vườn tiêu.",
                Highlights = new List<string> { "Resort 5 sao view biển", "Lặn ngắm san hô tại Hòn Thơm", "Câu cá & BBQ hải sản", "Tham quan vườn tiêu, làng chài", "VinWonders & Safari Phú Quốc", "Sunset Sanato Beach Club" },
                Included = new List<string> { "Vé máy bay khứ hồi", "Resort 5 sao", "Ăn sáng buffet", "Tour 4 đảo", "Xe đưa đón sân bay" },
                Excluded = new List<string> { "Chi phí tham quan riêng", "Bữa trưa, tối", "Vé VinWonders" }
            });

            Tours.Add(new Tour
            {
                Id = "3",
                Title = "Mù Cang Chải - Sa Pa",
                Location = "Lào Cai",
                Price = 4800000,
                Duration = "3 ngày 2 đêm",
                Image = "https://images.unsplash.com/photo-1649530928914-c2df337e3007",
                Rating = 4.9,
                Reviews = 756,
                Description = "Chiêm ngưỡng ruộng bậc thang mùa lúa chín vàng tuyệt đẹp, khám phá văn hóa dân tộc thiểu số và trekking qua những cung đường đèo núi hùng vĩ.",
                Highlights = new List<string> { "Ruộng bậc thang Mù Cang Chải", "Đèo Khau Phạ hùng vĩ", "Thác Tình Yêu Sa Pa", "Trekking bản Cát Cát, Tả Van", "Chợ tình Sa Pa cuối tuần", "Fansipan đỉnh Đông Dương" },
                Included = new List<string> { "Xe limousine đưa đón", "Khách sạn 3-4 sao", "3 bữa ăn/ngày", "Hướng dẫn viên", "Vé thăm quan" },
                Excluded = new List<string> { "Cáp treo Fansipan", "Chi phí cá nhân" }
            });

            Tours.Add(new Tour
            {
                Id = "4",
                Title = "Biển xanh Đà Nẵng",
                Location = "Đà Nẵng",
                Price = 3200000,
                Duration = "3 ngày 2 đêm",
                Image = "https://images.unsplash.com/photo-1723142282970-1fd415eec1ad",
                Rating = 4.7,
                Reviews = 1089,
                Description = "Tận hưởng bãi biển Mỹ Khê đẹp nhất hành tinh, chiêm ngưỡng cầu Vàng nổi tiếng, khám phá Bà Nà Hills và thưởng thức ẩm thực Đà Nẵng đặc sắc.",
                Highlights = new List<string> { "Biển Mỹ Khê, Non Nước", "Cầu Vàng - Bà Nà Hills", "Chùa Linh Ứng, Ngũ Hành Sơn", "Phố cổ Hội An về đêm", "Ăn tối trên du thuyền sông Hàn", "Chợ Hàn, Cồn market" },
                Included = new List<string> { "Vé máy bay", "Khách sạn 4 sao", "Ăn sáng", "Xe đưa đón", "Vé Bà Nà Hills" },
                Excluded = new List<string> { "Bữa trưa, tối", "Cáp treo Ngũ Hành Sơn" }
            });

            Tours.Add(new Tour
            {
                Id = "5",
                Title = "Phố cổ Hội An",
                Location = "Quảng Nam",
                Price = 2800000,
                Duration = "2 ngày 1 đêm",
                Image = "https://images.unsplash.com/photo-1664650440553-ab53804814b3",
                Rating = 5.0,
                Reviews = 1456,
                Description = "Khám phá di sản văn hóa thế giới với phố cổ lung linh đèn lồng, tìm hiểu nghề thủ công truyền thống và thưởng thức ẩm thực đặc sản Hội An.",
                Highlights = new List<string> { "Phố cổ lung linh đèn lồng", "Chùa Cầu Nhật Bản", "Làng gốm Thanh Hà", "Rừng dừa Bảy Mẫu", "Thả đèn hoa đăng sông Hoài", "Học làm bánh dân gian" },
                Included = new List<string> { "Xe đưa đón từ Đà Nẵng", "Homestay phố cổ", "Ăn sáng", "Vé thăm quan", "Hướng dẫn viên" },
                Excluded = new List<string> { "Chi phí cá nhân", "Vé rừng dừa" }
            });

            Tours.Add(new Tour
            {
                Id = "6",
                Title = "Nha Trang - Vịnh xanh",
                Location = "Khánh Hòa",
                Price = 3900000,
                Duration = "3 ngày 2 đêm",
                Image = "https://images.unsplash.com/photo-1533002832-1721d16b4bb9",
                Rating = 4.8,
                Reviews = 967,
                Description = "Vui chơi tại thiên đường biển Nha Trang với hoạt động lặn ngắm san hô, tham quan đảo, tắm bùn khoáng và trải nghiệm công viên nước VinWonders.",
                Highlights = new List<string> { "Tour 4 đảo Nha Trang", "Lặn ngắm san hô biển sâu", "Tắm bùn khoáng Thap Ba", "VinWonders Nha Trang", "Chùa Long Sơn, tháp Bà Ponagar", "Buffet hải sản biển" },
                Included = new List<string> { "Vé máy bay khứ hồi", "Khách sạn 4 sao", "Ăn sáng", "Tour 4 đảo", "Xe đưa đón" },
                Excluded = new List<string> { "VinWonders", "Tắm bùn", "Bữa trưa, tối" }
            });

            Tours.Add(new Tour
            {
                Id = "7",

            });

            // Seed Rooms
            Rooms.Add(new Room { Id = 1, Name = "Deluxe Ocean View", Type = "Deluxe", Price = 3980000, Status = "available", Beds = 2, Guests = 4 });
            Rooms.Add(new Room { Id = 2, Name = "Premium Suite", Type = "Suite", Price = 5980000, Status = "booked", Beds = 1, Guests = 2 });
            Rooms.Add(new Room { Id = 3, Name = "Standard Twin Room", Type = "Standard", Price = 2580000, Status = "available", Beds = 2, Guests = 2 });
            Rooms.Add(new Room { Id = 4, Name = "Family Room", Type = "Family", Price = 4980000, Status = "available", Beds = 3, Guests = 6 });

            // Seed Bookings
            Bookings.Add(new Booking
            {
                Id = "ORD-1715234567890",
                TourId = "1",
                TourTitle = "Du ngoạn Vịnh Hạ Long",
                TourImage = "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16",
                UserId = "3",
                UserEmail = "user@travelhub.com",
                Date = "2026-07-15",
                Guests = 2,
                Total = 7000000,
                Status = "confirmed"
            });
            Bookings.Add(new Booking
            {
                Id = "ORD-1714123456789",
                TourId = "2",
                TourTitle = "Thiên đường Phú Quốc",
                TourImage = "https://images.unsplash.com/photo-1732243395944-cb3ff9311091",
                UserId = "3",
                UserEmail = "user@travelhub.com",
                Date = "2026-08-20",
                Guests = 3,
                Total = 15600000,
                Status = "pending"
            });
        }

        public bool ConfirmBooking(string bookingId)
        {
            var booking = Bookings.FirstOrDefault(b => b.Id == bookingId);
            if (booking == null) return false;
            booking.Status = "confirmed";
            return true;
        }
    }
}
