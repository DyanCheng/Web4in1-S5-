"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useCart } from '@/contexts/CartContext';
import { MapPin, Calendar, Users, Star, Clock, CheckCircle, X, Heart, Share2, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';

import { isFavorite, toggleFavorite, isTourExperienced, markTourExperienced } from '@/lib/tourStorage';
import { apiUrl } from '@/lib/backendUrl';

const fallbackTours: Record<string, any> = {
  '1': { id: '1', title: 'Du ngoạn Vịnh Hạ Long', location: 'Quảng Ninh', price: 3500000, duration: '2 ngày 1 đêm', image: 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16', rating: 4.9, reviews: 1234, description: 'Khám phá kỳ quan thiên nhiên thế giới với hàng ngàn đảo đá vôi kỳ vĩ.', highlights: ['Du thuyền 5 sao ngủ đêm trên vịnh', 'Thăm hang Sửng Sốt, động Thiên Cung', 'Chèo kayak khám phá làng chài', 'Câu mực đêm trên biển', 'Buffet hải sản tươi sống', 'Tập Thái Cực Quyền trên boong tàu'], included: ['Xe đưa đón từ Hà Nội', 'Du thuyền 5 sao', '2 bữa ăn chính + bữa sáng', 'Vé thăm quan', 'Hướng dẫn viên tiếng Việt', 'Bảo hiểm du lịch'], excluded: ['Chi phí cá nhân', 'Đồ uống có cồn', 'Tip hướng dẫn viên'] },
  '2': { id: '2', title: 'Thiên đường Phú Quốc', location: 'Kiên Giang', price: 5200000, duration: '4 ngày 3 đêm', image: 'https://images.unsplash.com/photo-1732243395944-cb3ff9311091', rating: 4.8, reviews: 892, description: 'Nghỉ dưỡng tại đảo ngọc với bãi biển xanh ngọc bích, resort 5 sao.', highlights: ['Resort 5 sao view biển', 'Lặn ngắm san hô tại Hòn Thơm', 'Câu cá & BBQ hải sản', 'Tham quan vườn tiêu, làng chài', 'VinWonders & Safari Phú Quốc', 'Sunset Sanato Beach Club'], included: ['Vé máy bay khứ hồi', 'Resort 5 sao', 'Ăn sáng buffet', 'Tour 4 đảo', 'Xe đưa đón sân bay'], excluded: ['Chi phí tham quan riêng', 'Bữa trưa, tối', 'Vé VinWonders'] },
  '3': { id: '3', title: 'Mù Cang Chải - Sa Pa', location: 'Lào Cai', price: 4800000, duration: '3 ngày 2 đêm', image: 'https://images.unsplash.com/photo-1649530928914-c2df337e3007', rating: 4.9, reviews: 756, description: 'Chiêm ngưỡng ruộng bậc thang mùa lúa chín vàng tuyệt đẹp.', highlights: ['Ruộng bậc thang Mù Cang Chải', 'Đèo Khau Phạ hùng vĩ', 'Thác Tình Yêu Sa Pa', 'Trekking bản Cát Cát, Tả Van', 'Chợ tình Sa Pa cuối tuần', 'Fansipan đỉnh Đông Dương'], included: ['Xe limousine đưa đón', 'Khách sạn 3-4 sao', '3 bữa ăn/ngày', 'Hướng dẫn viên', 'Vé thăm quan'], excluded: ['Cáp treo Fansipan', 'Chi phí cá nhân'] },
  '4': { id: '4', title: 'Biển xanh Đà Nẵng', location: 'Đà Nẵng', price: 3200000, duration: '3 ngày 2 đêm', image: 'https://images.unsplash.com/photo-1723142282970-1fd415eec1ad', rating: 4.7, reviews: 1089, description: 'Tận hưởng bãi biển Mỹ Khê đẹp nhất hành tinh, chiêm ngưỡng cầu Vàng nổi tiếng.', highlights: ['Biển Mỹ Khê, Non Nước', 'Cầu Vàng - Bà Nà Hills', 'Chùa Linh Ứng, Ngũ Hành Sơn', 'Phố cổ Hội An về đêm', 'Ăn tối trên du thuyền sông Hàn', 'Chợ Hàn, Cồn market'], included: ['Vé máy bay', 'Khách sạn 4 sao', 'Ăn sáng', 'Xe đưa đón', 'Vé Bà Nà Hills'], excluded: ['Bữa trưa, tối', 'Cáp treo Ngũ Hành Sơn'] },
  '5': { id: '5', title: 'Phố cổ Hội An', location: 'Quảng Nam', price: 2800000, duration: '2 ngày 1 đêm', image: 'https://images.unsplash.com/photo-1664650440553-ab53804814b3', rating: 5.0, reviews: 1456, description: 'Khám phá di sản văn hóa thế giới với phố cổ lung linh đèn lồng.', highlights: ['Phố cổ lung linh đèn lồng', 'Chùa Cầu Nhật Bản', 'Làng gốm Thanh Hà', 'Rừng dừa Bảy Mẫu', 'Thả đèn hoa đăng sông Hoài', 'Học làm bánh dân gian'], included: ['Xe đưa đón từ Đà Nẵng', 'Homestay phố cổ', 'Ăn sáng', 'Vé thăm quan', 'Hướng dẫn viên'], excluded: ['Chi phí cá nhân', 'Vé rừng dừa'] },
  '6': { id: '6', title: 'Nha Trang - Vịnh xanh', location: 'Khánh Hòa', price: 3900000, duration: '3 ngày 2 đêm', image: 'https://images.unsplash.com/photo-1533002832-1721d16b4bb9', rating: 4.8, reviews: 967, description: 'Vui chơi tại thiên đường biển Nha Trang với hoạt động lặn ngắm san hô.', highlights: ['Tour 4 đảo Nha Trang', 'Lặn ngắm san hô biển sâu', 'Tắm bùn khoáng Thap Ba', 'VinWonders Nha Trang', 'Chùa Long Sơn, tháp Bà Ponagar', 'Buffet hải sản biển'], included: ['Vé máy bay khứ hồi', 'Khách sạn 4 sao', 'Ăn sáng', 'Tour 4 đảo', 'Xe đưa đón'], excluded: ['VinWonders', 'Tắm bùn', 'Bữa trưa, tối'] },

  '7': { id: '7', title: 'Tour Demo Thanh Toán', location: 'Hà Nội', price: 15000, duration: '1 ngày', image: 'https://images.unsplash.com/photo-1559592410-7c496ece05f5', rating: 5.0, reviews: 0, description: 'Tour demo giá 15.000đ dùng để thử nghiệm đặt tour và thanh toán SePay.', highlights: ['Tham quan Hồ Gươm', 'Đi bộ phố cổ', 'Thử nghiệm thanh toán 15.000đ', 'Xác nhận email tự động'], included: ['Hướng dẫn viên', 'Nước uống', 'Bảo hiểm cơ bản'], excluded: ['Ăn trưa', 'Chi phí cá nhân'] },
};

type Review = { id: number; name: string; rating: number; date: string; comment: string; avatar: string };

export default function TourDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [experienced, setExperienced] = useState(false);
  const [reviewNotice, setReviewNotice] = useState('');
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([
    { id: 1, name: 'Nguyễn Văn A', rating: 5, date: '2026-04-15', comment: 'Tour tuyệt vời! Mọi thứ đều hoàn hảo từ A-Z. Hướng dẫn viên rất nhiệt tình.', avatar: '👨' },
    { id: 2, name: 'Trần Thị B', rating: 5, date: '2026-04-10', comment: 'Trải nghiệm đáng nhớ! Cảnh đẹp, dịch vụ tốt, giá hợp lý.', avatar: '👩' },
    { id: 3, name: 'Lê Văn C', rating: 4, date: '2026-04-05', comment: 'Rất tốt, chỉ có điều thời tiết không thuận lợi lắm.', avatar: '👨‍💼' },
    { id: 4, name: 'Phạm Thị D', rating: 5, date: '2026-03-28', comment: 'Gia đình tôi rất hài lòng. Sẽ quay lại lần sau!', avatar: '👩‍🦰' },
  ]);

  useEffect(() => {
    setSaved(isFavorite(id));
    setExperienced(isTourExperienced(id));
    setHasReviewed(hasReviewedTourId(id));
    const fetchTour = async () => {
      try {
        const response = await fetch(apiUrl(`/api/tours/${id}`));
        if (!response.ok) throw new Error('Tour not found');
        setTour(await response.json());
      } catch {
        setTour(fallbackTours[id] || fallbackTours['1']);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const reviewCount = useMemo(() => reviews.length, [reviews]);
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return (tour?.rating || 5).toFixed(1);
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews, tour]);

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
      guests,
    });
    setShowBookingModal(true);
  };

  const handleFavoriteToggle = () => {
    const next = toggleFavorite({
      id: tour.id,
      title: tour.title,
      location: tour.location,
      price: tour.price,
      duration: tour.duration,
      image: tour.image,
      rating: Number(averageRating),
      reviews: tour.reviews,
    });
    setSaved(next.some((item) => item.id === tour.id));
  };

  const handleMarkExperienced = () => {
    markTourExperienced(tour.id);
    setExperienced(true);
  };

  const handleSubmitReview = (event: FormEvent) => {
    event.preventDefault();
    if (!experienced) {
      setReviewNotice('Bạn chỉ có thể comment sau khi đã trải nghiệm tour.');
      return;
    }
    if (!myComment.trim()) {
      setReviewNotice('Vui lòng nhập nhận xét trước khi gửi.');
      return;
    }
    setReviews((current) => [
      { id: Date.now(), name: 'Bạn', rating: myRating, date: new Date().toISOString().slice(0, 10), comment: myComment.trim(), avatar: '🙂' },
      ...current,
    ]);
    addUserReview({ id: Date.now(), tourId: id, tour: tour.title, rating: myRating, comment: myComment.trim(), date: new Date().toLocaleDateString('vi-VN') });
    setHasReviewed(true);
    setMyComment('');
    setReviewNotice('Đã gửi đánh giá thành công. Cảm ơn những chia sẻ của bạn!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold">
        <Loader2 className="size-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-lg">Đang tải thông tin tour...</span>
      </div>
    );
  }

  if (!tour) return null;

  return (
    <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${theme === 'dark' ? 'dark text-white' : 'text-slate-900'}`}>
      <Header />

      <div className="relative h-[420px] w-full">
        <ImageWithFallback src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-white">
          <div className="max-w-7xl mx-auto text-left">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-600 text-white mb-4 shadow">Hành trình di sản</span>
            <div className="flex items-center gap-1.5 text-slate-200 mb-3 font-bold text-sm">
              <MapPin className="size-4 text-blue-400" />
              <span>{tour.location}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif leading-tight tracking-wide drop-shadow mb-6">{tour.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-100">
              <div className="flex items-center gap-1.5">
                <Star className="size-4.5 fill-amber-400 text-amber-400" />
                <span>{averageRating} ({reviewCount} đánh giá)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="size-4.5" />
                <span>{tour.duration}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-6 right-6 flex gap-3">
          <button onClick={handleFavoriteToggle} className="size-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md cursor-pointer border border-white/20">
            <Heart className={`size-5.5 ${saved ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'}`} />
          </button>
          <button className="size-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md cursor-pointer border border-white/20">
            <Share2 className="size-5.5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-left">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 font-serif leading-tight">Mô tả hành trình</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium">{tour.description}</p>
            </div>

            {tour.highlights && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-left">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 font-serif leading-tight">Điểm nhấn nổi bật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.highlights.map((highlight: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(tour.included || tour.excluded) && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {tour.included && (
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 font-serif">Dịch vụ bao gồm</h3>
                      <ul className="space-y-3">
                        {tour.included.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2.5">
                            <CheckCircle className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tour.excluded && (
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 font-serif">Chi phí tự túc</h3>
                      <ul className="space-y-3">
                        {tour.excluded.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2.5">
                            <X className="size-5 text-red-500 shrink-0 mt-0.5" />
                            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-left">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif leading-tight">Đánh giá từ khách hàng</h2>
                {user && !experienced && (
                  <button onClick={handleMarkExperienced} className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                    Hoàn thành tour (Giả lập)
                  </button>
                )}
              </div>
              {reviewNotice && (
                <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
                  {reviewNotice}
                </div>
              )}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl size-11 rounded-full bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center shadow-inner">{review.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-slate-900 dark:text-white font-bold text-sm">{review.name}</h4>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{review.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-3">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold italic">“{review.comment}”</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmitReview} className="mt-8 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 font-serif">Viết đánh giá của bạn</h3>
                
                {hasReviewed ? (
                  <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    Bạn đã đánh giá tour này rồi. Cảm ơn những chia sẻ của bạn!
                  </p>
                ) : !user ? (
                  <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                    Chỉ khách hàng đã đăng nhập và hoàn thành tour mới có thể đánh giá.
                  </p>
                ) : !experienced ? (
                  <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                    Bạn cần đặt và hoàn thành chuyến đi này để có thể gửi đánh giá.
                  </p>
                ) : (
                  <p className="mb-4 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm font-semibold text-blue-700 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300">
                    Bạn đã hoàn thành tour này! Hãy chia sẻ trải nghiệm và đánh giá của bạn nhé.
                  </p>
                )}
                <div className="mb-4">
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Mức độ hài lòng</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setMyRating(star)} className="hover:scale-110 transition-transform">
                        <Star className={`size-7 ${star <= myRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  rows={4}
                  disabled={!user || !experienced || hasReviewed}
                  placeholder="Chia sẻ trải nghiệm hành trình của bạn..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent px-4 py-3 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!user || !experienced || hasReviewed}
                  className="mt-4 rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-blue-600 dark:disabled:bg-slate-700"
                >
                  Gửi comment
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sticky top-24 border border-slate-100/40 dark:border-slate-800/40 shadow-lg text-left">
              <div className="mb-6">
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-3xl font-black text-blue-900 dark:text-blue-400">{tour.price.toLocaleString('vi-VN')}đ</span>
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">/ người</span>
                </div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Trọn gói: {tour.duration}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Ngày khởi hành</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Số lượng khách</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
                    <input
                      type="number"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mb-6 text-sm font-semibold">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 dark:text-slate-400">{tour.price.toLocaleString('vi-VN')}đ x {guests} khách</span>
                  <span className="text-slate-900 dark:text-slate-200">{(tour.price * guests).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2">
                  <span className="text-slate-900 dark:text-white">Tổng chi phí</span>
                  <span className="text-blue-900 dark:text-blue-400 font-black">{(tour.price * guests).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button onClick={handleBooking} className="w-full py-3.5 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-all mb-3 font-bold text-sm shadow-md cursor-pointer text-center">
                Đặt Hành Trình
              </button>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase">
                Hỗ trợ hủy miễn phí trước 7 ngày
              </p>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full border border-slate-100/40 dark:border-slate-800/40 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full mb-4">
                <CheckCircle className="size-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-serif">Thành công!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-semibold">Hành trình đã được thêm vào giỏ hàng của bạn</p>
              <div className="flex gap-3">
                <button onClick={() => setShowBookingModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  Quay lại
                </button>
                <button onClick={() => navigate('/cart')} className="flex-1 px-4 py-2.5 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-950 dark:hover:bg-blue-700 transition-colors font-bold text-sm cursor-pointer shadow">
                  Giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
