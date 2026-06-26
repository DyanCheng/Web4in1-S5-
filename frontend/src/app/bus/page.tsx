"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Armchair,
  BadgeCheck,
  Briefcase,
  Bus,
  CalendarDays,
  ChevronDown,
  Coffee,
  Filter,
  MapPin,
  Search,
  Star,
  Users,
  Utensils,
  Wifi,
  X,
  Zap,
} from 'lucide-react';

type BusClass = 'Giường nằm' | 'Limousine' | 'Ghế ngồi';
type SortMode = 'price' | 'duration' | 'departure';
type TimeSlot = 'Sáng' | 'Chiều' | 'Tối' | 'Đêm';
type SelectedTimeSlot = TimeSlot | '';

type BusRoute = (typeof buses)[number];

const buses = [
  {
    id: 'futa-1',
    company: 'Phương Trang (FUTA)',
    code: 'FUTA-125',
    from: 'Hà Nội',
    fromCode: 'BX Mỹ Đình',
    to: 'Đà Nẵng',
    toCode: 'BX Đà Nẵng',
    departure: '18:00',
    arrival: '10:00',
    duration: 960,
    stop: 'Nhiều trạm nghỉ',
    price: 350000,
    oldPrice: 400000,
    busClass: 'Giường nằm' as BusClass,
    tag: 'Phổ biến',
    amenities: ['WiFi', 'Điều hòa', 'Chăn gối', 'Nước uống'],
    slot: 'Tối' as TimeSlot,
    seats: 6,
    rating: 4.8,
  },
  {
    id: 'hl-1',
    company: 'Hoàng Long',
    code: 'HL-01',
    from: 'Hà Nội',
    fromCode: 'BX Giáp Bát',
    to: 'Vinh',
    toCode: 'BX Vinh',
    departure: '06:00',
    arrival: '12:30',
    duration: 390,
    stop: '1 trạm nghỉ',
    price: 180000,
    busClass: 'Ghế ngồi' as BusClass,
    tag: 'Tiết kiệm',
    amenities: ['Điều hòa', 'Nước uống'],
    slot: 'Sáng' as TimeSlot,
    seats: 15,
    rating: 4.3,
  },
  {
    id: 'tb-1',
    company: 'Thành Bưởi',
    code: 'TB-99',
    from: 'Hồ Chí Minh',
    fromCode: 'BX Miền Đông',
    to: 'Đà Lạt',
    toCode: 'BX Đà Lạt',
    departure: '20:00',
    arrival: '04:30',
    duration: 510,
    stop: 'Không dừng',
    price: 250000,
    busClass: 'Limousine' as BusClass,
    tag: 'VIP',
    amenities: ['WiFi', 'Điều hòa', 'Sạc USB', 'Ghế massage'],
    slot: 'Tối' as TimeSlot,
    seats: 4,
    rating: 4.9,
  },
  {
    id: 'ks-1',
    company: 'Kumho Samco',
    code: 'KS-45',
    from: 'Hồ Chí Minh',
    fromCode: 'BX Miền Tây',
    to: 'Cần Thơ',
    toCode: 'BX Cần Thơ',
    departure: '07:00',
    arrival: '10:30',
    duration: 210,
    stop: '1 trạm nghỉ',
    price: 120000,
    oldPrice: 150000,
    busClass: 'Ghế ngồi' as BusClass,
    tag: 'Rẻ nhất',
    amenities: ['Điều hòa'],
    slot: 'Sáng' as TimeSlot,
    seats: 22,
    rating: 4.4,
  },
  {
    id: 'sv-1',
    company: 'Sao Việt',
    code: 'SV-VIP',
    from: 'Hà Nội',
    fromCode: 'BX Nước Ngầm',
    to: 'Hồ Chí Minh',
    toCode: 'BX Miền Đông',
    departure: '19:00',
    arrival: '21:00',
    duration: 1560,
    stop: 'Nhiều trạm nghỉ',
    price: 600000,
    busClass: 'Giường nằm' as BusClass,
    tag: 'Xuyên Việt',
    amenities: ['WiFi', 'Điều hòa', 'Sạc USB', 'Chăn gối'],
    slot: 'Tối' as TimeSlot,
    seats: 2,
    rating: 4.7,
  },
  {
    id: 'ml-1',
    company: 'Mai Linh Express',
    code: 'ML-08',
    from: 'Đà Nẵng',
    fromCode: 'BX Đà Nẵng',
    to: 'Huế',
    toCode: 'BX Huế',
    departure: '09:00',
    arrival: '11:30',
    duration: 150,
    stop: 'Không dừng',
    price: 90000,
    busClass: 'Ghế ngồi' as BusClass,
    tag: 'Nhanh chóng',
    amenities: ['Điều hòa'],
    slot: 'Sáng' as TimeSlot,
    seats: 18,
    rating: 4.2,
  },
];

const busClasses: BusClass[] = ['Giường nằm', 'Limousine', 'Ghế ngồi'];
const timeSlots: Array<{ label: TimeSlot; range: string }> = [
  { label: 'Sáng', range: '06:00-12:00' },
  { label: 'Chiều', range: '12:00-18:00' },
  { label: 'Tối', range: '18:00-00:00' },
  { label: 'Đêm', range: '00:00-06:00' },
];

function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function getAmenityIcon(amenity: string) {
  if (amenity.includes('WiFi')) return Wifi;
  if (amenity.includes('Sạc') || amenity.includes('USB')) return Zap;
  if (amenity.includes('Ghế') || amenity.includes('Chăn gối')) return Armchair;
  if (amenity.includes('Nước')) return Coffee;
  return BadgeCheck;
}

export default function BusPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { addToCart } = useCart();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [passengers, setPassengers] = useState('1 người');
  const [selectedClasses, setSelectedClasses] = useState<BusClass[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedTimeSlot>('');
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortMode, setSortMode] = useState<SortMode>('price');
  const [notice, setNotice] = useState('');
  const [selectedBus, setSelectedBus] = useState<BusRoute | null>(null);

  const filteredBuses = useMemo(() => {
    return buses
      .filter((b) => {
        const fromText = from.trim().toLowerCase();
        const toText = to.trim().toLowerCase();
        const matchesFrom = !fromText || b.from.toLowerCase().includes(fromText) || b.fromCode.toLowerCase().includes(fromText);
        const matchesTo = !toText || b.to.toLowerCase().includes(toText) || b.toCode.toLowerCase().includes(toText);
        const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(b.busClass);
        const matchesSlot = !selectedSlot || b.slot === selectedSlot;
        const matchesPrice = b.price <= maxPrice;
        return matchesFrom && matchesTo && matchesClass && matchesSlot && matchesPrice;
      })
      .sort((a, b) => {
        if (sortMode === 'duration') return a.duration - b.duration;
        if (sortMode === 'departure') return a.departure.localeCompare(b.departure);
        return a.price - b.price;
      });
  }, [from, to, selectedClasses, selectedSlot, maxPrice, sortMode]);

  const toggleClass = (cls: BusClass) => {
    setSelectedClasses((cur) =>
      cur.includes(cls) ? cur.filter((c) => c !== cls) : [...cur, cls]
    );
  };

  const handleSearch = () => {
    const label = tripType === 'round-trip' ? 'khứ hồi' : 'một chiều';
    const ret = tripType === 'round-trip' ? `, ngày về ${returnDate}` : '';
    setNotice(`Đang tìm vé xe ${label}: ${from || 'mọi điểm đi'} → ${to || 'mọi điểm đến'} vào ${date || 'ngày gần nhất'}${ret} cho ${passengers}.`);
  };

  const selectBus = (b: BusRoute) => {
    setSelectedBus(b);
    setNotice(`Đã chọn xe ${b.company} tuyến ${b.from} đến ${b.to}.`);
  };

  const resetFilters = () => {
    setSelectedClasses([]);
    setSelectedSlot('');
    setMaxPrice(1000000);
    setSortMode('price');
    setNotice('Đã đặt lại bộ lọc vé xe.');
  };

  return (
    <div
      className={`min-h-screen bg-slate-100 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${
        theme === 'dark' ? 'dark text-white' : 'text-slate-900'
      }`}
    >
      <Header />

      <main className="flex-1">
        {/* ── Hero / Search ── */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 px-4 py-12 sm:py-16 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 select-none pointer-events-none text-[160px] flex items-center justify-end pr-10">🚌</div>
          <div className="max-w-7xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold uppercase tracking-widest mb-4">
              <Bus className="size-3.5" /> Vé Xe Khách
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Đặt vé xe khách – <span className="text-blue-300">Nhanh chóng & Tiện lợi</span>
            </h1>
            <p className="text-white/70 font-medium mb-8">Hàng ngàn chuyến xe liên tỉnh chất lượng cao, đặt vé dễ dàng chỉ trong vài bước</p>

            <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl">
              {/* Trip type */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setTripType('one-way')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all ${
                    tripType === 'one-way'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Một chiều
                </button>
                <button
                  onClick={() => setTripType('round-trip')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all ${
                    tripType === 'round-trip'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h18M17 6l5 6-5 6M7 6L2 12l5 6" />
                  </svg>
                  Khứ hồi
                </button>
              </div>

              <div
                className={`grid gap-4 ${
                  tripType === 'round-trip'
                    ? 'grid-cols-1 md:grid-cols-[1fr_1fr_0.7fr_0.7fr_0.8fr_auto]'
                    : 'grid-cols-1 md:grid-cols-[1fr_1fr_0.8fr_0.9fr_auto]'
                }`}
              >
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Điểm khởi hành
                  <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-3">
                    <MapPin className="size-5 text-slate-500" />
                    <input
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Ví dụ: Hà Nội"
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-slate-100"
                    />
                  </span>
                </label>

                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Điểm đến
                  <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-3">
                    <Bus className="size-5 text-slate-500" />
                    <input
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Ví dụ: Đà Nẵng"
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-slate-100"
                    />
                  </span>
                </label>

                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Ngày đi
                  <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-3">
                    <CalendarDays className="size-5 text-slate-500" />
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-slate-100"
                    />
                  </span>
                </label>

                {tripType === 'round-trip' && (
                  <label className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Ngày về
                    <span className="mt-2 flex items-center gap-2 rounded-lg border-2 border-blue-400 dark:border-blue-600 px-3 py-3 bg-blue-50 dark:bg-blue-950/30">
                      <CalendarDays className="size-5 text-blue-500" />
                      <input
                        type="date"
                        min={date || new Date().toISOString().split('T')[0]}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-slate-100"
                      />
                    </span>
                  </label>
                )}

                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Hành khách
                  <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-3">
                    <Users className="size-5 text-slate-500" />
                    <input
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-slate-100"
                    />
                  </span>
                </label>

                <button
                  onClick={handleSearch}
                  className="md:self-end inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3.5 text-sm font-black text-white hover:bg-blue-700 transition-colors"
                >
                  <Search className="size-5" />
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          {notice && (
            <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              {notice}
            </div>
          )}

          {/* Selected flight panel */}
          {selectedBus && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-white p-5 shadow-md dark:border-blue-900 dark:bg-slate-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">Vé đang chọn</p>
                      <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                        {selectedBus.company} – {selectedBus.code}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedBus(null)}
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 lg:hidden"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 sm:grid-cols-4">
                    <span>Tuyến: {selectedBus.from} → {selectedBus.to}</span>
                    <span>Giờ: {selectedBus.departure} – {selectedBus.arrival}</span>
                    <span>Ngày đi: {date || 'Chưa chọn'}</span>
                    <span>Khách: {passengers}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{formatVnd(selectedBus.price)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!date) {
                          alert('Vui lòng chọn ngày đi');
                          return;
                        }
                        addToCart({
                          tourId: selectedBus.id,
                          title: selectedBus.company,
                          image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
                          price: selectedBus.price,
                          quantity: 1,
                          date: date,
                          guests: parseInt(passengers) || 1,
                        });
                        router.push('/checkout');
                      }}
                      className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
                    >
                      Tiếp tục thanh toán
                    </button>
                    <button
                      onClick={() => setSelectedBus(null)}
                      className="hidden rounded-lg border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* ── Sidebar Filter ── */}
            <aside className="space-y-8">
              <div className="flex items-center gap-3">
                <Filter className="size-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Bộ lọc</h2>
              </div>

              <div className="space-y-8">
                {/* Loại ghế */}
                <div>
                  <p className="mb-4 text-sm font-black text-slate-800 dark:text-slate-100">Loại ghế</p>
                  <div className="space-y-3">
                    {busClasses.map((cls) => (
                      <label key={cls} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(cls)}
                          onChange={() => toggleClass(cls)}
                          className="size-4 accent-blue-600"
                        />
                        <Armchair className="size-5 text-slate-600 dark:text-slate-300" />
                        {cls}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Khoảng giá */}
                <div>
                  <p className="mb-4 text-sm font-black text-slate-800 dark:text-slate-100">Giá vé tối đa (VNĐ)</p>
                  <input
                    type="range"
                    min={100000}
                    max={1000000}
                    step={50000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
                    <span>100.000đ</span>
                    <span>{formatVnd(maxPrice)}</span>
                  </div>
                </div>

                {/* Giờ khởi hành */}
                <div>
                  <p className="mb-4 text-sm font-black text-slate-800 dark:text-slate-100">Giờ khởi hành</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedSlot('')}
                      className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                        selectedSlot === ''
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <span className="block">Tất cả</span>
                      <span className="text-xs">Mọi giờ</span>
                    </button>
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.label}
                        onClick={() => setSelectedSlot(slot.label)}
                        className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                          selectedSlot === slot.label
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                      >
                        <span className="block">{slot.label}</span>
                        <span className="text-xs">{slot.range}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={resetFilters}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-400"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </aside>

            {/* ── Results ── */}
            <div>
              <div className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Hiển thị <span className="font-black text-slate-900 dark:text-white">{filteredBuses.length}</span> chuyến xe
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500">Sắp xếp:</span>
                  <button
                    onClick={() => setSortMode(sortMode === 'price' ? 'duration' : sortMode === 'duration' ? 'departure' : 'price')}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-black text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                  >
                    {sortMode === 'price' && 'Giá thấp nhất'}
                    {sortMode === 'duration' && 'Nhanh nhất'}
                    {sortMode === 'departure' && 'Khởi hành sớm'}
                    <ChevronDown className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {filteredBuses.length === 0 ? (
                  <div className="rounded-xl bg-white p-10 text-center font-black text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                    Không tìm thấy chuyến xe phù hợp với bộ lọc hiện tại.
                  </div>
                ) : (
                  filteredBuses.map((bus) => (
                    <article
                      key={bus.id}
                      className={`rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900 ${
                        selectedBus?.id === bus.id
                          ? 'border-blue-500 ring-2 ring-blue-100 dark:border-blue-400 dark:ring-blue-950'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_230px]">
                        <div>
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1.2fr_1.6fr]">
                            {/* Bus company info */}
                            <div className="flex items-center gap-4">
                              <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400 text-xl">
                                🚌
                              </div>
                              <div>
                                <h3 className="font-black text-slate-900 dark:text-white">{bus.company}</h3>
                                <p className="text-xs font-bold text-slate-500">{bus.busClass}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="size-3 fill-blue-400 text-blue-400" />
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{bus.rating}</span>
                                  <span className="text-xs text-slate-400">· {bus.seats} ghế trống</span>
                                </div>
                              </div>
                            </div>

                            {/* Route timeline */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                              <div>
                                <p className="text-2xl font-black text-slate-950 dark:text-white">{bus.departure}</p>
                                <p className="text-xs font-bold text-slate-500">{bus.fromCode}</p>
                              </div>
                              <div className="min-w-32 text-center">
                                <p className="text-xs font-bold text-slate-400">{formatDuration(bus.duration)}</p>
                                <div className="my-1 flex items-center gap-2">
                                  <span className="size-1.5 rounded-full border border-blue-500" />
                                  <span className="h-px flex-1 bg-slate-300" />
                                  <Bus className="size-4 text-blue-500" />
                                  <span className="h-px flex-1 bg-slate-300" />
                                  <span className="size-1.5 rounded-full bg-blue-500" />
                                </div>
                                <p className="text-xs font-bold text-slate-500">{bus.stop}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-black text-slate-950 dark:text-white">{bus.arrival}</p>
                                <p className="text-xs font-bold text-slate-500">{bus.toCode}</p>
                              </div>
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                            <div className="flex flex-wrap gap-2">
                              {bus.amenities.map((amenity) => {
                                const AmenityIcon = getAmenityIcon(amenity);
                                return (
                                  <span
                                    key={amenity}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-105 cursor-default"
                                  >
                                    <AmenityIcon className="size-3.5" />
                                    {amenity}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Right: price + action */}
                        <div className="flex flex-col items-end justify-between border-slate-200 md:border-l md:pl-8 dark:border-slate-800">
                          <div className="text-right">
                            {bus.oldPrice && (
                              <p className="text-xs font-bold text-slate-400 line-through">{formatVnd(bus.oldPrice)}</p>
                            )}
                            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatVnd(bus.price)}</p>
                            <p className="text-xs text-slate-400 font-bold">/ khách</p>
                          </div>

                          <button
                            onClick={() => selectBus(bus)}
                            className={`mt-5 rounded-lg px-8 py-3 text-sm font-black text-white shadow-md transition-colors ${
                              selectedBus?.id === bus.id
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {selectedBus?.id === bus.id ? 'Đã chọn' : 'Chọn vé'}
                          </button>

                          {bus.tag && (
                            <span className="mt-5 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                              {bus.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))
                )}

                {/* Promo banner */}
                <div className="rounded-xl bg-gradient-to-r from-blue-900 to-blue-950 p-8 text-white shadow-lg">
                  <div className="max-w-xl">
                    <h2 className="text-2xl font-black">Khuyến mãi cực sốc</h2>
                    <p className="mt-3 text-sm font-medium text-slate-200">
                      Giảm giá lên đến 20% khi mua vé khứ hồi trên tất cả các tuyến đường. Nhanh tay đặt vé ngay hôm nay!
                    </p>
                    <button
                      onClick={() => setNotice('Đã áp dụng mã khuyến mãi 20% cho chuyến đi.')}
                      className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-black text-blue-900"
                    >
                      Nhận ưu đãi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
