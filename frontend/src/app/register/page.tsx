"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function RegisterPage() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.name);
      navigate('/');
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-955 dark:to-slate-900 flex items-center justify-center p-6 font-sans transition-colors duration-300 ${
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-3xl font-black text-blue-900 dark:text-blue-400 font-serif italic tracking-wide">
              VoyagerElite
            </span>
          </div>
          <h1 className="text-2xl text-slate-900 dark:text-white mb-2 font-serif font-black">Tạo tài khoản mới</h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Đăng ký để khám phá những trải nghiệm thượng lưu</p>
        </div>

        {/* Register Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-100/40 dark:border-slate-800/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name */}
            <div className="text-left">
              <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-550 mb-2">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-855 dark:text-slate-100 font-bold text-sm transition-all"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="text-left">
              <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-550 mb-2">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-855 dark:text-slate-100 font-bold text-sm transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="text-left">
              <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-855 dark:text-slate-100 font-bold text-sm transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655"
                >
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="text-left">
              <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-855 dark:text-slate-100 font-bold text-sm transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-left text-xs font-semibold text-red-655">
                <p>{error}</p>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-2.5 text-left pt-1">
              <input type="checkbox" id="terms" className="mt-1" required />
              <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-455 font-bold leading-normal">
                Tôi đồng ý với{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Điều khoản dịch vụ</a>
                {' '}và{' '}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Chính sách bảo mật</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-all disabled:bg-slate-400 dark:disabled:bg-slate-800 font-bold text-sm cursor-pointer shadow-md"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-455 font-bold">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold ml-1">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-slate-400 dark:text-slate-500 hover:underline font-bold">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
