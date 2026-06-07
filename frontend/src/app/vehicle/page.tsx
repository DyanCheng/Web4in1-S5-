"use client";

import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Armchair,
  BadgeCheck,
  Briefcase,
  Bus,
  CalendarDays,
  Car,
  ChevronDown,
  Coffee,
  Filter,
  MapPin,
  Plane,
  Search,
  Train,
  Utensils,
  Users,
  Wifi,
  X,
} from 'lucide-react';

type VehicleType = 'Máy bay' | 'Tàu hỏa' | 'Xe khách' | 'Limousine';
type SortMode = 'price' | 'duration' | 'departure';
type TimeSlot = 'Sáng' | 'Chiều' | 'Tối' | 'Đêm';
type SelectedTimeSlot = TimeSlot | '';
type Vehicle = (typeof vehicles)[number];

const vehicles = [
  {
    id: 'vn-airlines',
    type: 'Máy bay' as VehicleType,
    provider: 'Vietnam Airlines',
    code: 'VN-254',
    from: 'Hà Nội',
    fromCode: 'HAN',
    to: 'Hồ Chí Minh',
    toCode: 'SGN',
    departure: '08:00',
    arrival: '10:10',
    duration: 130,
    stop: 'Trực tiếp',
    price: 2120000,
    oldPrice: 2450000,
    tag: 'Hạng Thương Gia',
    amenities: ['WiFi', 'Bữa ăn', '20kg Hành lý'],
    slot: 'Sáng' as TimeSlot,
  },
  {
    id: 'se3-speed',
    type: 'Tàu hỏa' as VehicleType,
    provider: 'Đường Sắt VN',
    code: 'SE3 Speed',
    from: 'Hà Nội',
    fromCode: 'Hà Nội',
    to: 'Sài Gòn',
    toCode: 'Sài Gòn',
    departure: '19:30',
    arrival: '00:30',
    duration: 1740,
    stop: '11 điểm dừng',
    price: 1250000,
    tag: 'Phổ thông',
    amenities: ['Giường nằm', 'Điều hòa', 'Sạc pin'],
    slot: 'Tối' as TimeSlot,
  },
  {
    id: 'luxury-express',
    type: 'Xe khách' as VehicleType,
    provider: 'Luxury Express',
    code: 'Phổ biến nhất',
    from: 'Hà Nội',
    fromCode: 'BX Mỹ Đình',
    to: 'Lào Cai',
    toCode: 'Lào Cai',
    departure: '14:00',
    arrival: '20:30',
    duration: 390,
    stop: 'Dừng nội',
    price: 450000,
    tag: 'Standard',
    amenities: ['Ghế massage', 'Nước uống', 'Màn hình riêng'],
    slot: 'Chiều' as TimeSlot,
  },
  {
    id: 'vip-limousine',
    type: 'Limousine' as VehicleType,
    provider: 'Royal Limousine',
    code: 'VIP 9 chỗ',
    from: 'Hà Nội',
    fromCode: 'Nội Bài',
    to: 'Hạ Long',
    toCode: 'Bãi Cháy',
    departure: '09:15',
    arrival: '12:45',
    duration: 210,
    stop: 'Trực tiếp',
    price: 380000,
    oldPrice: 450000,
    tag: 'VIP',
    amenities: ['Ghế massage', 'WiFi', 'Nước uống'],
    slot: 'Sáng' as TimeSlot,
  },
  {
    id: 'vietjet-night',
    type: 'Máy bay' as VehicleType,
    provider: 'Vietjet Air',
    code: 'VJ-177',
    from: 'Hồ Chí Minh',
    fromCode: 'SGN',
    to: 'Đà Nẵng',
    toCode: 'DAD',
    departure: '22:10',
    arrival: '23:30',
    duration: 80,
    stop: 'Trực tiếp',
    price: 890000,
    oldPrice: 1100000,
    tag: 'Tiết kiệm',
    amenities: ['7kg Hành lý', 'Đổi vé linh hoạt'],
    slot: 'Đêm' as TimeSlot,
  },
  {
    id: 'sleeper-bus',
    type: 'Xe khách' as VehicleType,
    provider: 'Sapa Sleeper Bus',
    code: 'Cabin đôi',
    from: 'Hà Nội',
    fromCode: 'Phố Cổ',
    to: 'Sa Pa',
    toCode: 'Sa Pa',
    departure: '23:00',
    arrival: '05:30',
    duration: 390,
    stop: 'Dừng nghỉ',
    price: 520000,
    tag: 'Cabin',
    amenities: ['Giường nằm', 'WiFi', 'Nước uống'],
    slot: 'Đêm' as TimeSlot,
  },
];

const vehicleTypes: VehicleType[] = ['Máy bay', 'Tàu hỏa', 'Xe khách', 'Limousine'];
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
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;

  if (remainMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainMinutes}m`;
}

function getVehicleIcon(type: VehicleType) {
  if (type === 'Máy bay') return Plane;
  if (type === 'Tàu hỏa') return Train;
  if (type === 'Xe khách') return Bus;
  return Car;
}

function getAmenityIcon(amenity: string) {
  if (amenity.includes('WiFi')) return Wifi;
  if (amenity.includes('Bữa ăn')) return Utensils;
  if (amenity.includes('Hành lý')) return Briefcase;
  if (amenity.includes('Nước')) return Coffee;
  if (amenity.includes('Ghế') || amenity.includes('Giường')) return Armchair;
  return BadgeCheck;
}

export default function VehiclePage() {
  const { theme } = useTheme();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('15 Th05, 2024');
  const [passengers, setPassengers] = useState('1 người, phổ thông');
  const [selectedTypes, setSelectedTypes] = useState<VehicleType[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedTimeSlot>('');
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [sortMode, setSortMode] = useState<SortMode>('price');
  const [notice, setNotice] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((vehicle) => {
        const fromText = from.trim().toLowerCase();
        const toText = to.trim().toLowerCase();
        const matchesFrom = !fromText || vehicle.from.toLowerCase().includes(fromText) || vehicle.fromCode.toLowerCase().includes(fromText);
        const matchesTo = !toText || vehicle.to.toLowerCase().includes(toText) || vehicle.toCode.toLowerCase().includes(toText);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(vehicle.type);
        const matchesSlot = !selectedSlot || vehicle.slot === selectedSlot;
        const matchesPrice = vehicle.price <= maxPrice;

        return matchesFrom && matchesTo && matchesType && matchesSlot && matchesPrice;
      })
      .sort((first, second) => {
        if (sortMode === 'duration') return first.duration - second.duration;
        if (sortMode === 'departure') return first.departure.localeCompare(second.departure);
        return first.price - second.price;
      });
  }, [from, maxPrice, selectedSlot, selectedTypes, sortMode, to]);

  const toggleVehicleType = (type: VehicleType) => {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
  };

  const handleSearch = () => {
    setNotice(`Đang tìm chuyến ${from || 'mọi điểm đi'} đến ${to || 'mọi điểm đến'} vào ${date} cho ${passengers}.`);
  };

  const selectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setNotice(`Đã chọn vé ${vehicle.provider} từ ${vehicle.from} đến ${vehicle.to}.`);
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedSlot('');
    setMaxPrice(5000000);
    setSortMode('price');
    setNotice('Đã đặt lại bộ lọc phương tiện.');
  };

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${
      theme === 'dark' ? 'dark text-white' : 'text-slate-900'
    }`}>
      <Header />

      <main className="flex-1">
        <section className="bg-blue-800 dark:bg-blue-950 px-4 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-8">Tìm kiếm hành trình hoàn hảo</h1>

            <div className="rounded-xl bg-white dark:bg-slate-900 p-5 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_0.8fr_0.9fr_auto] gap-4">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Điểm khởi hành
                  <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-3">
                    <MapPin className="size-5 text-slate-500" />
                    <input
                      value={from}
                      onChange={(event) => setFrom(event.target.value)}
                      placeholder="Ví dụ: Hà Nội"
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-slate-100"
                    />
                  </span>
                </label>

                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Điểm đến
                  <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-3">
                    <Plane className="size-5 text-slate-500" />
                    <input
                      value={to}
                      onChange={(event) => setTo(event.target.value)}
                      placeholder="Ví dụ: Hồ Chí Minh"
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-slate-100"
                    />
                  </span>
                </label>

                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Ngày đi
                  <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-3">
                    <CalendarDays className="size-5 text-slate-500" />
                    <input
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-slate-100"
                    />
                  </span>
                </label>

                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Hạng ghế / khách
                  <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-3">
                    <Users className="size-5 text-slate-500" />
                    <input
                      value={passengers}
                      onChange={(event) => setPassengers(event.target.value)}
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-slate-100"
                    />
                  </span>
                </label>

                <button
                  onClick={handleSearch}
                  className="md:self-end inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-7 py-3.5 text-sm font-black text-white hover:bg-orange-600 transition-colors"
                >
                  <Search className="size-5" />
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          {notice && (
            <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              {notice}
            </div>
          )}

          {selectedVehicle && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-white p-5 shadow-md dark:border-blue-900 dark:bg-slate-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">
                        Vé đang chọn
                      </p>
                      <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                        {selectedVehicle.provider} - {selectedVehicle.code}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedVehicle(null)}
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
                      aria-label="Hủy chọn vé"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                    <span>
                      Tuyến: {selectedVehicle.from} → {selectedVehicle.to}
                    </span>
                    <span>
                      Giờ: {selectedVehicle.departure} - {selectedVehicle.arrival}
                    </span>
                    <span>
                      Ngày đi: {date}
                    </span>
                    <span>
                      Khách: {passengers}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                  <p className="text-2xl font-black text-orange-700 dark:text-orange-400">
                    {formatVnd(selectedVehicle.price)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNotice(`Đang chuyển sang thanh toán vé ${selectedVehicle.provider}.`)}
                      className="rounded-lg bg-blue-800 px-5 py-3 text-sm font-black text-white hover:bg-blue-900"
                    >
                      Tiếp tục thanh toán
                    </button>
                    <button
                      onClick={() => setSelectedVehicle(null)}
                      className="hidden rounded-lg border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex"
                      aria-label="Hủy chọn vé"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <aside className="space-y-8">
              <div className="flex items-center gap-3">
                <Filter className="size-5 text-blue-700 dark:text-blue-300" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Bộ lọc</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="mb-4 text-sm font-black text-slate-800 dark:text-slate-100">Loại phương tiện</p>
                  <div className="space-y-3">
                    {vehicleTypes.map((type) => {
                      const Icon = getVehicleIcon(type);

                      return (
                        <label key={type} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type)}
                            onChange={() => toggleVehicleType(type)}
                            className="size-4 accent-blue-700"
                          />
                          <Icon className="size-5 text-slate-600 dark:text-slate-300" />
                          {type}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-4 text-sm font-black text-slate-800 dark:text-slate-100">Khoảng giá (VNĐ)</p>
                  <input
                    type="range"
                    min={300000}
                    max={10000000}
                    step={100000}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                    className="w-full accent-blue-700"
                  />
                  <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
                    <span>300.000đ</span>
                    <span>{formatVnd(maxPrice)}</span>
                  </div>
                </div>

                <div>
                  <p className="mb-4 text-sm font-black text-slate-800 dark:text-slate-100">Giờ khởi hành</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedSlot('')}
                      className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                        selectedSlot === ''
                          ? 'border-blue-700 bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200'
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
                            ? 'border-blue-700 bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200'
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
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-slate-900 dark:text-blue-300"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </aside>

            <div>
              <div className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Hiển thị <span className="font-black text-slate-900 dark:text-white">{filteredVehicles.length}</span> kết quả tìm kiếm
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500">Sắp xếp:</span>
                  <button
                    onClick={() => setSortMode(sortMode === 'price' ? 'duration' : sortMode === 'duration' ? 'departure' : 'price')}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-black text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                  >
                    {sortMode === 'price' && 'Giá thấp nhất'}
                    {sortMode === 'duration' && 'Nhanh nhất'}
                    {sortMode === 'departure' && 'Khởi hành sớm'}
                    <ChevronDown className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {filteredVehicles.length === 0 ? (
                  <div className="rounded-xl bg-white p-10 text-center font-black text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                    Không có phương tiện phù hợp với bộ lọc hiện tại.
                  </div>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    const Icon = getVehicleIcon(vehicle.type);

                    return (
                      <article
                        key={vehicle.id}
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_230px]">
                          <div>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1.2fr_1.6fr]">
                              <div className="flex items-center gap-4">
                                <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                                  <Icon className="size-6" />
                                </div>
                                <div>
                                  <h3 className="font-black text-slate-900 dark:text-white">{vehicle.provider}</h3>
                                  <p className="text-xs font-bold text-slate-500">{vehicle.code}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                                <div>
                                  <p className="text-2xl font-black text-slate-950 dark:text-white">{vehicle.departure}</p>
                                  <p className="text-xs font-bold text-slate-500">{vehicle.fromCode}</p>
                                </div>
                                <div className="min-w-32 text-center">
                                  <p className="text-xs font-bold text-slate-400">{formatDuration(vehicle.duration)}</p>
                                  <div className="my-1 flex items-center gap-2">
                                    <span className="size-1.5 rounded-full border border-blue-500" />
                                    <span className="h-px flex-1 bg-slate-300" />
                                    <Icon className="size-4 text-blue-700" />
                                    <span className="h-px flex-1 bg-slate-300" />
                                    <span className="size-1.5 rounded-full bg-blue-700" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500">{vehicle.stop}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-black text-slate-950 dark:text-white">{vehicle.arrival}</p>
                                  <p className="text-xs font-bold text-slate-500">{vehicle.toCode}</p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                              <div className="flex flex-wrap gap-4">
                                {vehicle.amenities.map((amenity) => {
                                  const AmenityIcon = getAmenityIcon(amenity);

                                  return (
                                    <span key={amenity} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                      <AmenityIcon className="size-4" />
                                      {amenity}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between border-slate-200 md:border-l md:pl-8 dark:border-slate-800">
                            <div className="text-right">
                              {vehicle.oldPrice && (
                                <p className="text-xs font-bold text-slate-400 line-through">{formatVnd(vehicle.oldPrice)}</p>
                              )}
                              <p className="text-2xl font-black text-orange-700 dark:text-orange-400">{formatVnd(vehicle.price)}</p>
                            </div>

                            <button
                              onClick={() => setNotice(`Bạn đã chọn vé ${vehicle.provider} từ ${vehicle.from} đến ${vehicle.to}.`)}
                              className="mt-5 rounded-lg bg-blue-800 px-8 py-3 text-sm font-black text-white shadow-md hover:bg-blue-900"
                            >
                              Chọn vé
                            </button>

                            <span className="mt-5 rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-cyan-950 dark:text-cyan-200">
                              {vehicle.tag}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}

                <div className="rounded-xl bg-gradient-to-r from-slate-950 to-blue-950 p-8 text-white shadow-lg">
                  <div className="max-w-xl">
                    <h2 className="text-2xl font-black">Thẻ thành viên Elite Voyager</h2>
                    <p className="mt-3 text-sm font-medium text-slate-200">
                      Đăng ký ngay để nhận ưu đãi hoàn tiền tới 15% cho mọi chuyến đi và quyền truy cập phòng chờ thương gia.
                    </p>
                    <button
                      onClick={() => setNotice('Bạn đã đăng ký nhận thông tin thẻ thành viên Elite Voyager.')}
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
