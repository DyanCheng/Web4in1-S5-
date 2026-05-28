import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, Users, Star, Clock, CheckCircle, X, Heart, Share2, Plane } from 'lucide-react';

export default function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const tours = {
    '1': {
      id: '1',
      title: "Du ngoạn Vịnh Hạ Long",
      location: "Quảng Ninh",
      price: 3500000,
      duration: "2 ngày 1 đêm",
      image: "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16",
      rating: 4.9,
      reviews: 1234,
      description: "Khám phá kỳ quan thiên nhiên thế giới với hàng ngàn đảo đá vôi kỳ vĩ. Tour bao gồm du thuyền sang trọng, thăm hang động, chèo kayak và thưởng thức hải sản tươi ngon trên vịnh.",
      highlights: [
        "Du thuyền 5 sao ngủ đêm trên vịnh",
        "Thăm hang Sửng Sốt, động Thiên Cung",
        "Chèo kayak khám phá làng chài",
        "Câu mực đêm trên biển",
        "Buffet hải sản tươi sống",
        "Tập Thái Cực Quyền trên boong tàu"
      ],
      included: ["Xe đưa đón từ Hà Nội", "Du thuyền 5 sao", "2 bữa ăn chính + bữa sáng", "Vé thăm quan", "Hướng dẫn viên tiếng Việt", "Bảo hiểm du lịch"],
      excluded: ["Chi phí cá nhân", "Đồ uống có cồn", "Tip hướng dẫn viên"]
    },
    '2': {
      id: '2',
      title: "Thiên đường Phú Quốc",
      location: "Kiên Giang",
      price: 5200000,
      duration: "4 ngày 3 đêm",
      image: "https://images.unsplash.com/photo-1732243395944-cb3ff9311091",
      rating: 4.8,
      reviews: 892,
      description: "Nghỉ dưỡng tại đảo ngọc với bãi biển xanh ngọc bích, resort 5 sao và ẩm thực hải sản tươi ngon. Trải nghiệm lặn ngắm san hô, câu cá và tham quan vườn tiêu.",
      highlights: [
        "Resort 5 sao view biển",
        "Lặn ngắm san hô tại Hòn Thơm",
        "Câu cá & BBQ hải sản",
        "Tham quan vườn tiêu, làng chài",
        "VinWonders & Safari Phú Quốc",
        "Sunset Sanato Beach Club"
      ],
      included: ["Vé máy bay khứ hồi", "Resort 5 sao", "Ăn sáng buffet", "Tour 4 đảo", "Xe đưa đón sân bay"],
      excluded: ["Chi phí tham quan riêng", "Bữa trưa, tối", "Vé VinWonders"]
    },
    '3': {
      id: '3',
      title: "Mù Cang Chải - Sa Pa",
      location: "Lào Cai",
      price: 4800000,
      duration: "3 ngày 2 đêm",
      image: "https://images.unsplash.com/photo-1649530928914-c2df337e3007",
      rating: 4.9,
      reviews: 756,
      description: "Chiêm ngưỡng ruộng bậc thang mùa lúa chín vàng tuyệt đẹp, khám phá văn hóa dân tộc thiểu số và trekking qua những cung đường đèo núi hùng vĩ.",
      highlights: [
        "Ruộng bậc thang Mù Cang Chải",
        "Đèo Khau Phạ hùng vĩ",
        "Thác Tình Yêu Sa Pa",
        "Trekking bản Cát Cát, Tả Van",
        "Chợ tình Sa Pa cuối tuần",
        "Fansipan đỉnh Đông Dương"
      ],
      included: ["Xe limousine đưa đón", "Khách sạn 3-4 sao", "3 bữa ăn/ngày", "Hướng dẫn viên", "Vé thăm quan"],
      excluded: ["Cáp treo Fansipan", "Chi phí cá nhân"]
    },
    '4': {
      id: '4',
      title: "Biển xanh Đà Nẵng",
      location: "Đà Nẵng",
      price: 3200000,
      duration: "3 ngày 2 đêm",
      image: "https://images.unsplash.com/photo-1723142282970-1fd415eec1ad",
      rating: 4.7,
      reviews: 1089,
      description: "Tận hưởng bãi biển Mỹ Khê đẹp nhất hành tinh, chiêm ngưỡng cầu Vàng nổi tiếng, khám phá Bà Nà Hills và thưởng thức ẩm thực Đà Nẵng đặc sắc.",
      highlights: [
        "Biển Mỹ Khê, Non Nước",
        "Cầu Vàng - Bà Nà Hills",
        "Chùa Linh Ứng, Ngũ Hành Sơn",
        "Phố cổ Hội An về đêm",
        "Ăn tối trên du thuyền sông Hàn",
        "Chợ Hàn, Cồn market"
      ],
      included: ["Vé máy bay", "Khách sạn 4 sao", "Ăn sáng", "Xe đưa đón", "Vé Bà Nà Hills"],
      excluded: ["Bữa trưa, tối", "Cáp treo Ngũ Hành Sơn"]
    },
    '5': {
      id: '5',
      title: "Phố cổ Hội An",
      location: "Quảng Nam",
      price: 2800000,
      duration: "2 ngày 1 đêm",
      image: "https://images.unsplash.com/photo-1664650440553-ab53804814b3",
      rating: 5.0,
      reviews: 1456,
      description: "Khám phá di sản văn hóa thế giới với phố cổ lung linh đèn lồng, tìm hiểu nghề thủ công truyền thống và thưởng thức ẩm thực đặc sản Hội An.",
      highlights: [
        "Phố cổ lung linh đèn lồng",
        "Chùa Cầu Nhật Bản",
        "Làng gốm Thanh Hà",
        "Rừng dừa Bảy Mẫu",
        "Thả đèn hoa đăng sông Hoài",
        "Học làm bánh dân gian"
      ],
      included: ["Xe đưa đón từ Đà Nẵng", "Homestay phố cổ", "Ăn sáng", "Vé thăm quan", "Hướng dẫn viên"],
      excluded: ["Chi phí cá nhân", "Vé rừng dừa"]
    },
    '6': {
      id: '6',
      title: "Nha Trang - Vịnh xanh",
      location: "Khánh Hòa",
      price: 3900000,
      duration: "3 ngày 2 đêm",
      image: "https://images.unsplash.com/photo-1533002832-1721d16b4bb9",
      rating: 4.8,
      reviews: 967,
      description: "Vui chơi tại thiên đường biển Nha Trang với hoạt động lặn ngắm san hô, tham quan đảo, tắm bùn khoáng và trải nghiệm công viên nước VinWonders.",
      highlights: [
        "Tour 4 đảo Nha Trang",
        "Lặn ngắm san hô biển sâu",
        "Tắm bùn khoáng Thap Ba",
        "VinWonders Nha Trang",
        "Chùa Long Sơn, tháp Bà Ponagar",
        "Buffet hải sản biển"
      ],
      included: ["Vé máy bay khứ hồi", "Khách sạn 4 sao", "Ăn sáng", "Tour 4 đảo", "Xe đưa đón"],
      excluded: ["VinWonders", "Tắm bùn", "Bữa trưa, tối"]
    }
  };

  const tour = tours[id as keyof typeof tours] || tours['1'];

  const handleBooking = () => {
    if (!selectedDate) {
      alert('Vui lòng chọn ngày khởi hành');
      return;
    }

    addToCart({
      tourId: tour.id,
      title: tour.title,
      image: tour.image,
      price: tour.price,
      quantity: 1,
      date: selectedDate,
      guests
    });

    setShowBookingModal(true);
  };

  const allReviews = [
    { id: 1, name: "Nguyễn Văn A", rating: 5, date: "2026-04-15", comment: "Tour tuyệt vời! Mọi thứ đều hoàn hảo từ A-Z. Hướng dẫn viên rất nhiệt tình.", avatar: "👨" },
    { id: 2, name: "Trần Thị B", rating: 5, date: "2026-04-10", comment: "Trải nghiệm đáng nhớ! Cảnh đẹp, dịch vụ tốt, giá hợp lý.", avatar: "👩" },
    { id: 3, name: "Lê Văn C", rating: 4, date: "2026-04-05", comment: "Rất tốt, chỉ có điều thời tiết không thuận lợi lắm.", avatar: "👨‍💼" },
    { id: 4, name: "Phạm Thị D", rating: 5, date: "2026-03-28", comment: "Gia đình tôi rất hài lòng. Sẽ quay lại lần sau!", avatar: "👩‍🦰" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Plane className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900">TravelHub</span>
            </div>
            <Link to="/" className="text-blue-600 hover:text-blue-700">← Quay lại</Link>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-96">
        <ImageWithFallback
          src={tour.image}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="size-5" />
              <span>{tour.location}</span>
            </div>
            <h1 className="text-4xl mb-4">{tour.title}</h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="size-5 fill-yellow-400 text-yellow-400" />
                <span>{tour.rating} ({tour.reviews} đánh giá)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-5" />
                <span>{tour.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setSaved(!saved)}
            className="size-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className={`size-6 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
          <button className="size-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Share2 className="size-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl text-gray-900 mb-4">Mô tả</h2>
              <p className="text-gray-700 leading-relaxed">{tour.description}</p>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl text-gray-900 mb-4">Điểm nổi bật</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tour.highlights?.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="size-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Included/Excluded */}
            <div className="bg-white rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl text-gray-900 mb-4">Bao gồm</h3>
                  <ul className="space-y-2">
                    {tour.included?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl text-gray-900 mb-4">Không bao gồm</h3>
                  <ul className="space-y-2">
                    {tour.excluded?.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <X className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-2xl text-gray-900 mb-4">Đánh giá từ khách hàng</h2>
              <div className="space-y-4">
                {allReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{review.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-gray-900">{review.name}</h4>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24 shadow-lg">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl text-blue-600">{tour.price.toLocaleString('vi-VN')}đ</span>
                  <span className="text-gray-500">/ người</span>
                </div>
                <p className="text-sm text-gray-500">{tour.duration}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Ngày khởi hành</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Số người</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="number"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{tour.price.toLocaleString('vi-VN')}đ x {guests} người</span>
                  <span className="text-gray-900">{(tour.price * guests).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-900">Tổng cộng</span>
                  <span className="text-blue-600">{(tour.price * guests).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-2"
              >
                Đặt ngay
              </button>

              <p className="text-xs text-center text-gray-500">
                Bạn sẽ không bị trừ tiền ngay bây giờ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Success Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="size-8 text-green-600" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-2">Đã thêm vào giỏ hàng!</h2>
              <p className="text-gray-600 mb-6">Tour đã được thêm vào giỏ hàng của bạn</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tiếp tục mua
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xem giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
