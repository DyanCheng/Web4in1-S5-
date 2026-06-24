"use client";

import { Globe, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-300 py-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-black text-white mb-4">CMC Travel</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Nền tảng đặt tour du lịch hàng đầu Việt Nam. Chúng tôi mang đến cho bạn những trải nghiệm tuyệt vời nhất tại mọi điểm đến.
            </p>
            <div className="flex gap-3">
              <button className="size-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all text-white">
                <Globe className="size-4" />
              </button>
              <button className="size-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all text-white">
                <Share2 className="size-4" />
              </button>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider mb-5">Khám phá</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Vịnh Hạ Long</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Phú Quốc</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Đà Lạt</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Hội An</a></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider mb-5">Thông tin</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Về CMC Travel</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tin tức du lịch</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider mb-5">Đăng ký nhận tin</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="bg-slate-800 border-none text-white px-4 py-2 text-sm rounded-l focus:outline-none w-full"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-bold rounded-r transition-colors">
                Gửi
              </button>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; 2026 CMC Travel. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
