"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Clock, Armchair, User, Mail, Phone, CreditCard, ChevronLeft, AlertTriangle } from 'lucide-react';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();

  const flightId = searchParams.get('flightId') || 'Chưa rõ';
  const ticketName = searchParams.get('ticketName') || 'Vé Phổ thông';
  const price = parseInt(searchParams.get('price') || '0', 10);

  const isPremium = ticketName.includes('Premium') || ticketName.includes('đặc biệt');

  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  
  const [seatFilter, setSeatFilter] = useState<'all' | 'empty' | 'selected' | 'occupied'>('all');

  const toggleFilter = (type: 'empty' | 'selected' | 'occupied') => {
    setSeatFilter(prev => prev === type ? 'all' : type);
  };
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    passport: ''
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      alert('Thời gian giữ chỗ đã hết! Vui lòng chọn lại chuyến bay.');
      router.push('/flight');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSeatClick = (seat: string) => {
    setSelectedSeat(seat);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) {
      alert('Vui lòng chọn ghế ngồi!');
      return;
    }
    
    // Thêm vào giỏ hàng
    addToCart({
      tourId: `${flightId}-${selectedSeat}`,
      title: `Chuyến bay: ${flightId} - Ghế: ${selectedSeat} (${ticketName}) - ${formData.name}`,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
      price: price,
      quantity: 1,
      date: new Date().toISOString().split('T')[0],
      guests: 1,
    });

    router.push('/checkout');
  };

  // Generate fake seat map
  const rows = isPremium ? Array.from({ length: 5 }, (_, i) => i + 1) : Array.from({ length: 20 }, (_, i) => i + 6);
  const cols = isPremium ? ['A', 'C', 'D', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F'];
  const midColIndex = Math.ceil(cols.length / 2);

  // Randomize some occupied seats
  const [occupiedSeats] = useState(() => {
    const occupied = new Set<string>();
    for(let i=0; i<30; i++) {
       const r = rows[Math.floor(Math.random() * rows.length)];
       const c = cols[Math.floor(Math.random() * cols.length)];
       occupied.add(`${r}${c}`);
    }
    return occupied;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />
      
      {/* Timer Bar */}
      <div className="sticky top-0 z-40 bg-rose-600 text-white py-3 shadow-md border-b border-rose-700">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <Clock className="size-5 animate-pulse" />
            <span className="hidden sm:inline">Thời gian giữ chỗ còn lại:</span>
            <span className="sm:hidden">Giữ chỗ:</span>
          </div>
          <span className="text-xl tabular-nums tracking-widest">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-semibold transition-colors">
          <ChevronLeft className="size-4" /> Quay lại
        </button>

        <h1 className="text-3xl font-black mb-8 text-slate-900 dark:text-white">Hoàn tất đặt vé</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Cột trái: Sơ đồ ghế (2 phần) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Armchair className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold">Chọn ghế ngồi</h2>
                <p className="text-sm text-slate-500">Mã chuyến bay: <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">{flightId}</span></p>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="inline-flex gap-1 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-bold text-slate-500 cursor-pointer select-none border border-slate-200 dark:border-slate-700 shadow-inner">
                 <div onClick={() => toggleFilter('empty')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${seatFilter === 'empty' ? 'bg-blue-600 text-white shadow-md scale-105' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                   <span className={`size-3 rounded border ${seatFilter === 'empty' ? 'bg-white border-white' : 'bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500'}`}></span> Các ghế trống
                 </div>
                 <div onClick={() => toggleFilter('selected')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${seatFilter === 'selected' ? 'bg-blue-600 text-white shadow-md scale-105' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                   <span className={`size-3 rounded ${seatFilter === 'selected' ? 'bg-white' : isPremium ? 'bg-amber-500' : 'bg-blue-600'}`}></span> Đã chọn
                 </div>
                 <div onClick={() => toggleFilter('occupied')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${seatFilter === 'occupied' ? 'bg-blue-600 text-white shadow-md scale-105' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                   <span className={`size-3 rounded ${seatFilter === 'occupied' ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'}`}></span> Đã đặt
                 </div>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl flex flex-col items-center max-h-[500px] overflow-y-auto">
              <div className="w-full max-w-[240px]">
                {rows.map(row => (
                  <div key={row} className="flex justify-between mb-3 items-center">
                    <div className="flex gap-2">
                      {cols.slice(0, midColIndex).map(col => {
                        const seatId = `${row}${col}`;
                        const isSelected = selectedSeat === seatId;
                        const isOccupied = occupiedSeats.has(seatId);
                        const isEmpty = !isSelected && !isOccupied;

                        let isHiddenByFilter = false;
                        if (seatFilter === 'empty' && !isEmpty) isHiddenByFilter = true;
                        if (seatFilter === 'selected' && !isSelected) isHiddenByFilter = true;
                        if (seatFilter === 'occupied' && !isOccupied) isHiddenByFilter = true;

                        return (
                          <button
                            key={seatId}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => handleSeatClick(seatId)}
                            className={`${isPremium ? 'size-10 sm:size-12 rounded-xl text-sm' : 'size-8 sm:size-9 rounded-lg text-xs'} font-bold transition-all flex items-center justify-center ${
                              isHiddenByFilter ? 'opacity-10 scale-90 pointer-events-none' : ''
                            } ${
                              isSelected 
                                ? (isPremium ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-110' : 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-110')
                                : isOccupied
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                                : 'bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-500 hover:border-blue-500'
                            }`}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                    
                    <span className="text-xs font-black text-slate-400 w-6 text-center">{row}</span>

                    <div className="flex gap-2">
                      {cols.slice(midColIndex).map(col => {
                        const seatId = `${row}${col}`;
                        const isSelected = selectedSeat === seatId;
                        const isOccupied = occupiedSeats.has(seatId);
                        const isEmpty = !isSelected && !isOccupied;

                        let isHiddenByFilter = false;
                        if (seatFilter === 'empty' && !isEmpty) isHiddenByFilter = true;
                        if (seatFilter === 'selected' && !isSelected) isHiddenByFilter = true;
                        if (seatFilter === 'occupied' && !isOccupied) isHiddenByFilter = true;

                        return (
                          <button
                            key={seatId}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => handleSeatClick(seatId)}
                            className={`${isPremium ? 'size-10 sm:size-12 rounded-xl text-sm' : 'size-8 sm:size-9 rounded-lg text-xs'} font-bold transition-all flex items-center justify-center ${
                              isHiddenByFilter ? 'opacity-10 scale-90 pointer-events-none' : ''
                            } ${
                              isSelected 
                                ? (isPremium ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-110' : 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-110')
                                : isOccupied
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                                : 'bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-500 hover:border-blue-500'
                            }`}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Ghế đã chọn:</span>
              <span className={`text-xl font-black ${isPremium ? 'text-amber-600' : 'text-blue-600'}`}>{selectedSeat || 'Chưa chọn'}</span>
            </div>
          </div>

          {/* Cột phải: Form thông tin (3 phần) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
                <User className="size-6 text-blue-600" />
                Thông tin hành khách
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Họ và tên (như trên giấy tờ)</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="VD: NGUYEN VAN A" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-semibold" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email liên hệ</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 size-5 text-slate-400" />
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 size-5 text-slate-400" />
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="0901234567" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Số Hộ chiếu / CCCD</label>
                  <input required type="text" name="passport" value={formData.passport} onChange={handleInputChange} placeholder="Nhập số giấy tờ tuỳ thân" className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium uppercase" />
                </div>
              </div>
            </div>

            {/* Total and Submit */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-semibold text-lg">Tổng thanh toán:</span>
                <div className="text-right">
                   <div className="text-3xl font-black text-rose-600 leading-none">{price.toLocaleString('vi-VN')}đ</div>
                   <div className="text-sm font-medium text-slate-400 mt-1">{ticketName}</div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-4 rounded-xl text-sm font-medium flex items-start gap-3 mb-6">
                <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                <p>Vui lòng kiểm tra kỹ thông tin. Tên hành khách phải trùng khớp hoàn toàn với Giấy tờ tuỳ thân dùng để bay. Mọi sai sót có thể dẫn đến việc bị từ chối bay.</p>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 text-lg">
                <CreditCard className="size-6" />
                Tiếp tục đến Thanh toán
              </button>
            </div>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-xl text-slate-500">Đang tải thông tin chuyến bay...</div>}>
      <BookingContent />
    </Suspense>
  );
}
