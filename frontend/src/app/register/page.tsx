"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Plane, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { register } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="size-10 text-blue-600" />
            <span className="text-3xl text-gray-900 font-bold">TravelHub</span>
          </div>
          <h1 className="text-2xl text-gray-900 mb-2 font-bold">Tạo tài khoản mới</h1>
          <p className="text-gray-600">Đăng ký để khám phá thế giới</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="text-left">
              <label className="block text-sm text-gray-700 mb-2 font-medium">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="text-left">
              <label className="block text-sm text-gray-700 mb-2 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="text-left">
              <label className="block text-sm text-gray-700 mb-2 font-medium">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="text-left">
              <label className="block text-sm text-gray-700 mb-2 font-medium">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-2 text-left">
              <input type="checkbox" id="terms" className="mt-1" required />
              <label htmlFor="terms" className="text-sm text-gray-600 font-medium">
                Tôi đồng ý với{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Điều khoản dịch vụ</a>
                {' '}và{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Chính sách bảo mật</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium cursor-pointer"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Đăng nhập
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
