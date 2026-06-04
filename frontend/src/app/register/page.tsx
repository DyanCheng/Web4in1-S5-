"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { AuthLayout, AuthCard, AuthInput, AuthFooter } from '@/components/AuthLayout';

const inputClass =
  'w-full pl-12 pr-4 py-2 sm:py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-855 dark:text-slate-100 font-bold text-sm transition-all';

export default function RegisterPage() {
  const router = useRouter();
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
      router.push('/');
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout showHero={false}>
      <AuthCard
        title="Tạo tài khoản mới"
        subtitle="Đăng ký để khám phá những trải nghiệm thượng lưu"
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Name Input */}
          <AuthInput label="Họ và tên">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
          </AuthInput>

          {/* Email Input */}
          <AuthInput label="Địa chỉ Email">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder="your@email.com"
                required
              />
            </div>
          </AuthInput>

          {/* Password Input */}
          <AuthInput label="Mật khẩu">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`${inputClass} pr-12`}
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
          </AuthInput>

          {/* Confirm Password Input */}
          <AuthInput label="Xác nhận mật khẩu">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </div>
          </AuthInput>

          {/* Error Message */}
          {error && (
            <div className="p-3 sm:p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-left text-xs font-semibold text-red-600">
              <p>{error}</p>
            </div>
          )}

          {/* Terms */}
          <div className="flex items-start gap-2.5 text-left pt-1">
            <input type="checkbox" id="terms" className="mt-1" required />
            <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-455 font-bold leading-normal">
              Tôi đồng ý với{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Điều khoản dịch vụ
              </a>
              {' '}và{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Chính sách bảo mật
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-all disabled:bg-slate-400 dark:disabled:bg-slate-800 font-bold text-sm cursor-pointer shadow-md"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <AuthFooter
          question="Đã có tài khoản?"
          linkText="Đăng nhập ngay"
          linkHref="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}
