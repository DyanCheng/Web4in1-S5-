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
                Title = "Sa Pa - Fansipan Cát Cát",
                Location = "Lào Cai",
                Price = 2900000,
                Duration = "2 ngày 1 đêm",
                Image = "https://images.unsplash.com/photo-1589308078059-be1415eab4c3",
                Rating = 4.8,
                Reviews = 512,
                Description = "Chinh phục đỉnh Fansipan huyền thoại bằng cáp treo hiện đại, trekking qua bản Cát Cát của người H'Mông và thưởng thức ẩm thực Tây Bắc độc đáo.",
                Highlights = new List<string> { "Cáp treo Fansipan 3 dây", "Bản Cát Cát mộc mạc", "Thung lũng Mường Hoa", "Khách sạn trung tâm Sapa", "Thịt trâu gác bếp & rượu ngô" },
                Included = new List<string> { "Xe giường nằm Hà Nội - Sapa", "Khách sạn 3 sao", "Các bữa ăn theo chương trình", "Vé tham quan Cát Cát" },
                Excluded = new List<string> { "Vé cáp treo Fansipan (800k)", "Chi phí cá nhân", "Đồ uống" }
            });

            Tours.Add(new Tour
            {
                Id = "8",
                Title = "Hà Giang - Mã Pí Lèng hùng vi",
                Location = "Hà Giang",
                Price = 3600000,
                Duration = "3 ngày 2 đêm",
                Image = "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac",
                Rating = 4.9,
                Reviews = 423,
                Description = "Chinh phục những con đèo uốn lượn hiểm trở, ghé thăm cột cờ Lũng Cú linh thiêng, chèo thuyền trên dòng sông Nho Quế xanh ngắt và ngắm nhìn đèo Mã Pí Lèng kỳ vĩ.",
                Highlights = new List<string> { "Đèo Mã Pí Lèng đệ nhất đèo", "Cột cờ Lũng Cú", "Dinh thự họ Vương cổ kính", "Sông Nho Quế & hẻm Tu Sản", "Ngắm đồng hoa tam giác mạch" },
                Included = new List<string> { "Xe du lịch chất lượng cao", "Homestay/Khách sạn tiêu chuẩn", "Ăn sáng & chính", "Vé thuyền sông Nho Quế", "Bảo hiểm" },
                Excluded = new List<string> { "Tiền tip HDV", "Đồ uống phát sinh" }
            });

            Tours.Add(new Tour
            {
                Id = "9",
                Title = "Phong Nha - Động Thiên Đường",
                Location = "Quảng Bình",
                Price = 4200000,
                Duration = "3 ngày 2 đêm",
                Image = "https://images.unsplash.com/photo-1504457047772-27f8522422b3",
                Rating = 4.9,
                Reviews = 289,
                Description = "Khám phá hệ thống hang động thạch nhũ đẹp nhất thế giới tại Di sản Thiên nhiên Thế giới Phong Nha - Kẻ Bàng, chèo thuyền Kayak trên sông Son thanh bình.",
                Highlights = new List<string> { "Động Thiên Đường hoành tráng", "Động Phong Nha kỳ vĩ", "Zipline sông Chày hang Tối", "Suối nước Moọc trong xanh", "Ẩm thực gà đồi, cá sông Son" },
                Included = new List<string> { "Vé tàu/xe đến Đồng Hới", "Khách sạn 3 sao gần biển", "Vé các điểm tham quan", "Hướng dẫn viên bản địa", "Bữa ăn theo tour" },
                Excluded = new List<string> { "Vé máy bay", "Thuế VAT", "Chi tiêu cá nhân" }
            });

            Tours.Add(new Tour
            {
                Id = "10",
                Title = "Di sản Cố đô Huế lãng mạn",
                Location = "Thừa Thiên Huế",
                Price = 2500000,
                Duration = "2 ngày 1 đêm",
                Image = "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9",
                Rating = 4.8,
                Reviews = 612,
                Description = "Khám phá lịch sử triều Nguyễn tại Đại Nội Huế, ngắm hoàng hôn trên sông Hương thơ mộng, ghé thăm chùa Thiên Mụ cổ kính và các lăng tẩm hoàng gia.",
                Highlights = new List<string> { "Đại Nội Huế uy nghiêm", "Lăng Khải Định, Tự Đức", "Chùa Thiên Mụ cổ kính", "Ca Huế trên sông Hương", "Thưởng thức ẩm thực cung đình" },
                Included = new List<string> { "Xe du lịch đón tiễn", "Khách sạn 4 sao sông Hương", "Vé tham quan các điểm", "Ca huế sông Hương", "Bữa trưa ẩm thực Huế" },
                Excluded = new List<string> { "Vé máy bay khứ hồi", "Các bữa tối tự do" }
            });

            Tours.Add(new Tour
            {
                Id = "11",
                Title = "Mùa hoa anh đào Kyoto cổ kính",
                Location = "Kyoto, Nhật Bản",
                Price = 42000000,
                Duration = "5 ngày 4 đêm",
                Image = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
                Rating = 5.0,
                Reviews = 340,
                Description = "Trải nghiệm văn hóa truyền thống Nhật Bản tại cố đô cổ kính. Ngắm hoa anh đào nở rộ bên những ngôi đền gỗ hàng trăm năm tuổi, thưởng thức trà đạo tinh tế.",
                Highlights = new List<string> { "Đền Fushimi Inari ngàn cổng", "Chùa Vàng Kinkaku-ji", "Rừng tre Arashiyama", "Biểu diễn trà đạo Kyoto", "Thưởng thức ẩm thực Kaiseki" },
                Included = new List<string> { "Vé máy bay khứ hồi", "Khách sạn 4 sao truyền thống", "Visa du lịch Nhật Bản", "Hướng dẫn viên suốt tuyến", "Vé tàu Shinkansen" },
                Excluded = new List<string> { "Chi tiêu mua sắm cá nhân", "Tiền tip HDV & tài xế" }
            });

            Tours.Add(new Tour
            {
                Id = "12",
                Title = "Paris - Kinh đô ánh sáng lãng mạn",
                Location = "Paris, Pháp",
                Price = 68000000,
                Duration = "7 ngày 6 đêm",
                Image = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
                Rating = 4.9,
                Reviews = 198,
                Description = "Chiêm ngưỡng tháp Eiffel rực rỡ về đêm, dạo bước trên đại lộ Champs-Élysées sang trọng, tham quan bảo tàng Louvre huyền thoại và đi du thuyền trên sông Seine thơ mộng.",
                Highlights = new List<string> { "Tháp Eiffel & Khải Hoàn Môn", "Bảo tàng Louvre nổi tiếng", "Cung điện Versailles lộng lẫy", "Du thuyền sông Seine hoàng hôn", "Mua sắm tại Galeries Lafayette" },
                Included = new List<string> { "Vé máy bay khứ hồi từ VN", "Khách sạn 4-5 sao trung tâm", "Thủ tục xin visa Schengen", "Vé vào cổng các điểm tham quan", "Các bữa ăn phong cách Pháp" },
                Excluded = new List<string> { "Chi phí giặt là, điện thoại", "Tip cho HDV & tài xế" }
            });

            Tours.Add(new Tour
            {
                Id = "13",
                Title = "Dubai - Thiên đường giải trí & mua sắm",
                Location = "Dubai, UAE",
                Price = 31500000,
                Duration = "5 ngày 4 đêm",
                Image = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
                Rating = 4.8,
                Reviews = 277,
                Description = "Khám phá thành phố tương lai giữa sa mạc, chinh phục tòa nhà cao nhất thế giới Burj Khalifa, trải nghiệm xe địa hình vượt cồn cát safari và ăn tối dưới bầu trời sao.",
                Highlights = new List<string> { "Tòa tháp Burj Khalifa cao nhất", "Đảo cọ nhân tạo Palm Jumeirah", "Safari sa mạc & cưỡi lạc đà", "Khách sạn 7 sao Burj Al Arab", "Trung tâm thương mại Dubai Mall" },
                Included = new List<string> { "Vé máy bay khứ hồi", "Khách sạn 5 sao sang trọng", "Visa nhập cảnh Dubai", "Tour xe địa hình Safari & ăn tối", "Xe đưa đón tiện nghi" },
                Excluded = new List<string> { "Các bữa trưa tự do", "Chi phí cá nhân" }
            });

            Tours.Add(new Tour
            {
                Id = "14",
                Title = "Bali - Thiên đường nghỉ dưỡng nhiệt đới",
                Location = "Bali, Indonesia",
                Price = 14500000,
                Duration = "4 ngày 3 đêm",
                Image = "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
                Rating = 4.9,
                Reviews = 845,
                Description = "Nghỉ dưỡng tại hòn đảo tâm linh với những ngôi đền cổ kính trên mặt biển, ngắm hoàng hôn lãng mạn tại Uluwatu và vui chơi chụp ảnh tại xích đu Bali Swing nổi tiếng.",
                Highlights = new List<string> { "Đền Tanah Lot trên biển", "Cổng trời Lempuyang linh thiêng", "Trải nghiệm Bali Swing & tổ chim", "Trekking ruộng bậc thang Tegalalang", "Tắm biển Kuta cát trắng mịn" },
                Included = new List<string> { "Vé máy bay khứ hồi thẳng", "Resort 4 sao có bể bơi vô cực", "Vé tham quan các điểm", "Hướng dẫn viên nói tiếng Việt", "Các bữa ăn đặc sản địa phương" },
                Excluded = new List<string> { "Tip bắt buộc cho local guide", "Đồ uống và các trò chơi nước" }
            });

            Tours.Add(new Tour
            {
                Id = "15",
                Title = "Côn Đảo - Đảo ngọc hoang sơ",
                Location = "Bà Rịa - Vũng Tàu",
                Price = 7800000,
                Duration = "4 ngày 3 đêm",
                Image = "https://images.unsplash.com/photo-1559494007-9f5847c49d94",
                Rating = 4.9,
                Reviews = 312,
                Description = "Khám phá hòn đảo hoang sơ bậc nhất Việt Nam với những bãi biển trong vắt, rừng nguyên sinh, rùa biển đẻ trứng về đêm và di tích lịch sử cảm xúc Nhà tù Côn Đảo.",
                Highlights = new List<string> { "Bãi Đầm Trầu nước biếc cát trắng", "Ngắm rùa đẻ trứng ban đêm", "Lặn ngắm san hô Hòn Bảy Cạnh", "Tham quan Nhà tù Côn Đảo", "Đền thờ Cô Sáu linh thiêng", "Trekking vườn quốc gia Côn Đảo" },
                Included = new List<string> { "Vé máy bay khứ hồi TP.HCM", "Resort 4 sao sát biển", "Ăn sáng mỗi ngày", "Xe đưa đón sân bay", "Hướng dẫn viên địa phương" },
                Excluded = new List<string> { "Vé tàu ngầm ngắm san hô", "Bữa trưa, tối tự do", "Chi phí cá nhân" }
            });

            Tours.Add(new Tour
            {
                Id = "16",
                Title = "Đà Lạt - Thành phố ngàn hoa",
                Location = "Lâm Đồng",
                Price = 2200000,
                Duration = "3 ngày 2 đêm",
                Image = "https://images.unsplash.com/photo-1599576838688-8aab534cabb1",
                Rating = 4.7,
                Reviews = 1820,
                Description = "Dạo bước giữa thành phố ngàn hoa với khí hậu se lạnh quanh năm, thăm vườn hoa rực rỡ, hồ Xuân Hương thơ mộng, cưỡi ngựa xem đà lạt và thưởng thức cà phê ban mai.",
                Highlights = new List<string> { "Hồ Xuân Hương lãng mạn", "Vườn hoa thành phố rực rỡ", "Thung lũng Tình Yêu xanh mát", "Đồi chè Cầu Đất mênh mông", "Chợ đêm Đà Lạt nhộn nhịp", "Cưỡi ngựa ngắm thành phố" },
                Included = new List<string> { "Xe limousine đưa đón", "Khách sạn 4 sao view đồi", "Ăn sáng buffet", "Vé tham quan các điểm", "Hướng dẫn viên nhiệt tình" },
                Excluded = new List<string> { "Vé cáp treo", "Trải nghiệm thú vị lẻ", "Chi phí cá nhân" }
            });

            Tours.Add(new Tour
            {
                Id = "17",
                Title = "Ninh Bình - Hạ Long cạn",
                Location = "Ninh Bình",
                Price = 1800000,
                Duration = "2 ngày 1 đêm",
                Image = "https://images.unsplash.com/photo-1540394978272-028af9f58a5a",
                Rating = 4.8,
                Reviews = 1103,
                Description = "Chèo thuyền qua những hang núi đá vôi huyền bí, khám phá quần thể di tích Tràng An, leo 500 bậc lên đỉnh chùa Bái Đính lớn nhất Đông Nam Á và thăm cố đô Hoa Lư.",
                Highlights = new List<string> { "Chèo thuyền Tràng An, Tam Cốc", "Chùa Bái Đính hoành tráng", "Cố đô Hoa Lư nghìn năm tuổi", "Khu du lịch Thung Nham", "Ngắm đàn cò trắng Thung Nham", "Leo đỉnh núi Mua panorama" },
                Included = new List<string> { "Xe ô tô từ Hà Nội", "Vé thuyền Tràng An/Tam Cốc", "Bữa trưa đặc sản dê núi", "Hướng dẫn viên" },
                Excluded = new List<string> { "Vé cáp treo Bái Đính", "Bữa tối", "Chi phí phát sinh" }
            });

            Tours.Add(new Tour
            {
                Id = "18",
                Title = "Quy Nhơn - Bình Định ẩn mình",
                Location = "Bình Định",
                Price = 3100000,
                Duration = "3 ngày 2 đêm",
                Image = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
                Rating = 4.7,
                Reviews = 387,
                Description = "Khám phá viên ngọc ẩn của du lịch miền Trung với bãi biển Kỳ Co trong như pha lê, bãi đá trứng Quy Hòa độc đáo, đầm Thị Nại lung linh và ẩm thực biển phong phú.",
                Highlights = new List<string> { "Kỳ Co - Eo Gió tuyệt đẹp", "Bãi đá trứng Quy Hòa lạ mắt", "Đầm Thị Nại bình yên", "Tháp Chàm Dương Long cổ kính", "Ẩm thực bánh hỏi thịt heo quay", "Chụp ảnh hoàng hôn bãi Tắm" },
                Included = new List<string> { "Vé máy bay hoặc tàu hỏa", "Khách sạn 3-4 sao ven biển", "Ăn sáng buffet", "Xe tham quan", "Vé thuyền Kỳ Co" },
                Excluded = new List<string> { "Bữa trưa, tối", "Trò chơi thể thao biển" }
            });

            Tours.Add(new Tour
            {
                Id = "19",
                Title = "Cần Thơ - Miền Tây sông nước",
                Location = "Cần Thơ",
                Price = 1500000,
                Duration = "2 ngày 1 đêm",
                Image = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
                Rating = 4.6,
                Reviews = 743,
                Description = "Đắm mình trong nét văn hóa sông nước miền Tây đặc sắc, dậy sớm tham quan chợ nổi Cái Răng nhộn nhịp, chèo xuồng giữa vườn trái cây sum suê và thưởng thức ẩm thực đồng quê.",
                Highlights = new List<string> { "Chợ nổi Cái Răng sáng sớm", "Vườn cây ăn trái Mỹ Khánh", "Chèo xuồng kênh rạch yên bình", "Chùa Ông Bắc Liêu cổ kính", "Làng nghề bánh tráng truyền thống", "Hủ tiếu Nam Vang chính gốc" },
                Included = new List<string> { "Xe limousine từ TP.HCM", "Nhà hàng nổi qua đêm", "Ăn sáng đặc sản miền Tây", "Thuyền tham quan chợ nổi", "Hướng dẫn viên địa phương" },
                Excluded = new List<string> { "Bữa trưa tự chọn", "Đồ uống cá nhân" }
            });

            Tours.Add(new Tour
            {
                Id = "20",
                Title = "Mekong Delta - Khám phá đồng bằng",
                Location = "Tiền Giang - Bến Tre",
                Price = 1200000,
                Duration = "1 ngày",
                Image = "https://images.unsplash.com/photo-1509316785289-025f5b846b35",
                Rating = 4.6,
                Reviews = 956,
                Description = "Tour 1 ngày trải nghiệm đầy đủ sắc màu miền Tây sông nước: đi thuyền len lỏi kênh rạch xanh mát, ghé thăm làng kẹo dừa, vườn bưởi da xanh và thưởng thức nhạc tài tử Nam Bộ.",
                Highlights = new List<string> { "Đi thuyền kênh rạch Bến Tre", "Tham quan làng kẹo dừa truyền thống", "Thưởng thức nhạc tài tử Nam Bộ", "Vườn bưởi da xanh sum suê", "Cưỡi xe ngựa qua làng quê", "Ăn trưa tại nhà hàng nổi" },
                Included = new List<string> { "Xe từ TP.HCM", "Thuyền tham quan", "Bữa trưa đặc sản", "Hướng dẫn viên tiếng Việt" },
                Excluded = new List<string> { "Đồ uống cá nhân", "Mua đặc sản mang về" }
            });

            Tours.Add(new Tour
            {
                Id = "21",
                Title = "Bangkok - Siam xinh đẹp",
                Location = "Bangkok, Thái Lan",
                Price = 8500000,
                Duration = "4 ngày 3 đêm",
                Image = "https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5",
                Rating = 4.7,
                Reviews = 621,
                Description = "Khám phá thủ đô sôi động của Thái Lan với những ngôi chùa dát vàng nguy nga, ẩm thực đường phố đặc sắc, chợ nổi cuối tuần và trải nghiệm cuộc sống về đêm ở Khao San Road.",
                Highlights = new List<string> { "Cung điện Hoàng gia Grand Palace", "Chùa Phật Vàng Wat Traimit", "Chợ nổi Damnoen Saduak", "Đường phố ẩm thực Yaowarat", "Chùa Phật Nằm Wat Pho", "Chợ cuối tuần Chatuchak" },
                Included = new List<string> { "Vé máy bay khứ hồi", "Khách sạn 4 sao trung tâm", "Visa on arrival hỗ trợ", "Xe đưa đón sân bay", "Hướng dẫn viên tiếng Việt" },
                Excluded = new List<string> { "Bữa trưa, tối tự do", "Chi phí mua sắm" }
            });

            Tours.Add(new Tour
            {
                Id = "22",
                Title = "Singapore - Lion City hiện đại",
                Location = "Singapore",
                Price = 12000000,
                Duration = "4 ngày 3 đêm",
                Image = "https://images.unsplash.com/photo-1525625293386-3f8f99389edd",
                Rating = 4.8,
                Reviews = 445,
                Description = "Trải nghiệm thành phố sư tử với kiến trúc tương lai Gardens by the Bay, khu vui chơi Universal Studios, chiêm ngưỡng vịnh Marina Bay Sands lộng lẫy và thưởng thức ẩm thực đa văn hóa.",
                Highlights = new List<string> { "Gardens by the Bay cây siêu cao", "Marina Bay Sands rooftop pool", "Universal Studios Singapore", "Sentosa Island vui chơi", "Chinatown & Little India sắc màu", "Ăn tối tại hawker centre" },
                Included = new List<string> { "Vé máy bay khứ hồi thẳng", "Khách sạn 4 sao trung tâm", "Vé Gardens by the Bay", "Xe đưa đón sân bay", "Hướng dẫn viên" },
                Excluded = new List<string> { "Vé Universal Studios", "Bữa ăn tự do", "Chi phí cá nhân" }
            });

            Tours.Add(new Tour
            {
                Id = "23",
                Title = "Santorini - Đảo xanh trắng Địa Trung Hải",
                Location = "Santorini, Hy Lạp",
                Price = 85000000,
                Duration = "7 ngày 6 đêm",
                Image = "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff",
                Rating = 5.0,
                Reviews = 134,
                Description = "Lạc bước trên hòn đảo thiên đường với những ngôi nhà trắng tinh khôi trên nền trời xanh biếc, ngắm hoàng hôn đẹp nhất thế giới tại Oia và tắm biển tại vùng nước ấm áp Aegean.",
                Highlights = new List<string> { "Hoàng hôn Oia đẹp nhất thế giới", "Nhà thờ mái vòm xanh iconic", "Tắm suối nước nóng núi lửa", "Du thuyền vòng quanh Caldera", "Thưởng thức rượu vang Assyrtiko", "Thị trấn Fira lung linh về đêm" },
                Included = new List<string> { "Vé máy bay khứ hồi (có transit)", "Villa/Hotel 5 sao view Caldera", "Visa Schengen hỗ trợ", "Du thuyền vòng đảo", "Các bữa ăn sáng theo tour" },
                Excluded = new List<string> { "Chi phí transit tại châu Âu", "Bữa trưa, tối tự do", "Tip" }
            });

            Tours.Add(new Tour
            {
                Id = "24",
                Title = "Tokyo - Nhật Bản hiện đại & truyền thống",
                Location = "Tokyo, Nhật Bản",
                Price = 38000000,
                Duration = "6 ngày 5 đêm",
                Image = "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
                Rating = 4.9,
                Reviews = 512,
                Description = "Hòa mình vào nhịp sống siêu tốc của Tokyo với đèn neon Shibuya, ẩm thực Ramen và Sushi trứ danh, đền Senso-ji nghìn năm lịch sử, ngắm núi Phú Sĩ tuyết phủ và mua sắm tại Akihabara.",
                Highlights = new List<string> { "Giao lộ Shibuya nhộn nhịp", "Đền Senso-ji cổ kính Asakusa", "Ngắm Phú Sĩ từ Hakone", "Akihabara - thiên đường điện tử", "Teamlab Borderless thực tế ảo", "Sushi tại chợ cá Tsukiji" },
                Included = new List<string> { "Vé máy bay khứ hồi", "Khách sạn 4 sao trung tâm", "Visa Nhật Bản hỗ trợ", "JR Pass 7 ngày đi lại thoải mái", "Hướng dẫn viên tiếng Việt" },
                Excluded = new List<string> { "Chi phí ăn uống tự do", "Vé Teamlab Borderless", "Mua sắm cá nhân" }
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
