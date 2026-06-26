"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Shield, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Phone, 
  FileText, 
  Heart, 
  Plane, 
  Globe, 
  Car, 
  AlertCircle, 
  CreditCard,
  Check,
  Zap,
  LifeBuoy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

const domesticPlans = [
  {
    id: 'ins-dom-1',
    name: 'Essential',
    subtitle: 'Bảo vệ thiết yếu cho chuyến đi ngắn',
    price: 150000,
    duration: 'Tối đa 7 ngày',
    color: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
    textColor: 'text-slate-900 dark:text-white',
    badge: '',
    buttonStyle: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200',
    features: [
      { label: 'Tai nạn cá nhân', value: '200 triệu VNĐ', included: true },
      { label: 'Chi phí y tế', value: '50 triệu VNĐ', included: true },
      { label: 'Hủy/Hoãn chuyến', value: 'Không', included: false },
      { label: 'Hành lý thất lạc', value: 'Không', included: false },
      { label: 'Hỗ trợ y tế 24/7', value: 'Tiêu chuẩn', included: true },
    ],
  },
  {
    id: 'ins-dom-2',
    name: 'Comprehensive',
    subtitle: 'Lựa chọn cân bằng cho mọi hành trình',
    price: 350000,
    duration: 'Tối đa 14 ngày',
    color: 'from-blue-600 to-indigo-800',
    textColor: 'text-white',
    badge: 'Được ưa chuộng nhất',
    buttonStyle: 'bg-white text-blue-700 hover:bg-blue-50',
    features: [
      { label: 'Tai nạn cá nhân', value: '500 triệu VNĐ', included: true },
      { label: 'Chi phí y tế', value: '150 triệu VNĐ', included: true },
      { label: 'Hủy/Hoãn chuyến', value: '10 triệu VNĐ', included: true },
      { label: 'Hành lý thất lạc', value: '5 triệu VNĐ', included: true },
      { label: 'Hỗ trợ y tế 24/7', value: 'Ưu tiên', included: true },
    ],
  },
  {
    id: 'ins-dom-3',
    name: 'Signature',
    subtitle: 'Trải nghiệm đẳng cấp, bảo vệ tối đa',
    price: 750000,
    duration: 'Tối đa 30 ngày',
    color: 'from-amber-300 via-amber-500 to-amber-700',
    textColor: 'text-slate-900',
    badge: 'Bảo vệ toàn diện',
    buttonStyle: 'bg-slate-900 text-amber-400 hover:bg-slate-800',
    features: [
      { label: 'Tai nạn cá nhân', value: '1 tỷ VNĐ', included: true },
      { label: 'Chi phí y tế', value: '500 triệu VNĐ', included: true },
      { label: 'Hủy/Hoãn chuyến', value: '30 triệu VNĐ', included: true },
      { label: 'Hành lý thất lạc', value: '20 triệu VNĐ', included: true },
      { label: 'Hỗ trợ y tế 24/7', value: 'VIP Concierge', included: true },
    ],
  },
];

const internationalPlans = [
  {
    id: 'ins-int-1',
    name: 'Global Essential',
    subtitle: 'Bảo vệ cơ bản cho chuyến bay quốc tế',
    price: 450000,
    duration: 'Tối đa 14 ngày',
    color: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
    textColor: 'text-slate-900 dark:text-white',
    badge: '',
    buttonStyle: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200',
    features: [
      { label: 'Tai nạn cá nhân', value: '1 tỷ VNĐ', included: true },
      { label: 'Chi phí y tế', value: '500 triệu VNĐ', included: true },
      { label: 'Hủy/Hoãn chuyến', value: '20 triệu VNĐ', included: true },
      { label: 'Hành lý thất lạc', value: '10 triệu VNĐ', included: true },
      { label: 'Mất hộ chiếu', value: 'Không', included: false },
    ],
  },
  {
    id: 'ins-int-2',
    name: 'Global Comprehensive',
    subtitle: 'Bảo vệ tiêu chuẩn toàn cầu',
    price: 850000,
    duration: 'Tối đa 30 ngày',
    color: 'from-blue-600 to-indigo-800',
    textColor: 'text-white',
    badge: 'Được ưa chuộng nhất',
    buttonStyle: 'bg-white text-blue-700 hover:bg-blue-50',
    features: [
      { label: 'Tai nạn cá nhân', value: '2 tỷ VNĐ', included: true },
      { label: 'Chi phí y tế', value: '1.5 tỷ VNĐ', included: true },
      { label: 'Hủy/Hoãn chuyến', value: '50 triệu VNĐ', included: true },
      { label: 'Hành lý thất lạc', value: '20 triệu VNĐ', included: true },
      { label: 'Mất hộ chiếu', value: '10 triệu VNĐ', included: true },
    ],
  },
  {
    id: 'ins-int-3',
    name: 'Global Signature',
    subtitle: 'Đẳng cấp vượt trội mọi châu lục',
    price: 1500000,
    duration: 'Tối đa 45 ngày',
    color: 'from-amber-300 via-amber-500 to-amber-700',
    textColor: 'text-slate-900',
    badge: 'Bảo vệ toàn cầu',
    buttonStyle: 'bg-slate-900 text-amber-400 hover:bg-slate-800',
    features: [
      { label: 'Tai nạn cá nhân', value: '5 tỷ VNĐ', included: true },
      { label: 'Chi phí y tế', value: '3 tỷ VNĐ', included: true },
      { label: 'Hủy/Hoãn chuyến', value: '100 triệu VNĐ', included: true },
      { label: 'Hành lý thất lạc', value: '50 triệu VNĐ', included: true },
      { label: 'Chi phí hồi hương', value: 'Không giới hạn', included: true },
    ],
  },
];

const partners = ['Bảo Việt', 'PVI', 'Chubb', 'Liberty', 'AIG', 'Generali'];

const benefits = [
  { icon: Zap, title: 'Bồi thường siêu tốc', desc: 'Quy trình bồi thường 100% online, giải quyết nhanh chóng trong vòng 48h làm việc.' },
  { icon: Globe, title: 'Mạng lưới toàn cầu', desc: 'Hỗ trợ thanh toán trực tiếp tại hơn 2,000 bệnh viện và phòng khám trên thế giới.' },
  { icon: LifeBuoy, title: 'Chăm sóc tận tâm', desc: 'Đội ngũ y bác sĩ trực tổng đài 24/7 bằng tiếng Việt và tiếng Anh, luôn sẵn sàng.' },
  { icon: Plane, title: 'An tâm bay lượn', desc: 'Bảo hiểm cho các trường hợp delay, hủy chuyến do thời tiết hoặc lỗi hãng hàng không.' },
];

export default function InsurancePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const [selected, setSelected] = useState<string | null>('ins-dom-2');
  const [tripType, setTripType] = useState<'domestic' | 'international'>('domestic');

  const currentPlans = tripType === 'domestic' ? domesticPlans : internationalPlans;
  const selectedPlan = currentPlans.find(p => p.id === selected);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex flex-col ${theme === 'dark' ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
      <Header />

      {/* ── Premium Hero Section ── */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80" 
            alt="Travel Insurance Premium Background" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/95 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950/95" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6">
            <Shield className="size-3.5 text-amber-400" /> Đặc quyền bảo vệ
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6 drop-shadow-xl">
            Du Lịch Thượng Lưu <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              An Tâm Tuyệt Đối
            </span>
          </h1>
          <p className="mt-4 text-white/80 text-lg sm:text-xl font-medium max-w-2xl mx-auto drop-shadow-md mb-10">
            Trải nghiệm các chuyến đi với sự tự tin hoàn toàn. Kế hoạch bảo hiểm toàn diện của chúng tôi bảo vệ bạn từ những rủi ro nhỏ nhất đến các tình huống khẩn cấp toàn cầu.
          </p>

          {/* Trusted Partners */}
          <div className="pt-8 border-t border-white/10 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest font-bold text-white/50 mb-6">Được tin dùng bởi các đối tác hàng đầu</p>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-70 grayscale contrast-200">
              {partners.map(partner => (
                <span key={partner} className="text-lg sm:text-xl font-black text-white tracking-wider">
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits Section ── */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:-translate-y-1 transition-transform duration-300">
              <div className="size-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing Plans ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Thiết Kế Dành Riêng Cho Bạn</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Lựa chọn gói bảo vệ phù hợp với phong cách du lịch của bạn. Chúng tôi cam kết mang lại giá trị cao nhất trên từng chuyến đi.
          </p>
          <div className="inline-flex bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full p-1.5 gap-1">
            {(['domestic', 'international'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTripType(t);
                  setSelected(t === 'domestic' ? 'ins-dom-2' : 'ins-int-2');
                }}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  tripType === t
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {t === 'domestic' ? 'Nội địa' : 'Quốc tế'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {currentPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`relative rounded-[2rem] transition-all duration-500 cursor-pointer overflow-hidden group ${
                selected === plan.id
                  ? 'scale-105 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] z-10'
                  : 'scale-100 shadow-xl opacity-90 hover:opacity-100 hover:scale-[1.02] z-0'
              }`}
            >
              {/* Premium Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-100 transition-opacity duration-300`} />
              
              {/* Content Container */}
              <div className={`relative z-10 p-8 sm:p-10 flex flex-col h-full ${plan.textColor}`}>
                {plan.badge ? (
                  <div className="mb-6 flex justify-between items-start">
                    <span className="inline-flex items-center px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                      {plan.badge}
                    </span>
                    {selected === plan.id && <CheckCircle2 className="size-6 text-white" />}
                  </div>
                ) : (
                  <div className="mb-6 h-6 flex justify-end">
                    {selected === plan.id && <CheckCircle2 className={`size-6 ${plan.id === 'ins1' ? 'text-slate-600 dark:text-slate-300' : 'text-white'}`} />}
                  </div>
                )}
                
                <h3 className="text-3xl font-black mb-2">{plan.name}</h3>
                <p className="opacity-80 text-sm font-medium mb-8 h-10">{plan.subtitle}</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-black tracking-tight">{plan.price.toLocaleString('vi-VN')}</span>
                  <span className="opacity-80 text-sm font-bold"> đ</span>
                  <p className="opacity-60 text-xs mt-1 uppercase tracking-wider font-bold">{plan.duration}</p>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature.label} className={`flex items-center gap-3 ${!feature.included ? 'opacity-40' : ''}`}>
                      <div className={`size-5 rounded-full flex items-center justify-center shrink-0 ${feature.included ? 'bg-black/10 dark:bg-white/10' : 'border border-current'}`}>
                        {feature.included ? <Check className="size-3" /> : <span className="size-1 rounded-full bg-current" />}
                      </div>
                      <span className="text-sm font-semibold flex-1">{feature.label}</span>
                      <span className="text-sm font-black text-right">{feature.value}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selected !== plan.id) {
                      setSelected(plan.id);
                      return;
                    }
                    addToCart({
                      tourId: plan.id,
                      title: `Bảo hiểm cao cấp: ${plan.name}`,
                      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
                      price: plan.price,
                      quantity: 1,
                      date: new Date().toISOString().split('T')[0],
                      guests: 1,
                    });
                    router.push('/checkout');
                  }}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 ${plan.buttonStyle} ${selected === plan.id ? 'shadow-lg shadow-black/20' : ''}`}
                >
                  {selected === plan.id ? (
                    <>
                      <CreditCard className="size-4" /> Thanh toán ngay
                    </>
                  ) : (
                    'Chọn gói này'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA / Concierge Section ── */}
        <div className="mt-24 relative rounded-[2.5rem] overflow-hidden bg-slate-900 text-white shadow-2xl">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1556745753-b2904692b3cd?auto=format&fit=crop&w=1200&q=80" 
              alt="Concierge Service" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
          </div>
          
          <div className="relative z-10 p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-500/30">
                <Star className="size-3" /> VIP Concierge
              </span>
              <h3 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">Cần hỗ trợ thiết kế gói bảo hiểm riêng?</h3>
              <p className="text-slate-300 font-medium text-lg mb-8">
                Đội ngũ cố vấn tinh hoa của chúng tôi luôn sẵn sàng lắng nghe và xây dựng kế hoạch bảo vệ độc quyền cho hành trình của bạn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-colors shadow-xl">
                  <Phone className="size-4" />
                  1800-PREMIUM
                </button>
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-colors backdrop-blur-sm border border-white/20">
                  <FileText className="size-4" />
                  Yêu cầu tư vấn
                </button>
              </div>
            </div>
            
            <div className="hidden lg:flex shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-30 rounded-full" />
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80" 
                  alt="Advisor" 
                  className="relative z-10 w-48 h-48 object-cover rounded-full border-4 border-slate-800 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
