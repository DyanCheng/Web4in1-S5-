"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Package, FileText, User, Download, Trash2, Star, Ticket, Key, Camera, Building, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PanelSkeleton } from '@/components/ux/PageSkeleton';
import { useTheme } from '@/contexts/ThemeContext';
import { getUserReviews, addUserReview, hasReviewedTourTitle } from '@/lib/tourStorage';
import { apiUrl } from '@/lib/backendUrl';

const ITEMS_PER_PAGE = 10;

function canCancelBooking(dateStr?: string, status?: string) {
  if (!dateStr || !status) return false;
  if (['cancelled', 'cancel_pending', 'completed'].includes(status)) return false;
  const start = new Date(dateStr);
  if (Number.isNaN(start.getTime())) return false;
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  minDate.setDate(minDate.getDate() + 2);
  return start >= minDate;
}

function statusLabel(status?: string) {
  switch (status) {
    case 'confirmed': return 'Đã duyệt';
    case 'cancelled': return 'Đã hủy';
    case 'cancel_pending': return 'Chờ duyệt hủy';
    case 'completed': return 'Đã hoàn thành';
    default: return 'Chờ duyệt';
  }
}

function statusClass(status?: string) {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400';
    case 'cancelled':
      return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400';
    case 'cancel_pending':
      return 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300';
    default:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
  }
}

function formatPaidAt(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('vi-VN');
}

function PaginationBar({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50 cursor-pointer"
      >
        Trước
      </button>
      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Trang <span className="text-slate-900 dark:text-white">{page}</span> / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50 cursor-pointer"
      >
        Tiếp theo
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, updateProfile, changePassword, uploadAvatar, apiToken } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [hotelBookings, setHotelBookings] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [error, setError] = useState('');
  const [hotelError, setHotelError] = useState('');
  const [invoiceError, setInvoiceError] = useState('');
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [bookingPage, setBookingPage] = useState(1);
  const [hotelPage, setHotelPage] = useState(1);
  const [invoicePage, setInvoicePage] = useState(1);

  const [newReviewTour, setNewReviewTour] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);

  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileGender, setProfileGender] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    if (user?.avatar) setAvatarPreview(user.avatar);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setProfileName(user.name || '');
    setProfilePhone(user.phone || '');
    setProfileDob(user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '');
    setProfileGender(user.gender || '');
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarPreview || avatarPreview === user?.avatar) {
      setShowAvatarModal(false);
      return;
    }
    try {
      setSavingAvatar(true);
      await uploadAvatar(avatarPreview);
      alert('Đã lưu ảnh đại diện');
      setShowAvatarModal(false);
    } catch (err: any) {
      alert(err.message || 'Không thể lưu ảnh đại diện');
    } finally {
      setSavingAvatar(false);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const response = await fetch(apiUrl(`/api/bookings/user/${encodeURIComponent(user.email)}`));
      if (!response.ok) throw new Error('Không thể tải lịch sử đặt tour');
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
      setBookingPage(1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Không thể tải lịch sử đặt tour');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelBookings = async () => {
    if (!user) return;
    try {
      setLoadingHotels(true);
      setHotelError('');
      const response = await fetch(apiUrl(`/api/hotelbookings/user/${encodeURIComponent(user.email)}`));
      if (!response.ok) throw new Error('Không thể tải lịch sử đặt khách sạn');
      const data = await response.json();
      setHotelBookings(Array.isArray(data) ? data : []);
      setHotelPage(1);
    } catch (err: any) {
      console.error(err);
      setHotelError(err.message || 'Không thể tải lịch sử đặt khách sạn');
      setHotelBookings([]);
    } finally {
      setLoadingHotels(false);
    }
  };

  const fetchInvoices = async () => {
    if (!user) return;
    try {
      setLoadingInvoices(true);
      setInvoiceError('');
      const response = await fetch(apiUrl(`/api/payments/user/${encodeURIComponent(user.email)}`));
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Không thể tải hóa đơn thanh toán');
      }
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
      setInvoicePage(1);
    } catch (err: any) {
      console.error(err);
      setInvoiceError(err.message || 'Không thể tải hóa đơn');
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const response = await fetch(apiUrl('/api/coupons'));
      if (!response.ok) throw new Error('Không thể tải voucher');
      const data = await response.json();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBookings();
    fetchHotelBookings();
  }, [user, router]);

  useEffect(() => {
    if (activeTab === 'invoices') fetchInvoices();
    if (activeTab === 'vouchers') fetchVouchers();
  }, [activeTab, user]);

  useEffect(() => {
    setReviews(getUserReviews());
  }, []);

  const reviewableBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        (b.status === 'confirmed' || b.status === 'completed') &&
        !hasReviewedTourTitle(b.tourTitle)
    );
  }, [bookings, reviews]);

  useEffect(() => {
    if (reviewableBookings.length > 0 && newReviewTour === '') {
      setNewReviewTour(reviewableBookings[0].tourTitle);
    }
  }, [reviewableBookings, newReviewTour]);

  const bookingTotalPages = Math.max(1, Math.ceil(bookings.length / ITEMS_PER_PAGE));
  const paginatedBookings = bookings.slice((bookingPage - 1) * ITEMS_PER_PAGE, bookingPage * ITEMS_PER_PAGE);
  const hotelTotalPages = Math.max(1, Math.ceil(hotelBookings.length / ITEMS_PER_PAGE));
  const paginatedHotels = hotelBookings.slice((hotelPage - 1) * ITEMS_PER_PAGE, hotelPage * ITEMS_PER_PAGE);
  const invoiceTotalPages = Math.max(1, Math.ceil(invoices.length / ITEMS_PER_PAGE));
  const paginatedInvoices = invoices.slice((invoicePage - 1) * ITEMS_PER_PAGE, invoicePage * ITEMS_PER_PAGE);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewTour) {
      alert('Không có hành trình đủ điều kiện để đánh giá!');
      return;
    }
    if (!newReviewComment.trim()) {
      alert('Vui lòng nhập nhận xét chi tiết!');
      return;
    }
    const nextReviews = addUserReview({
      id: Date.now(),
      tour: newReviewTour,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toLocaleDateString('vi-VN'),
    });
    setReviews(nextReviews);
    setNewReviewComment('');
    setNewReviewRating(5);
    setNewReviewTour('');
    alert('Đã gửi đánh giá thành công!');
  };

  const handleDeleteBooking = async (id: string, date?: string, status?: string) => {
    if (!canCancelBooking(date, status)) {
      alert('Chỉ được hủy khi còn ít nhất 2 ngày trước ngày khởi hành, và đơn chưa ở trạng thái hủy.');
      return;
    }
    if (!confirm('Gửi yêu cầu hủy tour? Quản trị viên sẽ duyệt trước khi hủy chính thức.')) return;

    try {
      const response = await fetch(apiUrl(`/api/bookings/${id}`), { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Hủy đặt tour thất bại');
      alert(data.message || 'Đã gửi yêu cầu hủy. Chờ quản trị viên duyệt.');
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối máy chủ');
      fetchBookings();
    }
  };

  const handleDownloadInvoice = (id: string) => {
    window.open(`/invoice/${id}`, '_blank');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileSaving(true);
    try {
      await updateProfile({
        fullName: profileName,
        phone: profilePhone,
        dateOfBirth: profileDob || undefined,
        gender: profileGender || undefined,
      });

      if (user?.canChangePassword !== false && newPassword) {
        if (!currentPassword) throw new Error('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu');
        await changePassword(currentPassword, newPassword);
        setCurrentPassword('');
        setNewPassword('');
      }

      setProfileMessage('Cập nhật thông tin thành công!');
    } catch (err: any) {
      setProfileMessage(err.message || 'Cập nhật thất bại');
    } finally {
      setProfileSaving(false);
    }
  };

  const invoiceTitle = (inv: any) => {
    const items = inv.order_items || inv.orderItems;
    if (Array.isArray(items) && items.length > 0) {
      return items.map((i: any) => i.title || i.name || i.type).filter(Boolean).join(', ') || 'Thanh toán đơn hàng';
    }
    const refs = inv.booking_refs || inv.bookingRefs;
    if (Array.isArray(refs) && refs.length > 0) return refs.join(', ');
    return inv.payment_code || inv.paymentCode || 'Thanh toán';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-400 font-bold">
        Đang chuyển hướng đăng nhập...
      </div>
    );
  }

  const canChangePassword = user.canChangePassword !== false && user.authProvider !== 'google';

  return (
    <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-955 font-sans transition-colors duration-300 flex flex-col ${theme === 'dark' ? 'dark text-white' : 'text-slate-900 dark:text-slate-50'}`}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="text-left mb-10">
          <span className="inline-block px-4 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-100/30 uppercase tracking-widest mb-3">
            Tài khoản cá nhân
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-sans leading-tight text-slate-900 dark:text-white">
            Dashboard Của Tôi
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 space-y-1.5 border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
              <div className="flex flex-col items-center p-4 mb-2 border-b border-slate-100/60 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    setAvatarPreview(user?.avatar || null);
                    setShowAvatarModal(true);
                  }}
                  className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-md flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 hover:opacity-80 transition-opacity cursor-pointer shrink-0 mb-3"
                  title="Xem và thay đổi ảnh đại diện"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-blue-500">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </button>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 text-center leading-tight">{user?.name}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 cursor-pointer hover:underline text-center" onClick={() => setShowAvatarModal(true)}>
                  Đổi ảnh đại diện
                </p>
              </div>

              {[
                { id: 'bookings', icon: Package, label: 'Đặt hành trình của tôi' },
                { id: 'hotels', icon: Building, label: 'Khách sạn đã đặt' },
                { id: 'invoices', icon: FileText, label: 'Lịch sử hóa đơn' },
                { id: 'reviews', icon: Star, label: 'Đánh giá đã gửi' },
                { id: 'profile', icon: User, label: 'Thông tin tài khoản' },
                { id: 'vouchers', icon: Ticket, label: 'Kho Voucher' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors font-bold text-sm cursor-pointer ${activeTab === tab.id
                    ? 'bg-blue-900 dark:bg-blue-600 text-white shadow'
                    : 'text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <tab.icon className="size-4.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <Link href="/tours" className="block mt-6 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              ← Trở lại khám phá tours
            </Link>
          </div>

          <div className="lg:col-span-3 text-left">
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans leading-tight mb-4">Các hành trình đã đặt</h2>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="size-4 mt-0.5 shrink-0" />
                    <div>
                      <p>{error}</p>
                      <button type="button" onClick={fetchBookings} className="underline mt-1 cursor-pointer">Thử lại</button>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="rounded-3xl border border-slate-100/40 bg-white p-6 shadow-sm dark:border-slate-800/40 dark:bg-slate-900">
                    <PanelSkeleton rows={4} />
                  </div>
                ) : bookings.length === 0 && !error ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100/40 dark:border-slate-800/40 p-8 shadow-sm">
                    <p className="text-slate-550 dark:text-slate-400 mb-6 font-semibold">Bạn chưa đăng ký đặt tour nào</p>
                    <Link href="/tours" className="px-6 py-2.5 bg-blue-900 dark:bg-blue-600 text-white rounded-full transition-all font-bold text-sm shadow inline-block">
                      Tìm kiếm tour ngay
                    </Link>
                  </div>
                ) : (
                  <>
                    {paginatedBookings.map((booking) => (
                      <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100/40 dark:border-slate-800/40 shadow-sm flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={booking.tourImage} alt={booking.tourTitle} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{booking.tourTitle}</h3>
                            <span className={`px-3 py-1 rounded-full text-xxs font-black tracking-wide uppercase ${statusClass(booking.status)}`}>
                              {statusLabel(booking.status)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-xs font-bold">
                            <div>
                              <p className="text-slate-400 uppercase tracking-wide text-[9px] mb-0.5">Mã đơn đặt</p>
                              <p className="text-slate-800 dark:text-slate-200 font-extrabold">{booking.id}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 uppercase tracking-wide text-[9px] mb-0.5">Khởi hành</p>
                              <p className="text-slate-800 dark:text-slate-200">{booking.date}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 uppercase tracking-wide text-[9px] mb-0.5">Số lượng khách</p>
                              <p className="text-slate-800 dark:text-slate-200">{booking.guests} khách</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="text-2xl font-black text-blue-900 dark:text-blue-400">{Number(booking.total).toLocaleString('vi-VN')}đ</div>
                            {booking.status !== 'cancelled' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDownloadInvoice(booking.id)}
                                  className="px-4 py-2 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-955 dark:hover:bg-blue-700 transition-colors flex items-center gap-1.5 font-bold text-xs cursor-pointer shadow-sm"
                                >
                                  <Download className="size-3.5" />
                                  Hóa đơn
                                </button>
                                {booking.status !== 'cancel_pending' && canCancelBooking(booking.date, booking.status) && (
                                  <button
                                    onClick={() => handleDeleteBooking(booking.id, booking.date, booking.status)}
                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-655 rounded-2xl transition-colors flex items-center gap-1.5 font-bold text-xs cursor-pointer"
                                  >
                                    <Trash2 className="size-3.5" />
                                    Hủy tour
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <PaginationBar page={bookingPage} totalPages={bookingTotalPages} onChange={setBookingPage} />
                  </>
                )}
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans leading-tight mb-4">Các khách sạn đã đặt</h2>

                {hotelError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
                    {hotelError}{' '}
                    <button type="button" onClick={fetchHotelBookings} className="underline cursor-pointer">Thử lại</button>
                  </div>
                )}

                {loadingHotels ? (
                  <div className="rounded-3xl border border-slate-100/40 bg-white p-6 shadow-sm dark:border-slate-800/40 dark:bg-slate-900">
                    <PanelSkeleton rows={4} />
                  </div>
                ) : hotelBookings.length === 0 && !hotelError ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100/40 dark:border-slate-800/40 p-8 shadow-sm">
                    <p className="text-slate-550 dark:text-slate-400 mb-6 font-semibold">Bạn chưa đăng ký đặt phòng khách sạn nào</p>
                    <Link href="/hotel" className="px-6 py-2.5 bg-blue-900 dark:bg-blue-600 text-white rounded-full transition-all font-bold text-sm shadow inline-block">
                      Tìm kiếm khách sạn ngay
                    </Link>
                  </div>
                ) : (
                  <>
                    {paginatedHotels.map((booking) => {
                      const hotelDetail = booking.details?.[0] || {};
                      const hotelObj = hotelDetail.hotel || {};
                      const roomObj = hotelDetail.room || {};
                      const hotelName = hotelObj.name || booking.hotelName || 'Khách sạn';
                      const hotelImage = hotelObj.image || booking.hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
                      const roomName = roomObj.name || booking.roomName;
                      const quantity = hotelDetail.quantity || booking.quantity || booking.room_quantity || 1;
                      const totalPrice = booking.total_price || booking.totalPrice || booking.total_amount || 0;
                      const bookingCode = booking.booking_code || booking.bookingCode || booking.id;
                      const rowKey = String(booking.hotel_booking_id || booking.id || bookingCode);
                      const expanded = expandedHotelId === rowKey;
                      const adults = booking.adults ?? hotelDetail.adults ?? '—';
                      const children = booking.children ?? hotelDetail.children ?? '—';
                      const nights = booking.total_nights || booking.totalNights || hotelDetail.nights || '—';

                      return (
                        <div key={rowKey} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                              <img src={hotelImage} alt={hotelName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{hotelName}{roomName ? ` - ${roomName}` : ''}</h3>
                                <span className={`px-3 py-1 rounded-full text-xxs font-black tracking-wide uppercase ${(booking.payment_status === 'paid' || booking.paymentStatus === 'paid')
                                  ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                                  {(booking.payment_status === 'paid' || booking.paymentStatus === 'paid') ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-xs font-bold">
                                <div>
                                  <p className="text-slate-400 uppercase tracking-wide text-[9px] mb-0.5">Mã đơn đặt</p>
                                  <p className="text-slate-800 dark:text-slate-200 font-extrabold">{bookingCode}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 uppercase tracking-wide text-[9px] mb-0.5">Thời gian</p>
                                  <p className="text-slate-800 dark:text-slate-200">{(booking.check_in_date || booking.checkInDate || '').split('T')[0]} - {(booking.check_out_date || booking.checkOutDate || '').split('T')[0]}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 uppercase tracking-wide text-[9px] mb-0.5">Số lượng</p>
                                  <p className="text-slate-800 dark:text-slate-200">{quantity} Phòng</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-2xl font-black text-blue-900 dark:text-blue-400">{Number(totalPrice).toLocaleString('vi-VN')}đ</div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedHotelId(expanded ? null : rowKey)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl transition-colors flex items-center gap-1.5 font-bold text-xs cursor-pointer"
                                  >
                                    {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                                    {expanded ? 'Thu gọn' : 'Chi tiết'}
                                  </button>
                                  <Link
                                    href={`/hotel/booking/${encodeURIComponent(bookingCode)}`}
                                    className="px-4 py-2 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-955 dark:hover:bg-blue-700 transition-colors flex items-center gap-1.5 font-bold text-xs shadow-sm"
                                  >
                                    <FileText className="size-3.5" />
                                    Trang chi tiết
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                          {expanded && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                              <div>
                                <p className="text-slate-400 uppercase text-[9px] mb-0.5">Người lớn</p>
                                <p className="text-slate-800 dark:text-slate-200">{adults}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 uppercase text-[9px] mb-0.5">Trẻ em</p>
                                <p className="text-slate-800 dark:text-slate-200">{children}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 uppercase text-[9px] mb-0.5">Số đêm</p>
                                <p className="text-slate-800 dark:text-slate-200">{nights}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 uppercase text-[9px] mb-0.5">Trạng thái đơn</p>
                                <p className="text-slate-800 dark:text-slate-200">{booking.booking_status || booking.status || '—'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <PaginationBar page={hotelPage} totalPages={hotelTotalPages} onChange={setHotelPage} />
                  </>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans mb-6">Lịch sử hóa đơn</h2>
                {invoiceError && (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
                    {invoiceError}
                  </div>
                )}
                <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase tracking-widest font-black">Mã thanh toán</th>
                          <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase tracking-widest font-black">Nội dung</th>
                          <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase tracking-widest font-black">Ngày thanh toán</th>
                          <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase tracking-widest font-black">Tổng chi phí</th>
                          <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase tracking-widest font-black">Tải xuống</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                        {loadingInvoices ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-500 font-bold">Đang tải hóa đơn...</td>
                          </tr>
                        ) : paginatedInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-500 font-bold">Chưa có hóa đơn thanh toán nào</td>
                          </tr>
                        ) : (
                          paginatedInvoices.map((inv) => {
                            const code = inv.payment_code || inv.paymentCode;
                            const paidAt = inv.paid_at || inv.paidAt;
                            const amount = inv.amount;
                            const refs = inv.booking_refs || inv.bookingRefs || [];
                            const firstRef = Array.isArray(refs) && refs.length > 0 ? refs[0] : code;
                            return (
                              <tr key={code || inv.order_payment_id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{code}</td>
                                <td className="px-6 py-4">{invoiceTitle(inv)}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatPaidAt(paidAt)}</td>
                                <td className="px-6 py-4 text-blue-900 dark:text-blue-400 font-black">{Number(amount).toLocaleString('vi-VN')}đ</td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => handleDownloadInvoice(firstRef)}
                                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold text-xs cursor-pointer"
                                  >
                                    <Download className="size-3.5" />
                                    Tải PDF
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  <PaginationBar page={invoicePage} totalPages={invoiceTotalPages} onChange={setInvoicePage} />
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans mb-6">Đánh giá của tôi</h2>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-center py-10">
                      <p className="text-slate-500 dark:text-slate-400 font-bold">Bạn chưa có đánh giá nào.</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{review.tour}</h3>
                          <span className="text-xs text-slate-400 font-bold">{review.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-3">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-slate-655 dark:text-slate-300 text-sm font-medium italic">“{review.comment}”</p>
                      </div>
                    ))
                  )}

                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-6 font-sans">Viết đánh giá hành trình mới</h3>
                    <form className="space-y-5" onSubmit={handleSubmitReview}>
                      {reviewableBookings.length === 0 && (
                        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                          Bạn có thể đánh giá các tour đã xác nhận hoặc hoàn thành và chưa được đánh giá.
                        </p>
                      )}
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2">Chọn hành trình</label>
                        <select
                          value={newReviewTour}
                          onChange={(e) => setNewReviewTour(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl outline-none focus:border-blue-400 text-slate-800 dark:text-slate-100 font-bold text-sm"
                        >
                          {reviewableBookings.map((b) => (
                            <option key={b.id} value={b.tourTitle}>{b.tourTitle}</option>
                          ))}
                          {reviewableBookings.length === 0 && <option value="">Không có tour đủ điều kiện</option>}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2">Mức độ hài lòng</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setNewReviewRating(star)} className="hover:scale-110 transition-transform cursor-pointer">
                              <Star className={`size-8 ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2">Nhận xét chi tiết</label>
                        <textarea
                          rows={4}
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 text-slate-800 dark:text-slate-100 font-bold text-sm"
                          placeholder="Chia sẻ trải nghiệm hành trình của bạn..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={reviewableBookings.length === 0}
                        className="px-6 py-3 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-colors font-bold text-xs cursor-pointer shadow disabled:opacity-50"
                      >
                        Gửi đánh giá
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans mb-6">Thông tin tài khoản</h2>
                <form className="space-y-5" onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2">Họ và tên</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 text-slate-800 dark:text-slate-100 font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+84 XXX XXX XXX"
                        className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 text-slate-800 dark:text-slate-100 font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2">Ngày sinh</label>
                      <input
                        type="date"
                        value={profileDob}
                        onChange={(e) => setProfileDob(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 text-slate-850 dark:text-slate-200 font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2">Giới tính</label>
                      <select
                        value={profileGender}
                        onChange={(e) => setProfileGender(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl outline-none focus:border-blue-400 text-slate-800 dark:text-slate-100 font-bold text-sm"
                      >
                        <option value="">Chưa chọn</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white font-sans mb-4 flex items-center gap-2">
                      <Key className="size-5 text-blue-600" /> Thông tin đăng nhập
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2">Email / Tên đăng nhập</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-2xl outline-none text-slate-500 dark:text-slate-400 font-bold text-sm cursor-not-allowed"
                        />
                      </div>
                      {canChangePassword ? (
                        <>
                          <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Mật khẩu hiện tại</label>
                            <input
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 text-slate-800 dark:text-slate-100 font-bold text-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 text-slate-800 dark:text-slate-100 font-bold text-sm"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="md:col-span-1 flex items-end">
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 w-full">
                            Tài khoản Google — không thể đổi mật khẩu tại đây.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {profileMessage && (
                    <p className={`text-sm font-semibold ${profileMessage.includes('thành công') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {profileMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={profileSaving || !apiToken}
                    className="px-6 py-3 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-colors font-bold text-xs cursor-pointer shadow mt-4 disabled:opacity-50"
                  >
                    {profileSaving ? 'Đang lưu...' : 'Lưu các thay đổi'}
                  </button>
                  {!apiToken && (
                    <p className="text-xs text-amber-600 font-semibold">Vui lòng đăng nhập lại để cập nhật hồ sơ.</p>
                  )}
                </form>
              </div>
            )}

            {activeTab === 'vouchers' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-sans mb-6 flex items-center gap-2">
                  <Ticket className="size-6 text-blue-600" />
                  Kho Voucher & Mã giảm giá
                </h2>
                {loadingVouchers ? (
                  <PanelSkeleton rows={3} />
                ) : vouchers.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 text-center text-slate-500 font-bold">
                    Hiện chưa có voucher khả dụng.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {vouchers.map((voucher) => {
                      const code = voucher.coupon_code || voucher.couponCode;
                      const desc = voucher.description || '';
                      const type = voucher.discount_type || voucher.discountType;
                      const value = Number(voucher.discount_value || voucher.discountValue || 0);
                      const end = voucher.end_date || voucher.endDate;
                      const title = type === 'percent'
                        ? `Giảm ${value}%`
                        : `Giảm ${value.toLocaleString('vi-VN')}đ`;
                      const expiry = end ? new Date(end).toLocaleDateString('vi-VN') : '—';
                      return (
                        <div key={voucher.coupon_id || code} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100/40 dark:border-slate-800/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase rounded-bl-xl bg-blue-50 text-blue-600 border-blue-200 dark:bg-slate-800 dark:border-slate-700">
                            Đang mở
                          </div>
                          <div>
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2 leading-tight">{title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{desc}</p>
                          </div>
                          <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MÃ CODE</p>
                              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{code}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HSD</p>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{expiry}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {showAvatarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-xs sm:max-w-sm shadow-2xl animate-fade-in text-center border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Ảnh đại diện</h3>
            <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-inner flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 mb-8">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl font-black text-blue-500">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveAvatar}
                disabled={savingAvatar}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors cursor-pointer shadow-sm mb-2 disabled:opacity-50"
              >
                {savingAvatar ? 'Đang lưu...' : 'Lưu ảnh đại diện'}
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-sm"
              >
                <Camera className="size-4" />
                Thay ảnh (Thư viện)
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-sm"
              >
                <Camera className="size-4" />
                Chụp ảnh mới
              </button>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-3 mt-2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 font-bold transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
            <input type="file" accept="image/*" ref={galleryInputRef} className="hidden" onChange={handleAvatarChange} />
            <input type="file" accept="image/*" capture="user" ref={cameraInputRef} className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>
      )}
    </div>
  );
}
