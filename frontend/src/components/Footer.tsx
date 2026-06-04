"use client";

import { useRouter } from 'next/navigation';
import { Globe, Share2 } from 'lucide-react';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900 text-slate-600 dark:text-slate-455 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12 text-left">
          
          {/* Col 1 Brand Description */}
          <div className="md:col-span-5">
            <span className="text-2xl font-black text-blue-900 dark:text-blue-400 font-serif italic tracking-wide">
              Travel Booking
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-5 leading-relaxed max-w-sm font-semibold">
              Kiến tạo những hành trình di sản và trải nghiệm du lịch cá nhân hóa hàng đầu tại Việt Nam.
            </p>
            
            {/* Round Social Buttons */}
            <div className="flex gap-3 mt-6">
              <button className="size-9 bg-white hover:bg-slate-55 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center transition-all cursor-pointer text-slate-600 dark:text-slate-300 shadow-sm hover:shadow">
                <Globe className="size-4.5" />
              </button>
              <button className="size-9 bg-white hover:bg-slate-55 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center transition-all cursor-pointer text-slate-600 dark:text-slate-300 shadow-sm hover:shadow">
                <Share2 className="size-4.5" />
              </button>
            </div>
          </div>

          {/* Col 2 Company links */}
          <div className="md:col-span-2 md:col-start-7">
            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-5">Về chúng tôi</h3>
            <ul className="space-y-3 text-sm font-bold text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Câu chuyện thương hiệu</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Đội ngũ chuyên gia</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tin tức du lịch</a></li>
            </ul>
          </div>

          {/* Col 3 Services links */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-5">Dịch vụ</h3>
            <ul className="space-y-3 text-sm font-bold text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tour cao cấp</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Khách sạn & Resort</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Bảo hiểm du lịch</a></li>
            </ul>
          </div>

          {/* Col 4 Support links */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest mb-5">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm font-bold text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Trung tâm hỗ trợ</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Quy định chung</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Liên hệ</a></li>
            </ul>
          </div>

        </div>

        {/* Copyright row */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-900/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500">
          <p>&copy; 2026 Travel Booking. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
