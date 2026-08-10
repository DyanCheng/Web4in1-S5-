"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Calendar, Star, CheckCircle, X, Heart, Share2, ChevronDown, ChevronUp, Clock, Plane, Hotel, Utensils, Bus, Ticket, Shield, Camera, Play, List, Users } from 'lucide-react';
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
    const mapped = raw.map((day: TourItineraryDay) => ({
      ...day,
      activities: Array.isArray(day.activities) ? day.activities : [],
    }));
    if (mapped.length > 0) return mapped;

    // API thường trả itinerary rỗng — bịa lịch trình theo số ngày
    const dayMatch = String(tour?.duration ?? '').match(/(\d+)\s*ngày/i);
    const days = Math.max(Number(tour?.durationDays) || (dayMatch ? Number(dayMatch[1]) : 0) || 3, 1);
    const loc = tour?.location || 'điểm đến';
    const highlights = Array.isArray(tour?.highlights) ? tour.highlights : [];

    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const spot = highlights[i % Math.max(highlights.length, 1)] || loc;
      if (day === 1) {
        return {
          day,
          title: `Khởi hành - ${loc}`,
          meals: 'Trưa, Tối',
          accommodation: `Khách sạn tại ${loc}`,
          activities: [
            { time: '08:00', desc: `Tập trung, làm thủ tục khởi hành đi ${loc}.` },
            { time: '12:00', desc: 'Dùng bữa trưa, nhận phòng khách sạn nghỉ ngơi.' },
            { time: '15:00', desc: `Tham quan điểm nổi bật đầu tiên: ${spot}.` },
            { time: '19:00', desc: 'Dùng bữa tối đặc sản địa phương, nghỉ đêm.' },
          ],
        };
      }
      if (day === days) {
        return {
          day,
          title: `${loc} - Về lại`,
          meals: 'Sáng, Trưa',
          accommodation: '',
          activities: [
            { time: '07:00', desc: 'Ăn sáng tại khách sạn, trả phòng.' },
            { time: '09:00', desc: `Mua sắm / tham quan tự do quanh ${loc}.` },
            { time: '13:00', desc: 'Dùng bữa trưa, ra sân bay/ga làm thủ tục về.' },
            { time: '18:00', desc: 'Kết thúc chương trình, chia tay quý khách.' },
          ],
        };
      }
      return {
        day,
        title: `Khám phá ${spot}`,
        meals: 'Sáng, Trưa, Tối',
        accommodation: `Khách sạn tại ${loc}`,
        activities: [
          { time: '07:30', desc: 'Ăn sáng buffet tại khách sạn.' },
          { time: '09:00', desc: `Tham quan ${spot} — điểm nhấn trong ngày.` },
          { time: '12:30', desc: 'Ăn trưa, nghỉ ngơi ngắn.' },
          { time: '14:30', desc: `Tiếp tục lịch trình tham quan và trải nghiệm tại ${loc}.` },
          { time: '19:00', desc: 'Ăn tối, tự do khám phá về đêm (chi phí tự túc nếu có).' },
        ],
      };
    });
  }, [tour]);
  const [activeThumb, setActiveThumb] = useState(0);
  const galleryThumbs = [1, 2, 3, 4];
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const [openNoteKeys, setOpenNoteKeys] = useState<string[]>([]);
  const [monthFilter, setMonthFilter] = useState<'all' | string>('all');
  const [childYoung, setChildYoung] = useState(0); // 2-5 tuổi (bịa UI)
  const [infants, setInfants] = useState(0); // <2 tuổi (bịa UI)
  const childPrice = Number(tour?.childPrice ?? 0);
  const totalChildren = children + childYoung;
  const bookingTotal = tour
    ? tour.price * Math.max(adults, 1) + childPrice * Math.max(totalChildren, 0)
    : 0;
  const singleRoomSurcharge = Math.round(Number(tour?.price ?? 0) * 0.45);

  const departureOptions = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const nightMatch = String(tour?.duration ?? '').match(/(\d+)\s*đêm/i);
    const nights = nightMatch ? Number(nightMatch[1]) : Math.max(Number(tour?.durationDays ?? 3) - 1, 2);
    return [7, 14, 21, 28, 35, 42, 49].map((offset, i) => {
      const start = new Date(base);
      start.setDate(start.getDate() + offset);
      const end = new Date(start);
      end.setDate(end.getDate() + nights);
      const priceBump = i % 2 === 1 ? 1.1 : 1;
      return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        price: Math.round(Number(tour?.price ?? 0) * priceBump),
        contact: i % 3 === 0,
      };
    });
  }, [tour?.duration, tour?.durationDays, tour?.price]);

  const monthTabs = useMemo(() => {
    const months = new Map<string, string>();
    departureOptions.forEach((d) => {
      const dt = new Date(d.start + 'T00:00:00');
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      const label = `Tháng ${dt.getMonth() + 1} ${dt.getFullYear()}`;
      months.set(key, label);
    });
    return Array.from(months.entries()).map(([key, label]) => ({ key, label }));
  }, [departureOptions]);

  const filteredDepartures = useMemo(() => {
    if (monthFilter === 'all') return departureOptions;
    return departureOptions.filter((d) => {
      const dt = new Date(d.start + 'T00:00:00');
      return `${dt.getFullYear()}-${dt.getMonth()}` === monthFilter;
    });
  }, [departureOptions, monthFilter]);

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const expandAllDays = () => setExpandedDays(itinerary.map((d) => d.day));
  const collapseAllDays = () => setExpandedDays([]);

  useEffect(() => {
    if (itinerary.length > 0) {
      setExpandedDays([itinerary[0].day]);
    } else {
      setExpandedDays([]);
    }
  }, [itinerary]);

  const toggleNote = (key: string) => {
    setOpenNoteKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const scrollToId = (idName: string) => {
    document.getElementById(idName)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const rating10 = (parseFloat(averageRating) * 2).toFixed(1);
  const ratingLabel =
    parseFloat(rating10) >= 9 ? 'Tuyệt vời' : parseFloat(rating10) >= 8 ? 'Rất tốt' : parseFloat(rating10) >= 7 ? 'Tốt' : 'Khá';

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
      children: totalChildren,
      metadata: {
        children: totalChildren,
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

  const truncatedTitle = tour.title.length > 48 ? `${tour.title.slice(0, 48)}…` : tour.title;
  const rawHighlights: string[] =
    Array.isArray(tour.highlights) && tour.highlights.length > 0
      ? tour.highlights
      : [
          `Khám phá điểm đến nổi tiếng tại ${tour.location}`,
          `Trải nghiệm ẩm thực đặc sản ${tour.location}`,
          `Tham quan các địa danh văn hóa hàng đầu`,
          `Nghỉ dưỡng tại khách sạn tiêu chuẩn 3-4 sao`,
          `Hướng dẫn viên chuyên nghiệp suốt hành trình`,
        ];
  const highlightDescDefaults = [
    `Trải nghiệm đáng nhớ tại ${tour.location} với lịch trình được sắp xếp hợp lý, phù hợp mọi lứa tuổi.`,
    `Khám phá cảnh đẹp và văn hóa đặc sắc trong hành trình ${tour.duration}, tạo nên kỷ niệm khó quên.`,
    `Dịch vụ chuyên nghiệp, đảm bảo hành trình thoải mái và an toàn từ đầu đến cuối chuyến đi.`,
    `Cơ hội chụp ảnh và lưu giữ khoảnh khắc đáng nhớ cùng gia đình, bạn bè.`,
    `Phù hợp cho du lịch nghỉ dưỡng, khám phá và trải nghiệm địa phương chân thực.`,
  ];
  const highlightItems = rawHighlights.map((title, index) => ({
    title,
    desc: highlightDescDefaults[index % highlightDescDefaults.length],
  }));
  const includedItems: string[] =
    tour.included?.length > 0
      ? tour.included
      : [
          'Vé máy bay khứ hồi (hạng phổ thông)',
          'Khách sạn 3-4 sao theo chương trình',
          'Ăn sáng & các bữa theo lịch trình',
          'Xe đưa đón tham quan theo chương trình',
          'Vé tham quan các điểm trong lịch trình',
          'Hướng dẫn viên tiếng Việt suốt tuyến',
          'Bảo hiểm du lịch cơ bản',
        ];
  const excludedItems: string[] =
    tour.excluded?.length > 0
      ? tour.excluded
      : [
          'Chi phí cá nhân, đồ uống ngoài chương trình',
          'Tip cho hướng dẫn viên và tài xế',
          'Visa (nếu có)',
          'Phụ thu phòng đơn (1 khách/1 phòng)',
          'Các dịch vụ ngoài chương trình',
        ];
  const serviceIcons = [
    { Icon: Plane, label: 'Vé máy bay' },
    { Icon: Hotel, label: 'Khách sạn 3-4*' },
    { Icon: Utensils, label: 'Bữa ăn' },
    { Icon: Bus, label: 'Xe tham quan' },
    { Icon: Ticket, label: 'Vé tham quan' },
    { Icon: Users, label: 'HDV' },
    { Icon: Shield, label: 'Bảo hiểm' },
  ];
  const noteItems = [
    {
      key: 'children',
      title: 'Chính sách trẻ em',
      lines: [
        'Trẻ em từ 6–9 tuổi: áp dụng giá trẻ em theo chương trình.',
        'Trẻ em 2–5 tuổi: phụ thu theo quy định, không chiếm giường riêng.',
        'Trẻ dưới 2 tuổi: miễn phí (không chiếm ghế, không chiếm giường).',
        'Từ 10 tuổi trở lên tính như người lớn.',
      ],
    },
    {
      key: 'cancel',
      title: 'Chính sách hủy',
      lines: [
        'Hủy trước 30 ngày khởi hành: hoàn 70% giá tour.',
        'Hủy trước 15 ngày khởi hành: hoàn 50% giá tour.',
        'Hủy trong vòng 7 ngày: không hoàn tiền.',
        'Giai đoạn lễ/tết có thể áp dụng chính sách riêng.',
      ],
    },
    {
      key: 'conditions',
      title: 'Điều kiện tham gia',
      lines: [
        'Hộ chiếu còn hạn tối thiểu 6 tháng (tour nước ngoài).',
        'Lịch trình có thể điều chỉnh thứ tự điểm đến theo tình hình thực tế.',
        'Khách tự chịu trách nhiệm giấy tờ tùy thân hợp lệ.',
        'Tuân thủ quy định an toàn và hướng dẫn của HDV trong suốt chuyến đi.',
      ],
    },
  ];
  const relatedTours = [
    { id: `${tour.id}-r1`, title: `Tour ${tour.location} 3N2Đ tiêu chuẩn`, price: Math.round(tour.price * 0.88) },
    { id: `${tour.id}-r2`, title: `Combo ${tour.location} cao cấp`, price: Math.round(tour.price * 1.12) },
    { id: `${tour.id}-r3`, title: `Khám phá ${tour.location} tiết kiệm`, price: Math.round(tour.price * 0.82) },
  ];
  const navItems = [
    { id: 'sec-dates', label: 'Ngày đi & giá' },
    { id: 'sec-highlights', label: 'Điểm nổi bật' },
    { id: 'sec-itinerary', label: 'Lịch trình' },
    { id: 'sec-included', label: 'Bao gồm' },
    { id: 'sec-notes', label: 'Lưu ý' },
    { id: 'sec-reviews', label: 'Đánh giá' },
  ];
  const allExpanded = itinerary.length > 0 && expandedDays.length === itinerary.length;
  const displayTotal = bookingTotal + (adults === 1 ? singleRoomSurcharge : 0);

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${theme === 'dark' ? 'dark text-white' : 'text-slate-900'}`}>
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12 w-full flex-1">
        {/* Breadcrumb */}
        <nav className="text-left mb-3 text-xs font-bold text-slate-500 dark:text-slate-400">
          <button type="button" onClick={() => navigate('/')} className="hover:text-blue-700 dark:hover:text-blue-400">Trang chủ</button>
          <span className="mx-1.5">/</span>
          <span>{tour.location}</span>
          <span className="mx-1.5">/</span>
          <span className="text-slate-700 dark:text-slate-300">{truncatedTitle}</span>
        </nav>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-blue-700 text-white text-[11px] font-black px-2.5 py-0.5">TO{String(tour.id).padStart(4, '0')}</span>
          <span className="rounded-full bg-blue-700 text-white text-[11px] font-black px-2.5 py-0.5">{tour.location}</span>
          <span className="rounded-full bg-orange-500 text-white text-[11px] font-black px-2.5 py-0.5">Ô tô, Máy bay</span>
        </div>

        {/* Title */}
        <h1 className="text-left text-xl sm:text-2xl lg:text-[28px] font-black font-sans leading-snug mb-3">{tour.title}</h1>

        {/* Meta row + price */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1">
            <span className="font-black">{rating10}</span>
            <span>{ratingLabel}</span>
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-semibold">{reviewCount.toLocaleString('vi-VN')} đánh giá</span>
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Clock className="size-4 text-slate-400" />
            {tour.duration}
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <MapPin className="size-4 text-slate-400" />
            Khởi hành từ {tour.location}
          </span>
          <div className="ml-auto text-right shrink-0">
            <p className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 leading-none">{tour.price.toLocaleString('vi-VN')}đ</p>
            <p className="text-xs font-bold text-slate-500">mỗi khách</p>
          </div>
        </div>

        {/* Save / Share */}
        <div className="flex flex-wrap gap-4 mb-5">
          <button type="button" onClick={handleFavoriteToggle} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 dark:text-blue-400">
            <Heart className={`size-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
            Lưu
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 dark:text-blue-400">
            <Share2 className="size-4" />
            Chia sẻ
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 text-left space-y-0">
            <div className="relative grid grid-cols-3 gap-1 rounded-lg overflow-hidden h-[220px] sm:h-[280px] md:h-[320px] mb-4">
              <button type="button" onClick={() => setActiveThumb(0)} className="relative col-span-2 h-full overflow-hidden">
                <ImageWithFallback src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 rounded bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wide">Giá Tiết Kiệm</span>
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-black/60 text-white text-[11px] font-bold px-2 py-1">
                  <Camera className="size-3.5" />
                  11 ảnh
                </span>
              </button>
              <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
                {galleryThumbs.map((idx, thumbIndex) => (
                  <button key={idx} type="button" onClick={() => setActiveThumb(idx)} className="relative overflow-hidden h-full min-h-0">
                    <ImageWithFallback src={tour.image} alt={`${tour.title} ${idx}`} className="w-full h-full object-cover" />
                    {thumbIndex === 1 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="size-8 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="size-4 text-slate-800 fill-slate-800 ml-0.5" />
                        </span>
                      </span>
                    )}
                    {thumbIndex === galleryThumbs.length - 1 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-[11px] font-bold">
                        +6 Xem ảnh
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-y border-slate-200 dark:border-slate-800 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-lg sm:border">
              <div className="flex overflow-x-auto gap-0">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToId(item.id)}
                    className="shrink-0 px-3 sm:px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 border-b-2 border-transparent hover:border-blue-600"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <section id="sec-dates" className="scroll-mt-28 mb-10">
              <div className="flex items-center gap-2 mb-1">
                <List className="size-5 text-blue-700 dark:text-blue-400" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-sans">Lịch khởi hành</h2>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-4">Chọn ngày khởi hành phù hợp với bạn</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setMonthFilter('all')}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    monthFilter === 'all'
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Tất cả
                </button>
                {monthTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMonthFilter(tab.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                      monthFilter === tab.key
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filteredDepartures.map((dep) => {
                  const startDt = new Date(dep.start + 'T00:00:00');
                  const endDt = new Date(dep.end + 'T00:00:00');
                  const active = selectedDate === dep.start;
                  const weekday = startDt.toLocaleDateString('vi-VN', { weekday: 'short' });
                  const dayMonth = startDt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                  const rangeStr = `${startDt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} – ${endDt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
                  return (
                    <div
                      key={dep.start}
                      className={`flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                        active
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="shrink-0 text-center min-w-[52px]">
                        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">{weekday}</p>
                        <p className="text-lg font-black text-blue-700 dark:text-blue-400 leading-tight">{dayMonth}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{rangeStr}</p>
                        {dep.contact && (
                          <span className="inline-block mt-0.5 text-xs font-black text-red-600 dark:text-red-400">Liên hệ</span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-orange-600 dark:text-orange-400">
                          {dep.price.toLocaleString('vi-VN')}đ
                          <span className="text-xs font-bold text-slate-500"> / khách</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDate(dep.start)}
                        className={`shrink-0 rounded-lg border px-4 py-1.5 text-xs font-black transition-colors ${
                          active
                            ? 'border-blue-700 bg-blue-700 text-white'
                            : 'border-blue-600 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                        }`}
                      >
                        {active ? 'Đã chọn' : 'Chọn'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="sec-highlights" className="scroll-mt-28 mb-10">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1 font-sans">Điểm nổi bật tour</h2>
              <p className="text-sm font-medium text-slate-500 mb-5">Những trải nghiệm chính trong hành trình.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlightItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 size-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-black text-sm flex items-center justify-center">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base mb-1.5 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {matchedLocations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  {matchedLocations.map((loc) => (
                    <div key={loc.location_id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="size-4 text-blue-600" />
                        <h4 className="font-bold text-sm">{loc.location_name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">{loc.address}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{loc.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section id="sec-itinerary" className="scroll-mt-28 mb-10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-sans">Lịch trình</h2>
                  <p className="text-sm font-medium text-slate-500">Hoạt động chính từng ngày.</p>
                </div>
                <button
                  type="button"
                  onClick={() => (allExpanded ? collapseAllDays() : expandAllDays())}
                  className="text-sm font-bold text-blue-700 dark:text-blue-400"
                >
                  {allExpanded ? 'Thu gọn' : 'Mở tất cả'}
                </button>
              </div>

              {itinerary.length === 0 ? (
                <p className="text-sm font-semibold text-slate-500">Chưa có lịch trình chi tiết.</p>
              ) : (
                <div className="space-y-3">
                  {itinerary.map((dayData) => {
                    const activities = dayData.activities ?? [];
                    const open = expandedDays.includes(dayData.day);
                    return (
                      <div key={dayData.day} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleDay(dayData.day)}
                          className="w-full flex items-center gap-3 p-3 sm:p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        >
                          <ImageWithFallback
                            src={tour.image}
                            alt={`Ngày ${dayData.day}`}
                            className="size-14 sm:size-16 rounded object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-blue-700 dark:text-blue-400 mb-0.5">Ngày {dayData.day}</p>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{dayData.title}</h3>
                            {(dayData.meals || dayData.accommodation) && (
                              <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                                {[dayData.meals && `Ăn: ${dayData.meals}`, dayData.accommodation && `Nghỉ: ${dayData.accommodation}`]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            )}
                          </div>
                          {open ? <ChevronUp className="size-5 text-slate-400 shrink-0" /> : <ChevronDown className="size-5 text-slate-400 shrink-0" />}
                        </button>

                        {open && (
                          <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wide text-slate-400">Hoạt động</h4>
                            {activities.length === 0 ? (
                              <p className="text-sm font-semibold text-slate-500">Chưa có hoạt động cho ngày này.</p>
                            ) : (
                              <div className="space-y-3">
                                {activities.map((act, idx) => (
                                  <div key={idx} className="text-sm">
                                    {act.time && <span className="font-black text-blue-700 dark:text-blue-400 mr-2">{act.time}</span>}
                                    <span className="font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{act.desc}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <ImageWithFallback src={tour.image} alt={dayData.title} className="w-full h-40 object-cover rounded-lg" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section id="sec-included" className="scroll-mt-28 mb-10">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1 font-sans">Bao gồm & chưa bao gồm</h2>
              <p className="text-sm font-medium text-slate-500 mb-5">Các dịch vụ chính trong giá tour.</p>
              <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
                {serviceIcons.map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 min-w-[64px]">
                    <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                      <Icon className="size-5 text-blue-700 dark:text-blue-400" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{label}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Giá tour bao gồm</h3>
                  <ul className="space-y-2">
                    {includedItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Chưa bao gồm</h3>
                  <ul className="space-y-2">
                    {excludedItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <X className="size-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section id="sec-notes" className="scroll-mt-28 mb-10">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1 font-sans">Lưu ý quan trọng</h2>
              <p className="text-sm font-medium text-slate-500 mb-4">Thông tin cần biết trước khi đặt tour.</p>
              <div className="space-y-2">
                {noteItems.map((note) => {
                  const open = openNoteKeys.includes(note.key);
                  return (
                    <div key={note.key} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleNote(note.key)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      >
                        {note.title}
                        {open ? <ChevronUp className="size-5 text-slate-400" /> : <ChevronDown className="size-5 text-slate-400" />}
                      </button>
                      {open && (
                        <div className="px-4 pb-4 text-sm font-medium text-slate-600 dark:text-slate-300 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                          {note.lines.map((line, i) => (
                            <p key={i}>· {line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="sec-reviews" className="scroll-mt-28 mb-6">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1 font-sans">Đánh giá của khách hàng</h2>
              <p className="text-sm font-medium text-slate-500 mb-4">Trải nghiệm thực tế từ khách đã đi tour.</p>

              <div className="flex items-end gap-2 mb-5">
                <span className="text-4xl font-black text-blue-700 dark:text-blue-400">{rating10}</span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 pb-1">/10 · {ratingLabel} · {reviewCount.toLocaleString('vi-VN')} đánh giá</span>
              </div>

              {reviewNotice && (
                <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
                  {reviewNotice}
                </div>
              )}

              <div className="space-y-4 mb-6">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{review.name}</h4>
                      <span className="text-xs text-slate-400 font-bold">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`size-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{review.comment}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmitReview} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <h3 className="text-sm font-extrabold mb-3">Viết đánh giá</h3>
                {!user && (
                  <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 flex justify-between gap-2 items-center dark:bg-amber-950/30">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Đăng nhập để đánh giá.</p>
                    <button type="button" onClick={() => navigate('/login')} className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg">Đăng nhập</button>
                  </div>
                )}
                <div className="mb-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setMyRating(star)} disabled={!user || userBookingsCount <= userReviewsCount}>
                      <Star className={`size-6 ${star <= myRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  rows={3}
                  disabled={!user || userBookingsCount <= userReviewsCount}
                  placeholder="Chia sẻ trải nghiệm..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm font-medium outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!user || userBookingsCount <= userReviewsCount}
                  className="mt-3 rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-bold text-white disabled:bg-slate-400"
                >
                  Gửi đánh giá
                </button>
              </form>
            </section>

            <section className="scroll-mt-28 mb-6">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-4 font-sans">Tour liên quan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedTours.map((rel) => (
                  <div key={rel.id} className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-36">
                      <ImageWithFallback src={tour.image} alt={rel.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-2">{rel.title}</h3>
                      <p className="text-base font-black text-orange-600 dark:text-orange-400">{rel.price.toLocaleString('vi-VN')}đ</p>
                      <p className="text-[10px] font-bold text-slate-500">/ khách</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm text-left">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Giá từ <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{tour.price.toLocaleString('vi-VN')}đ</span> / Khách
                </p>
                <p className="text-xs font-semibold text-slate-500 mb-4">Chọn ngày để tính tổng chuyến đi</p>

                {!selectedDate ? (
                  <div className="rounded-lg bg-slate-100 dark:bg-slate-800/60 p-4 mb-4 text-center">
                    <Calendar className="size-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-500">Chưa chọn ngày khởi hành...</p>
                    <button
                      type="button"
                      onClick={() => scrollToId('sec-dates')}
                      className="mt-2 text-xs font-bold text-blue-700 dark:text-blue-400 underline"
                    >
                      Chọn ngày khởi hành
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 mb-4">
                      <p className="text-xs font-bold text-slate-500 mb-0.5">Ngày khởi hành</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold">Người lớn <span className="text-xs font-semibold text-slate-400">&gt;9 tuổi</span></span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="size-7 rounded border border-slate-200 dark:border-slate-700 font-bold">-</button>
                          <span className="w-5 text-center font-black">{adults}</span>
                          <button type="button" onClick={() => setAdults(adults + 1)} className="size-7 rounded border border-slate-200 dark:border-slate-700 font-bold">+</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold">Trẻ em <span className="text-xs font-semibold text-slate-400">6–9 tuổi</span></span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="size-7 rounded border border-slate-200 dark:border-slate-700 font-bold">-</button>
                          <span className="w-5 text-center font-black">{children}</span>
                          <button type="button" onClick={() => setChildren(children + 1)} className="size-7 rounded border border-slate-200 dark:border-slate-700 font-bold">+</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold">Trẻ em <span className="text-xs font-semibold text-slate-400">2–5 tuổi</span></span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setChildYoung(Math.max(0, childYoung - 1))} className="size-7 rounded border border-slate-200 dark:border-slate-700 font-bold">-</button>
                          <span className="w-5 text-center font-black">{childYoung}</span>
                          <button type="button" onClick={() => setChildYoung(childYoung + 1)} className="size-7 rounded border border-slate-200 dark:border-slate-700 font-bold">+</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold">Trẻ nhỏ <span className="text-xs font-semibold text-slate-400">&lt;2 tuổi</span></span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setInfants(Math.max(0, infants - 1))} className="size-7 rounded border border-slate-200 dark:border-slate-700 font-bold">-</button>
                          <span className="w-5 text-center font-black">{infants}</span>
                          <button type="button" onClick={() => setInfants(infants + 1)} className="size-7 rounded border border-slate-200 dark:border-slate-700 font-bold">+</button>
                        </div>
                      </div>
                    </div>

                    {adults === 1 && (
                      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                        <span>Phụ thu phòng đơn</span>
                        <span>{singleRoomSurcharge.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mb-4">
                      <div className="flex justify-between font-black text-base">
                        <span>Tổng cộng</span>
                        <span className="text-orange-600 dark:text-orange-400">{displayTotal.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>

                    <PaylineButton onClick={handleBooking} />
                  </>
                )}

                <button
                  type="button"
                  onClick={() => scrollToId('sec-dates')}
                  className="mt-2 w-full rounded-lg border border-blue-600 text-blue-700 dark:text-blue-400 py-2.5 text-sm font-bold"
                >
                  Liên hệ tư vấn
                </button>
              </div>
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
