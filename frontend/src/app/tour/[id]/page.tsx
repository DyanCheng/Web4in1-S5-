"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Calendar, Star, Clock, CheckCircle, X, Heart, Share2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaylineButton from '@/components/PaylineButton';
import { PageSkeleton } from '@/components/ux/PageSkeleton';
import { useTheme } from '@/contexts/ThemeContext';

import { isFavorite, toggleFavorite } from '@/lib/tourStorage';
import { fetchTourById } from '@/lib/tourApi';
import { apiUrl } from '@/lib/backendUrl';
import { createClient } from '@/lib/supabase/client';

type Review = { id: number; name: string; rating: number; date: string; comment: string; avatar: string };

function buildRatingDistribution(avgRating: number, totalReviews: number): Record<number, number> {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (totalReviews <= 0) return dist;

  const targetSum = Math.round(avgRating * totalReviews);
  
  // Bước 1: Khởi tạo trọng số dựa trên đường cong hình chuông (chuẩn) quanh avgRating
  const weights = [0, 0, 0, 0, 0, 0];
  let totalWeight = 0;
  for (let i = 1; i <= 5; i++) {
    // Độ lệch chuẩn = 0.8
    weights[i] = Math.exp(-Math.pow(i - avgRating, 2) / (2 * 0.8 * 0.8));
    totalWeight += weights[i];
  }

  // Bước 2: Phân bổ số lượng review theo trọng số
  let currentCount = 0;
  let currentSum = 0;
  for (let i = 1; i <= 5; i++) {
    const count = Math.floor((weights[i] / totalWeight) * totalReviews);
    dist[i] = count;
    currentCount += count;
    currentSum += count * i;
  }

  // Phân bổ nốt những review bị lẻ do làm tròn xuống
  let remCount = totalReviews - currentCount;
  while (remCount > 0) {
    let bestStar = 5;
    let maxW = -1;
    for (let i = 1; i <= 5; i++) {
      if (weights[i] > maxW) {
        maxW = weights[i];
        bestStar = i;
      }
    }
    dist[bestStar]++;
    currentSum += bestStar;
    remCount--;
  }

  // Bước 3: Điều chỉnh để tổng điểm (currentSum) khớp chính xác với targetSum
  // Nếu thiếu điểm, dịch chuyển các đánh giá từ sao thấp lên sao cao
  while (currentSum < targetSum) {
    let shifted = false;
    for (let i = 4; i >= 1; i--) { // Ưu tiên nâng 4 lên 5, rồi 3 lên 4...
      if (dist[i] > 0) {
        dist[i]--;
        dist[i + 1]++;
        currentSum++;
        shifted = true;
        break;
      }
    }
    if (!shifted) {
      // Nếu không thể dịch chuyển (tất cả đều là 5), buộc dừng
      break; 
    }
  }

  // Nếu thừa điểm, dịch chuyển các đánh giá từ sao cao xuống sao thấp
  while (currentSum > targetSum) {
    let shifted = false;
    for (let i = 2; i <= 5; i++) { // Ưu tiên hạ 2 xuống 1, 3 xuống 2...
      if (dist[i] > 0) {
        dist[i]--;
        dist[i - 1]++;
        currentSum--;
        shifted = true;
        break;
      }
    }
    if (!shifted) {
      break;
    }
  }

  return dist;
}

type TourActivity = { time?: string; desc?: string };
type TourItineraryDay = {
  day: number;
  title: string;
  meals?: string;
  accommodation?: string;
  activities?: TourActivity[];
};

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
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [saved, setSaved] = useState(false);
  const [userBookingsCount, setUserBookingsCount] = useState(0);
  const [userReviewsCount, setUserReviewsCount] = useState(0);
  const [reviewNotice, setReviewNotice] = useState('');
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [matchedLocations, setMatchedLocations] = useState<any[]>([]);
  
  const itinerary: TourItineraryDay[] = useMemo(() => {
    const raw = Array.isArray(tour?.itinerary) ? tour.itinerary : [];
    return raw.map((day: TourItineraryDay) => ({
      ...day,
      activities: Array.isArray(day.activities) ? day.activities : [],
    }));
  }, [tour]);
  const childPrice = Number(tour?.childPrice ?? 0);
  const bookingTotal = tour
    ? tour.price * Math.max(adults, 1) + childPrice * Math.max(children, 0)
    : 0;
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);

  useEffect(() => {
    if (itinerary.length > 0) {
      setExpandedDays([itinerary[0].day]);
    }
  }, [itinerary]);

  const toggleDay = (day: number) => {
    setExpandedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Danh sách mặc định nếu chưa có trong LocalStorage
  const defaultReviews: Review[] = [
    { id: 1, name: 'Nguyễn Văn An', rating: 5, date: '2026-06-20', comment: 'Tour tuyệt vời! Hướng dẫn viên nhiệt tình, lịch trình hợp lý. Chắc chắn sẽ quay lại.', avatar: '👨' },
    { id: 2, name: 'Trần Thị Bích', rating: 5, date: '2026-06-15', comment: 'Trải nghiệm đáng nhớ, cảnh đẹp ngoài mong đợi. Dịch vụ rất chuyên nghiệp!', avatar: '👩' },
    { id: 3, name: 'Lê Minh Châu', rating: 4, date: '2026-06-10', comment: 'Tour tốt nhưng thời gian di chuyển hơi dài. Tổng thể vẫn hài lòng.', avatar: '👨‍💼' },
    { id: 4, name: 'Phạm Thu Hà', rating: 5, date: '2026-06-05', comment: 'Gia đình tôi rất thích! Đồ ăn ngon, phòng sạch, HDV thân thiện.', avatar: '👩‍🦰' },
    { id: 5, name: 'Hoàng Đức Mạnh', rating: 4, date: '2026-05-28', comment: 'Khá tốt, chỉ tiếc thời tiết hôm đó không đẹp. Sẽ thử lại vào mùa khác.', avatar: '👦' },
    { id: 6, name: 'Võ Thị Lan', rating: 3, date: '2026-05-20', comment: 'Bình thường, không có gì nổi bật so với quảng cáo. Cần cải thiện khâu ăn trưa.', avatar: '👩‍🍳' },
    { id: 7, name: 'Đặng Quốc Tuấn', rating: 5, date: '2026-05-12', comment: 'Xuất sắc! Đây là lần thứ 3 tôi đặt tour ở đây và lần nào cũng hài lòng.', avatar: '🧑‍💻' },
    { id: 8, name: 'Bùi Thị Ngọc', rating: 4, date: '2026-05-08', comment: 'Chất lượng tốt, giá cả hợp lý. Hướng dẫn viên có kiến thức sâu về địa điểm.', avatar: '👩‍🎨' },
    { id: 9, name: 'Ngô Văn Hùng', rating: 2, date: '2026-04-30', comment: 'Tour bị thay đổi lịch trình mà không thông báo trước. Cần cải thiện khâu tổ chức.', avatar: '😤' },
    { id: 10, name: 'Phan Thị Mai', rating: 5, date: '2026-04-22', comment: 'Hoàn toàn xứng đáng với số tiền bỏ ra. Nhất định sẽ giới thiệu cho bạn bè!', avatar: '🥰' },
  ];

  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (id) {
      const saved = localStorage.getItem(`tour_reviews_${id}`);
      if (saved) {
        setReviews(JSON.parse(saved));
      } else {
        setReviews(defaultReviews);
      }
    }
  }, [id]);

  useEffect(() => {
    if (user?.email) {
      fetch(apiUrl(`/api/bookings/user/${user.email}`))
        .then(res => res.json())
        .then((bookings: any[]) => {
          const count = bookings.filter(b => String(b.tourId) === String(id)).length;
          setUserBookingsCount(count);
        })
        .catch(e => {
          console.error("Failed to load bookings", e);
          setUserBookingsCount(0);
        });
    } else {
      setUserBookingsCount(0);
    }
  }, [user?.email, id]);

  useEffect(() => {
    if (user) {
      const nameMatch = user.name || user.email.split('@')[0];
      const myReviews = reviews.filter(r => r.name === nameMatch || r.name === 'Bạn');
      setUserReviewsCount(myReviews.length);
    } else {
      setUserReviewsCount(0);
    }
  }, [reviews, user]);

  useEffect(() => {
    setSaved(isFavorite(id));
    const loadTour = async () => {
      const data = await fetchTourById(id);
      setTour(data);
      
      if (data && data.highlights) {
        try {
          const supabase = createClient();
          const { data: locData } = await supabase.from('locations').select('*');
          if (locData && Array.isArray(locData)) {
            const matched = locData.filter((loc) => 
              data.highlights.some((h: string) => h.toLowerCase().includes(loc.location_name.toLowerCase()))
            );
            setMatchedLocations(matched);
          }
        } catch (e) {
          console.error("Failed to load locations", e);
        }
      }
      setLoading(false);
    };
    loadTour();
  }, [id]);

  // Tính điểm trung bình và phân bổ chính xác 100% theo danh sách reviews hiện có
  const { averageRating, reviewCount, ratingDist } = useMemo(() => {
    if (reviews.length === 0) {
      return { averageRating: '0.0', reviewCount: 0, ratingDist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number> };
    }
    
    let sum = 0;
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(r => {
      sum += r.rating;
      dist[r.rating] = (dist[r.rating] || 0) + 1;
    });
    
    return {
      averageRating: (sum / reviews.length).toFixed(1),
      reviewCount: reviews.length,
      ratingDist: dist
    };
  }, [reviews]);

  const handleBooking = () => {
    if (!selectedDate) {
      alert('Vui lòng chọn ngày khởi hành');
      return;
    }
    if (adults < 1) {
      alert('Cần ít nhất 1 người lớn');
      return;
    }
    addToCart({
      serviceType: 'tour',
      referenceId: tour.id,
      title: tour.title,
      image: tour.image,
      price: tour.price,
      quantity: 1,
      date: selectedDate,
      guests: adults,
      children,
      metadata: {
        children,
        childPrice,
      },
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
      reviews: reviewCount,
    });
    setSaved(next.some((item) => item.id === tour.id));
  };



  const handleSubmitReview = (event: FormEvent) => {
    event.preventDefault();
    if (userBookingsCount <= userReviewsCount) {
      setReviewNotice('Bạn cần đặt thêm tour này để có thể đánh giá tiếp.');
      return;
    }
    if (!myComment.trim()) {
      setReviewNotice('Vui lòng nhập nhận xét trước khi gửi.');
      return;
    }

    const newReview = {
      id: Date.now(),
      name: user?.name || user?.email?.split('@')[0] || 'Bạn',
      rating: myRating,
      date: new Date().toISOString().slice(0, 10),
      comment: myComment.trim(),
      avatar: user?.avatar ? '😎' : '🙂'
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    
    // Save to localStorage so it persists across reloads
    localStorage.setItem(`tour_reviews_${id}`, JSON.stringify(updatedReviews));

    setMyComment('');
    setReviewNotice('Đã gửi đánh giá thành công. Cảm ơn những chia sẻ của bạn!');
  };

  if (loading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold px-4 text-center">
        <p className="text-lg mb-4">Không tìm thấy tour này hoặc không thể tải dữ liệu.</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-2xl bg-blue-900 dark:bg-blue-600 text-white px-6 py-3 text-sm font-bold"
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }

  return (
    
    <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${theme === 'dark' ? 'dark text-white' : 'text-slate-900 dark:text-slate-50'}`}>
      <Header />

      <div className="relative h-[52vh] min-h-[380px] max-h-[560px] w-full overflow-hidden">
        <ImageWithFallback src={tour.image} alt={tour.title} className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-black/25" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-white animate-page-in">
          <div className="max-w-7xl mx-auto text-left">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-blue-600 text-white mb-4 shadow">Hành trình di sản</span>
            <div className="flex items-center gap-1.5 text-slate-200 mb-3 font-bold text-sm">
              <MapPin className="size-4 text-blue-400" />
              <span>{tour.location}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-sans leading-tight tracking-wide drop-shadow mb-6">{tour.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-100">
              <div className="flex items-center gap-1.5">
                <Star className="size-4.5 fill-amber-400 text-amber-400" />
                <span>{averageRating} ({reviewCount.toLocaleString('vi-VN')} đánh giá)</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Clock className="size-4.5" />
                <span>{tour.duration}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-6 right-6 flex gap-3">
          <button type="button" onClick={handleFavoriteToggle} className="interactive-press size-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md cursor-pointer border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <Heart className={`size-5.5 ${saved ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'}`} />
          </button>
          <button type="button" className="interactive-press size-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md cursor-pointer border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <Share2 className="size-5.5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-left">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 font-sans leading-tight">Tổng quan tour</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-medium mb-8">{tour.description}</p>
              
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 font-sans leading-tight border-t border-slate-100 dark:border-slate-800 pt-8">Lịch trình chi tiết</h2>
              {itinerary.length === 0 ? (
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Chưa có lịch trình chi tiết cho tour này.</p>
              ) : (
              <div className="space-y-4">
                {itinerary.map((dayData, index) => {
                  const isExpanded = expandedDays.includes(dayData.day);
                  const activities = dayData.activities ?? [];
                  return (
                    <div key={index} className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
                      <button 
                        onClick={() => toggleDay(dayData.day)}
                        className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center size-12 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-black">
                            <span className="text-[10px] uppercase leading-none mb-0.5">Ngày</span>
                            <span className="text-lg leading-none">{dayData.day}</span>
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-left">{dayData.title}</h3>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="size-5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="size-5 text-slate-400 shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-6 pl-9 sm:pl-12 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          {(dayData.meals || dayData.accommodation) && (
                            <div className="flex flex-wrap gap-3 text-xs font-bold">
                              {dayData.meals && (
                                <span className="rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-3 py-1.5">
                                  Ăn: {dayData.meals}
                                </span>
                              )}
                              {dayData.accommodation && (
                                <span className="rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1.5">
                                  Nghỉ: {dayData.accommodation}
                                </span>
                              )}
                            </div>
                          )}
                          {activities.length === 0 ? (
                            <p className="text-sm font-semibold text-slate-500">Chưa có hoạt động cho ngày này.</p>
                          ) : (
                          <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-6 pb-2">
                            {activities.map((act, idx) => (
                              <div key={idx} className="relative pl-6">
                                <span className="absolute -left-[9px] top-1.5 size-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 shadow-sm" />
                                {act.time && (
                                  <div className="inline-block px-3 py-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg text-xs font-black text-blue-700 dark:text-blue-400 mb-2">
                                    {act.time}
                                  </div>
                                )}
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {act.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>

            {tour.highlights && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-left">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 font-sans leading-tight">Địa điểm chi tiết / Nổi bật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.highlights.map((highlight: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <MapPin className="size-5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matchedLocations.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-left">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 font-sans leading-tight">Thông tin địa điểm chi tiết</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matchedLocations.map((loc) => (
                    <div key={loc.location_id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="size-5 text-blue-600" />
                        <h3 className="font-bold text-slate-900 dark:text-white">{loc.location_name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{loc.address}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{loc.description}</p>
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
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 font-sans">Dịch vụ bao gồm</h3>
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
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 font-sans">Chi phí tự túc</h3>
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

            {/* ===== KHU VỰC ĐÁNH GIÁ ===== */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-left">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans leading-tight">Đánh giá từ khách hàng</h2>
              </div>

              {/* ===== TỔNG QUAN ĐIỂM + BIỂU ĐỒ PHÂN BỔ SAO ===== */}
              <div className="flex flex-col sm:flex-row gap-6 mb-8 p-5 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700">
                {/* Điểm số tổng */}
                <div className="flex flex-col items-center justify-center min-w-[110px] gap-1">
                  <span className="text-5xl font-black text-slate-900 dark:text-white leading-none">{averageRating}</span>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const avg = parseFloat(averageRating);
                      return (
                        <Star
                          key={s}
                          className={`size-4 ${avg >= s ? 'fill-amber-400 text-amber-400' : avg >= s - 0.5 ? 'fill-amber-200 text-amber-300' : 'text-slate-300 dark:text-slate-400'}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 text-center">
                    {reviewCount.toLocaleString('vi-VN')} đánh giá
                  </span>
                </div>

                {/* Thanh phân bổ từng sao */}
                <div className="flex-1 flex flex-col gap-2 justify-center">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingDist[star] ?? 0;
                    const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-8 shrink-0">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{star}</span>
                        </div>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-9 text-right shrink-0">{pct}%</span>
                        <span className="text-xs text-slate-400 dark:text-slate-400 w-14 text-right shrink-0 hidden sm:inline">({count.toLocaleString('vi-VN')})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {reviewNotice && (
                <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
                  {reviewNotice}
                </div>
              )}

              {/* Danh sách review */}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl size-11 rounded-full bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center shadow-inner shrink-0">{review.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-slate-900 dark:text-white font-bold text-sm">{review.name}</h4>
                          <span className="text-xs text-slate-400 dark:text-slate-400 font-bold">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`size-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-400'}`}
                            />
                          ))}
                          <span className="ml-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">{review.rating}/5</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold italic">"{review.comment}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form gửi đánh giá */}
              <form onSubmit={handleSubmitReview} className="mt-8 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 font-sans">Viết đánh giá của bạn</h3>
                
                {userBookingsCount > userReviewsCount ? (
                  <p className="mb-4 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm font-semibold text-blue-700 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300">
                    Bạn đã đặt tour này {userBookingsCount} lần và có thể viết {userBookingsCount - userReviewsCount} đánh giá nữa. Hãy chia sẻ trải nghiệm nhé!
                  </p>
                ) : userBookingsCount > 0 ? (
                  <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    Bạn đã viết đánh giá cho tất cả {userBookingsCount} lần đặt tour. Hãy đặt thêm tour để có thể đánh giá tiếp!
                  </p>
                ) : user ? (
                  <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                    Bạn chưa đặt tour này nên chưa thể gửi đánh giá. Hãy đặt tour để trải nghiệm nhé!
                  </p>
                ) : (
                  <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark:bg-amber-950/30 dark:border-amber-900">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                      Chỉ khách hàng đã đăng nhập và đặt tour mới có thể đánh giá.
                    </p>
                    <button onClick={() => navigate('/login')} className="shrink-0 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
                      Đăng nhập ngay
                    </button>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-400 mb-2">Mức độ hài lòng</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setMyRating(star)} className="hover:scale-110 transition-transform" disabled={!user || userBookingsCount <= userReviewsCount}>
                        <Star className={`size-7 ${star <= myRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-400'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-bold text-slate-600 dark:text-slate-300">{myRating}/5</span>
                  </div>
                </div>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  rows={4}
                  disabled={!user || userBookingsCount <= userReviewsCount}
                  placeholder="Chia sẻ trải nghiệm hành trình của bạn..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent px-4 py-3 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!user || userBookingsCount <= userReviewsCount}
                  className="mt-4 rounded-2xl bg-blue-900 px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-blue-600 dark:disabled:bg-slate-700"
                >
                  Gửi đánh giá
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sticky top-24 border border-slate-200/70 dark:border-slate-800 shadow-xl text-left ring-1 ring-blue-500/5">
              <div className="mb-6">
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-3xl font-black text-blue-900 dark:text-blue-400">{tour.price.toLocaleString('vi-VN')}đ</span>
                  <span className="text-slate-400 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">/ người lớn</span>
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                  Trẻ em (dưới 12 tuổi): {childPrice.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide">Trọn gói: {tour.duration}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider mb-2">Ngày khởi hành</label>
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
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider mb-2">Số lượng khách</label>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Người lớn</p>
                        <p className="text-[11px] font-semibold text-slate-400">Từ 12 tuổi trở lên</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">-</button>
                        <span className="w-6 text-center font-black">{adults}</span>
                        <button type="button" onClick={() => setAdults(adults + 1)} className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">+</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Trẻ em</p>
                        <p className="text-[11px] font-semibold text-slate-400">Dưới 12 tuổi</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">-</button>
                        <span className="w-6 text-center font-black">{children}</span>
                        <button type="button" onClick={() => setChildren(children + 1)} className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mb-6 text-sm font-semibold">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500 dark:text-slate-400">{tour.price.toLocaleString('vi-VN')}đ x {adults} người lớn</span>
                  <span className="text-slate-900 dark:text-slate-200">{(tour.price * adults).toLocaleString('vi-VN')}đ</span>
                </div>
                {children > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-500 dark:text-slate-400">{childPrice.toLocaleString('vi-VN')}đ x {children} trẻ em</span>
                    <span className="text-slate-900 dark:text-slate-200">{(childPrice * children).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2">
                  <span className="text-slate-900 dark:text-white">Tổng chi phí</span>
                  <span className="text-blue-900 dark:text-blue-400 font-black">{bookingTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <PaylineButton onClick={handleBooking} />
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-400 font-bold tracking-wide uppercase">
                Hỗ trợ hủy miễn phí trước 7 ngày
              </p>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="modal-overlay-enter fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="modal-panel-enter bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full border border-slate-100/40 dark:border-slate-800/40 shadow-2xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full mb-4">
                <CheckCircle className="size-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-sans">Thành công!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-semibold">Hành trình của bạn đã được đặt thành công</p>
              <div className="flex gap-3">
                <button onClick={() => setShowBookingModal(false)} className="interactive-press flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  Quay lại
                </button>
                <button onClick={() => navigate('/checkout')} className="interactive-press flex-1 px-4 py-2.5 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-950 dark:hover:bg-blue-700 transition-colors font-bold text-sm cursor-pointer shadow">
                  Thanh toán
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
