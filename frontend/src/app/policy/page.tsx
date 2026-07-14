"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import {
  FileText,
  CreditCard,
  RotateCcw,
  Shield,
  AlertCircle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type PolicySection = {
  id: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  points: string[];
};

const policySections: PolicySection[] = [
  {
    id: 'terms',
    title: 'Điều khoản sử dụng',
    summary: 'Khi sử dụng dịch vụ, bạn đồng ý tuân thủ quy định vận hành chung.',
    icon: FileText,
    points: [
      'Tài khoản chỉ được sử dụng bởi cá nhân đăng ký, không chia sẻ thông tin đăng nhập cho bên thứ ba.',
      'Mọi hành vi gian lận, lạm dụng hệ thống hoặc tấn công dịch vụ đều có thể dẫn tới khóa tài khoản vĩnh viễn mà không cần báo trước.',
      'Người dùng tự chịu trách nhiệm về tài khoản và cách sử dụng của bản thân; chúng tôi không chịu trách nhiệm với rủi ro phát sinh từ phía bạn.',
    ],
  },
  {
    id: 'payment',
    title: 'Thanh toán và nạp tiền',
    summary: 'Các giao dịch được ghi nhận thủ công hoặc tự động tùy kênh thanh toán.',
    icon: CreditCard,
    points: [
      'Chấp nhận chuyển khoản ngân hàng, ví điện tử và các cổng thanh toán phổ biến.',
      'Số dư được cập nhật sau khi hệ thống xác nhận giao dịch hợp lệ.',
      'Đơn vị tiền tệ mặc định là VND, các ngoại tệ được quy đổi theo tỷ giá tại thời điểm thực hiện.',
    ],
  },
  {
    id: 'refund',
    title: 'Hoàn tiền và đổi gói',
    summary: 'Chính sách hoàn tiền phụ thuộc vào trạng thái kích hoạt và thời gian sử dụng.',
    icon: RotateCcw,
    points: [
      'Gói chưa kích hoạt có thể yêu cầu đổi sang sản phẩm khác cùng giá trị.',
      'Gói đã sử dụng chỉ được hoàn tiền khi lỗi phát sinh từ phía hệ thống.',
      'Yêu cầu hỗ trợ cần gửi kèm mã giao dịch và thông tin tài khoản liên quan.',
    ],
  },
  {
    id: 'privacy',
    title: 'Bảo mật thông tin',
    summary: 'Dữ liệu người dùng được dùng để vận hành dịch vụ và hỗ trợ sau bán hàng.',
    icon: Shield,
    points: [
      'Thông tin tài khoản được mã hóa và lưu trữ trên hệ thống nội bộ, mật khẩu được hash một chiều.',
      'Không công khai email, thông tin thanh toán hoặc cấu hình cá nhân của khách hàng.',
      'Không chia sẻ, mua bán hay cung cấp dữ liệu người dùng cho bên thứ ba khi không có yêu cầu pháp lý.',
      'Chúng tôi cam kết sản phẩm không chứa mã độc, không đánh cắp thông tin và không sử dụng dữ liệu của bạn trái phép.',
    ],
  },
  {
    id: 'responsibility',
    title: 'Giới hạn trách nhiệm',
    summary:
      'Chúng tôi nỗ lực duy trì dịch vụ ổn định trong thời gian chạy nhưng không cam kết tuyệt đối về thời gian hoạt động.',
    icon: AlertCircle,
    points: [
      'Tất cả dịch vụ có thể tạm thời bảo trì; thời gian bảo trì sẽ được báo trước trên các kênh liên lạc chính thống.',
      'Chúng tôi không chịu trách nhiệm với thiệt hại gián tiếp phát sinh từ việc sử dụng hoặc không sử dụng dịch vụ.',
      'Trong mọi trường hợp, mức đền bù thiệt hại sẽ không vượt quá gói thuê có liên quan.',
    ],
  },
  {
    id: 'future-policy',
    title: 'Chính sách tương lai',
    summary: 'Chính sách có thể thay đổi trong tương lai tùy theo pháp luật hiện hành.',
    icon: Calendar,
    points: [
      'Mọi thay đổi sẽ được cập nhật trực tiếp trên trang này và có hiệu lực ngay sau khi đăng tải.',
      'Việc tiếp tục sử dụng dịch vụ sau khi chính sách thay đổi đồng nghĩa với việc bạn chấp nhận nội dung mới.',
    ],
  },
];

export default function PolicyPage() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${
        theme === 'dark' ? 'dark text-white' : 'text-slate-900'
      }`}
    >
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-slate-900 dark:text-white mb-3">
            Chính sách & Điều khoản
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm max-w-2xl mx-auto">
            Vui lòng đọc kỹ các quy định dưới đây trước khi sử dụng dịch vụ của CMC Travel.
          </p>
        </div>

        <div className="space-y-6">
          {policySections.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0 size-11 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center">
                    <Icon className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {section.title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
                      {section.summary}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 pl-1">
                  {section.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed"
                    >
                      <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
