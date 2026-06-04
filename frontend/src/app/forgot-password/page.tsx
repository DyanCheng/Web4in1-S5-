"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock sending reset email
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6 font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'dark text-white' : 'text-slate-900'
    }`}>
      
      {/* Dark mode switcher in the corner */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="size-5 text-yellow-400" /> : <Moon className="size-5" />}
        </button>
      </div>

      <div className="max-w-md w-full">
        {submitted ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 text-center border border-slate-100/40 dark:border-slate-800/40">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 dark:bg-green-950/40 rounded-full mb-4">
              <CheckCircle className="size-8 text-emerald-500" />
            </div>

            <h1 className="text-2xl font-black font-serif text-slate-900 dark:text-white mb-2">Kiểm tra Email</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-semibold">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong className="font-extrabold text-slate-700 dark:text-slate-300">{email}</strong>
            </p>

            <p className="text-xs text-slate-400 dark:text-slate-550 mb-8 font-medium">
              Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam) trong vài phút tới để tiến hành đặt lại mật khẩu của bạn.
            </p>

            <Link
              href="/login"
              className="inline-block w-full py-3.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-all font-bold text-sm shadow-md"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <div>
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-3xl font-black text-blue-900 dark:text-blue-400 font-serif italic tracking-wide">
                  VoyagerElite
                </span>
              </div>
              <h1 className="text-2xl text-slate-900 dark:text-white mb-2 font-serif font-black">Khôi phục mật khẩu</h1>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Nhập địa chỉ email để nhận liên kết khôi phục</p>
            </div>

            {/* Forgot Password Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-100/40 dark:border-slate-800/40">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-left">
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-550 mb-2">Địa chỉ Email của bạn</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-855 dark:text-slate-100 font-bold text-sm transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-all disabled:bg-slate-400 dark:disabled:bg-slate-800 font-bold text-sm cursor-pointer shadow-md"
                >
                  {loading ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
