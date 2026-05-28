import { Search, MapPin, Calendar, Users, Star, Plane, Mountain, Ship, Building2, Award, Shield, Headphones, TrendingUp, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [searchQuery, setSearchQuery] = useState({ destination: '', date: '', guests: '1' });

  const featuredTours = [
    {
      id: '1',
      title: "Du ngoạn Vịnh Hạ Long",
      location: "Quảng Ninh",
      price: 3500000,
      duration: "2 ngày 1 đêm",
      image: "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIYSUyMExvbmclMjBCYXklMjBWaWV0bmFtfGVufDF8fHx8MTc3OTUwOTcyNHww&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.9,
      reviews: 1234,
      description: "Khám phá kỳ quan thiên nhiên thế giới với hàng ngàn đảo đá vôi kỳ vĩ"
    },
    {
      id: '2',
      title: "Thiên đường Phú Quốc",
      location: "Kiên Giang",
      price: 5200000,
      duration: "4 ngày 3 đêm",
      image: "https://images.unsplash.com/photo-1732243395944-cb3ff9311091?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQaHUlMjBRdW9jJTIwYmVhY2glMjBWaWV0bmFtfGVufDF8fHx8MTc3OTUwOTcyNXww&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.8,
      reviews: 892,
      description: "Nghỉ dưỡng tại đảo ngọc với bãi biển xanh ngọc bích và resort 5 sao"
    },
    {
      id: '3',
      title: "Mù Cang Chải - Sa Pa",
      location: "Lào Cai",
      price: 4800000,
      duration: "3 ngày 2 đêm",
      image: "https://images.unsplash.com/photo-1649530928914-c2df337e3007?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTYXBhJTIwVmlldG5hbSUyMHRlcnJhY2VzfGVufDF8fHx8MTc3OTUwOTcyNXww&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.9,
      reviews: 756,
      description: "Chiêm ngưỡng ruộng bậc thang mùa lúa chín vàng và văn hóa dân tộc Tây Bắc"
    },
    {
      id: '4',
      title: "Biển xanh Đà Nẵng",
      location: "Đà Nẵng",
      price: 3200000,
      duration: "3 ngày 2 đêm",
      image: "https://images.unsplash.com/photo-1723142282970-1fd415eec1ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEYSUyME5hbmclMjBWaWV0bmFtJTIwYmVhY2h8ZW58MXx8fHwxNzc5NTA5NzI2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.7,
      reviews: 1089,
      description: "Tận hưởng biển Mỹ Khê, cầu Vàng và ẩm thực Đà Nẵng nổi tiếng"
    },
    {
      id: '5',
      title: "Phố cổ Hội An",
      location: "Quảng Nam",
      price: 2800000,
      duration: "2 ngày 1 đêm",
      image: "https://images.unsplash.com/photo-1664650440553-ab53804814b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIb2klMjBBbiUyMGFuY2llbnQlMjB0b3duJTIwVmlldG5hbXxlbnwxfHx8fDE3Nzk1MDk3MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 5.0,
      reviews: 1456,
      description: "Khám phá di sản văn hóa thế giới với phố cổ lung linh đèn lồng"
    },
    {
      id: '6',
      title: "Nha Trang - Vịnh xanh",
      location: "Khánh Hòa",
      price: 3900000,
      duration: "3 ngày 2 đêm",
      image: "https://images.unsplash.com/photo-1533002832-1721d16b4bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxOaGElMjBUcmFuZyUyMFZpZXRuYW18ZW58MXx8fHwxNzc5NTA5NzI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.8,
      reviews: 967,
      description: "Vui chơi tại thiên đường biển với hoạt động lặn ngắm san hô và thăm đảo"
    }
  ];

  const categories = [
    { icon: <Mountain className="size-8" />, name: "Phiêu lưu", count: 156 },
    { icon: <Ship className="size-8" />, name: "Du thuyền", count: 89 },
    { icon: <Building2 className="size-8" />, name: "Thành phố", count: 234 },
    { icon: <Plane className="size-8" />, name: "Bay quốc tế", count: 312 }
  ];

  const benefits = [
    { icon: <Award className="size-12" />, title: "Giá tốt nhất", desc: "Cam kết giá tour rẻ nhất thị trường" },
    { icon: <Shield className="size-12" />, title: "An toàn & Bảo mật", desc: "Thanh toán được bảo mật 100%" },
    { icon: <Headphones className="size-12" />, title: "Hỗ trợ 24/7", desc: "Đội ngũ tư vấn nhiệt tình" },
    { icon: <TrendingUp className="size-12" />, title: "Đánh giá cao", desc: "Hơn 50,000 khách hài lòng" }
  ];

  const handleSearch = () => {
    navigate(`/tours?destination=${searchQuery.destination}&date=${searchQuery.date}&guests=${searchQuery.guests}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Plane className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900">TravelHub</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#tours" className="text-gray-700 hover:text-blue-600 transition-colors">Tours</a>
              <a href="#destinations" className="text-gray-700 hover:text-blue-600 transition-colors">Điểm đến</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">Về chúng tôi</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Liên hệ</a>
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="size-6" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(user.role === 'admin' ? '/admin' : user.role === 'hotel_owner' ? '/hotel-owner' : '/dashboard')}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {user.name}
                  </button>
                  <button
                    onClick={logout}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-5xl md:text-6xl text-white mb-6 max-w-4xl">
            Khám phá thế giới cùng chúng tôi
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-2xl">
            Trải nghiệm những chuyến đi tuyệt vời với giá tốt nhất. Hơn 500+ tour du lịch trên toàn thế giới.
          </p>

          {/* Search Box */}
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <MapPin className="size-5 text-gray-400" />
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Điểm đến</label>
                  <input
                    type="text"
                    placeholder="Bạn muốn đi đâu?"
                    value={searchQuery.destination}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full outline-none text-gray-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Calendar className="size-5 text-gray-400" />
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Ngày đi</label>
                  <input
                    type="date"
                    value={searchQuery.date}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full outline-none text-gray-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Users className="size-5 text-gray-400" />
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Số người</label>
                  <select
                    value={searchQuery.guests}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, guests: e.target.value }))}
                    className="w-full outline-none text-gray-900"
                  >
                    <option value="1">1 người</option>
                    <option value="2">2 người</option>
                    <option value="3-5">3-5 người</option>
                    <option value="5+">5+ người</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="size-5" />
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-center mb-12 text-gray-900">Danh mục tour</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl text-center hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="inline-flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-lg text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} tours</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section id="tours" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-gray-900 mb-4">Tour nổi bật</h2>
            <p className="text-lg text-gray-600">Những tour du lịch được yêu thích nhất</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group cursor-pointer"
                onClick={() => navigate(`/tour/${tour.id}`)}
              >
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full">
                    <span className="text-sm">⭐ {tour.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <MapPin className="size-4" />
                    <span className="text-sm">{tour.location}</span>
                  </div>

                  <h3 className="text-xl text-gray-900 mb-3">{tour.title}</h3>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="size-4" />
                      <span className="text-sm">{tour.duration}</span>
                    </div>
                    <span className="text-xs text-gray-500">{tour.reviews} đánh giá</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <span className="text-sm text-gray-500">Từ</span>
                      <p className="text-2xl text-blue-600">{tour.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tour/${tour.id}`);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-4 text-gray-900">Tại sao chọn chúng tôi?</h2>
          <p className="text-center text-gray-600 mb-12">Những lý do khách hàng tin tưởng TravelHub</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center text-blue-600 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl text-center mb-12 text-gray-900">Khách hàng nói gì về chúng tôi</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Nguyễn Văn A", location: "Hà Nội", comment: "Chuyến đi tuyệt vời! Mọi thứ đều được sắp xếp hoàn hảo. Hướng dẫn viên rất nhiệt tình và am hiểu.", rating: 5 },
              { name: "Trần Thị B", location: "TP. Hồ Chí Minh", comment: "Giá cả hợp lý, dịch vụ chuyên nghiệp. Tôi sẽ quay lại sử dụng dịch vụ cho chuyến đi tiếp theo.", rating: 5 },
              { name: "Lê Văn C", location: "Đà Nẵng", comment: "Trải nghiệm tuyệt vời với gia đình. Các em nhỏ rất thích chuyến đi này. Cảm ơn TravelHub!", rating: 5 }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="size-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                <div>
                  <p className="text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl text-white mb-4">Đăng ký nhận ưu đãi</h2>
          <p className="text-xl text-white/90 mb-8">Nhận thông tin tour mới và ưu đãi đặc biệt qua email</p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-6 py-3 rounded-lg outline-none"
            />
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plane className="size-8" />
                <span className="text-2xl">TravelHub</span>
              </div>
              <p className="text-gray-400">
                Đối tác du lịch đáng tin cậy của bạn. Khám phá thế giới cùng chúng tôi.
              </p>
            </div>

            <div>
              <h3 className="text-lg mb-4">Công ty</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách hoàn tiền</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@travelhub.com</li>
                <li>Điện thoại: +84 123 456 789</li>
                <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2026 TravelHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
