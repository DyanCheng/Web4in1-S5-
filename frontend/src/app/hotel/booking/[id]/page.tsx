"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageSkeleton } from '@/components/ux/PageSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiUrl } from '@/lib/backendUrl';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function HotelBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingCode = decodeURIComponent(String(params.id || ''));
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(
          apiUrl(`/api/hotelbookings/${encodeURIComponent(bookingCode)}?email=${encodeURIComponent(user.email)}`)
        );
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || 'Không tìm thấy đơn đặt khách sạn');
        }
        setBooking(await response.json());
      } catch (err: any) {
        setError(err.message || 'Không thể tải chi tiết');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user, authLoading, bookingCode, router]);

  if (loading || authLoading) return <PageSkeleton variant="form" />;

  const detail = booking?.details?.[0] || {};
  const hotel = detail.hotel || {};
  const room = detail.room || {};
  const hotelName = hotel.name || booking?.hotelName || 'Khách sạn';
  const hotelImage = hotel.image || booking?.hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
  const roomName = room.name || booking?.roomName || '—';
  const total = booking?.total_price || booking?.totalPrice || booking?.total_amount || 0;

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 mb-6">
          <ArrowLeft className="size-4" /> Quay lại Dashboard
        </Link>

        {error || !booking ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-red-500 font-bold mb-4">{error || 'Không tìm thấy đơn'}</p>
            <Link href="/dashboard" className="text-blue-600 font-bold underline">Về dashboard</Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="h-52 w-full overflow-hidden">
              <img src={hotelImage} alt={hotelName} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-3">
                <Building2 className="size-6 text-blue-600 mt-1" />
                <div>
                  <h1 className="text-2xl font-black">{hotelName}</h1>
                  <p className="text-sm font-semibold text-slate-500 mt-1">Mã đơn: {booking.booking_code || booking.bookingCode || bookingCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 tracking-widest">Phòng</p>
                  <p>{roomName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 tracking-widest">Số phòng</p>
                  <p>{detail.quantity || booking.quantity || booking.room_quantity || 1}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 tracking-widest">Nhận phòng</p>
                  <p>{(booking.check_in_date || booking.checkInDate || '').split('T')[0]}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 tracking-widest">Trả phòng</p>
                  <p>{(booking.check_out_date || booking.checkOutDate || '').split('T')[0]}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 tracking-widest">Thanh toán</p>
                  <p>{booking.payment_status || booking.paymentStatus || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 tracking-widest">Trạng thái</p>
                  <p>{booking.booking_status || booking.status || '—'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Tổng thanh toán</span>
                <span className="text-2xl font-black text-blue-900 dark:text-blue-400">
                  {Number(total).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
