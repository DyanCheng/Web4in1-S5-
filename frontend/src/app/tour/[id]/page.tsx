"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Calendar, Users, Star, Clock, CheckCircle, X, Heart, Share2, Plane, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5200';

const fallbackTours: Record<string, any> = {
  '1': { id: '1', title: "Du ngoạn Vịnh Hạ Long", location: "Quảng Ninh", price: 3500000, duration: "2 ngày 1 đêm", image: "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16", rating: 4.9, reviews: 1234, description: "Khám phá kỳ quan thiên nhiên thế giới với hàng ngàn đảo đá vôi kỳ vĩ.", highlights: ["Du thuyền 5 sao ngủ đêm trên vịnh", "Thăm hang Sửng Sốt, động Thiên Cung", "Chèo kayak khám phá làng chài", "Câu mực đêm trên biển", "Buffet hải sản tươi sống", "Tập Thái Cực Quyền trên boong tàu"], included: ["Xe đưa đón từ Hà Nội", "Du thuyền 5 sao", "2 bữa ăn chính + bữa sáng", "Vé thăm quan", "Hướng dẫn viên tiếng Việt", "Bảo hiểm du lịch"], excluded: ["Chi phí cá nhân", "Đồ uống có cồn", "Tip hướng dẫn viên"] },
  '2': { id: '2', title: "Thiên đường Phú Quốc", location: "Kiên Giang", price: 5200000, duration: "4 ngày 3 đêm", image: "https://images.unsplash.com/photo-1732243395944-cb3ff9311091", rating: 4.8, reviews: 892, description: "Nghỉ dưỡng tại đảo ngọc với bãi biển xanh ngọc bích, resort 5 sao.", highlights: ["Resort 5 sao view biển", "Lặn ngắm san hô tại Hòn Thơm", "Câu cá & BBQ hải sản", "Tham quan vườn tiêu, làng chài", "VinWonders & Safari Phú Quốc", "Sunset Sanato Beach Club"], included: ["Vé máy bay khứ hồi", "Resort 5 sao", "Ăn sáng buffet", "Tour 4 đảo", "Xe đưa đón sân bay"], excluded: ["Chi phí tham quan riêng", "Bữa trưa, tối", "Vé VinWonders"] },
  '3': { id: '3', title: "Mù Cang Chải - Sa Pa", location: "Lào Cai", price: 4800000, duration: "3 ngày 2 đêm", image: "https://images.unsplash.com/photo-1649530928914-c2df337e3007", rating: 4.9, reviews: 756, description: "Chiêm ngưỡng ruộng bậc thang mùa lúa chín vàng tuyệt đẹp.", highlights: ["Ruộng bậc thang Mù Cang Chải", "Đèo Khau Phạ hùng vĩ", "Thác Tình Yêu Sa Pa", "Trekking bản Cát Cát, Tả Van", "Chợ tình Sa Pa cuối tuần", "Fansipan đỉnh Đông Dương"], included: ["Xe limousine đưa đón", "Khách sạn 3-4 sao", "3 bữa ăn/ngày", "Hướng dẫn viên", "Vé thăm quan"], excluded: ["Cáp treo Fansipan", "Chi phí cá nhân"] },
  '4': { id: '4', title: "Biển xanh Đà Nẵng", location: "Đà Nẵng", price: 3200000, duration: "3 ngày 2 đêm", image: "https://images.unsplash.com/photo-1723142282970-1fd415eec1ad", rating: 4.7, reviews: 1089, description: "Tận hưởng bãi biển Mỹ Khê đẹp nhất hành tinh, chiêm ngưỡng cầu Vàng nổi tiếng.", highlights: ["Biển Mỹ Khê, Non Nước", "Cầu Vàng - Bà Nà Hills", "Chùa Linh Ứng, Ngũ Hành Sơn", "Phố cổ Hội An về đêm", "Ăn tối trên du thuyền sông Hàn", "Chợ Hàn, Cồn market"], included: ["Vé máy bay", "Khách sạn 4 sao", "Ăn sáng", "Xe đưa đón", "Vé Bà Nà Hills"], excluded: ["Bữa trưa, tối", "Cáp treo Ngũ Hành Sơn"] },
  '5': { id: '5', title: "Phố cổ Hội An", location: "Quảng Nam", price: 2800000, duration: "2 ngày 1 đêm", image: "https://images.unsplash.com/photo-1664650440553-ab53804814b3", rating: 5.0, reviews: 1456, description: "Khám phá di sản văn hóa thế giới với phố cổ lung linh đèn lồng.", highlights: ["Phố cổ lung linh đèn lồng", "Chùa Cầu Nhật Bản", "Làng gốm Thanh Hà", "Rừng dừa Bảy Mẫu", "Thả đèn hoa đăng sông Hoài", "Học làm bánh dân gian"], included: ["Xe đưa đón từ Đà Nẵng", "Homestay phố cổ", "Ăn sáng", "Vé thăm quan", "Hướng dẫn viên"], excluded: ["Chi phí cá nhân", "Vé rừng dừa"] },
  '6': { id: '6', title: "Nha Trang - Vịnh xanh", location: "Khánh Hòa", price: 3900000, duration: "3 ngày 2 đêm", image: "https://images.unsplash.com/photo-1533002832-1721d16b4bb9", rating: 4.8, reviews: 967, description: "Vui chơi tại thiên đường biển Nha Trang với hoạt động lặn ngắm san hô.", highlights: ["Tour 4 đảo Nha Trang", "Lặn ngắm san hô biển sâu", "Tắm bùn khoáng Thap Ba", "VinWonders Nha Trang", "Chùa Long Sơn, tháp Bà Ponagar", "Buffet hải sản biển"], included: ["Vé máy bay khứ hồi", "Khách sạn 4 sao", "Ăn sáng", "Tour 4 đảo", "Xe đưa đón"], excluded: ["VinWonders", "Tắm bùn", "Bữa trưa, tối"] },
};

export default function TourDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/tours/${id}`);
        if (!response.ok) throw new Error('Tour not found');
        const data = await response.json();
        setTour(data);
      } catch {
        // Fallback to local data
        setTour(fallbackTours[id] || fallbackTours['1']);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

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
    { id: 4, name: "Phạm Thị D", rating: 5, date: "2026-03-28", comment: "Gia định tôi rất hài lòng. Sẽ quay lại lần sau!", avatar: "👩‍🦰" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="size-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-lg">Đang tải thông tin tour...</span>
      </div>
    );
  }

  if (!tour) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Plane className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900 font-bold">TravelHub</span>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">← Quay lại</Link>
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
          <div className="max-w-7xl mx-auto text-left">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="size-5" />
              <span>{tour.location}</span>
            </div>
            <h1 className="text-4xl mb-4 font-bold">{tour.title}</h1>
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
            className="size-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
          >
            <Heart className={`size-6 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
          <button className="size-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
            <Share2 className="size-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl p-6 text-left">
              <h2 className="text-2xl text-gray-900 mb-4 font-bold">Mô tả</h2>
              <p className="text-gray-700 leading-relaxed text-sm">{tour.description}</p>
            </div>

            {/* Highlights */}
            {tour.highlights && (
              <div className="bg-white rounded-xl p-6 text-left">
                <h2 className="text-2xl text-gray-900 mb-4 font-bold">Điểm nổi bật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tour.highlights.map((highlight: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="size-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included/Excluded */}
            {(tour.included || tour.excluded) && (
              <div className="bg-white rounded-xl p-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tour.included && (
                    <div>
                      <h3 className="text-xl text-gray-900 mb-4 font-semibold">Bao gồm</h3>
                      <ul className="space-y-2">
                        {tour.included.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tour.excluded && (
                    <div>
                      <h3 className="text-xl text-gray-900 mb-4 font-semibold">Không bao gồm</h3>
                      <ul className="space-y-2">
                        {tour.excluded.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <X className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl p-6 text-left">
              <h2 className="text-2xl text-gray-900 mb-4 font-bold">Đánh giá từ khách hàng</h2>
              <div className="space-y-4">
                {allReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{review.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-gray-900 font-medium">{review.name}</h4>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24 shadow-lg text-left">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl text-blue-600 font-bold">{tour.price.toLocaleString('vi-VN')}đ</span>
                  <span className="text-gray-500 text-sm">/ người</span>
                </div>
                <p className="text-xs text-gray-500">{tour.duration}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">Ngày khởi hành</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">Số người</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="number"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-600">{tour.price.toLocaleString('vi-VN')}đ x {guests} người</span>
                  <span className="text-sm text-gray-900 font-semibold">{(tour.price * guests).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Tổng cộng</span>
                  <span className="text-blue-600">{(tour.price * guests).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-2 font-semibold cursor-pointer"
              >
                Đặt ngay
              </button>

              <p className="text-xxs text-center text-gray-500">
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
              <h2 className="text-2xl text-gray-900 mb-2 font-bold">Đã thêm vào giỏ hàng!</h2>
              <p className="text-gray-600 mb-6 text-sm">Tour đã được thêm vào giỏ hàng của bạn</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                >
                  Tiếp tục mua
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
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
