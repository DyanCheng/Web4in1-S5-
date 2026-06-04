"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout, AuthCard, AuthInput, HeroSection, AuthFooter } from '@/components/AuthLayout';

const roles = [
  { id: 'user', label: 'Khách hàng' },
  { id: 'hotel_owner', label: 'Khách sạn' },
  { id: 'admin', label: 'Admin' },
] as const;

type Role = (typeof roles)[number]['id'];

const rolePaths: Record<Role, string> = {
  admin: '/admin',
  hotel_owner: '/hotel-owner',
  user: '/',
};

const inputClass =
  'w-full pl-12 pr-4 py-2 sm:py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-855 dark:text-slate-100 font-bold text-sm transition-all';

function RoleButton({ id, label, active, onClick }: { id: Role; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
        active
          ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-md'
          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );
}


export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, role);
      router.push(rolePaths[role]);
    } catch {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const heroContent = (
    <HeroSection
      imageUrl="/images/login-banner.jpg"
      title="Bắt đầu hành trình tinh hoa của bạn."
      description="Khám phá những điểm đến độc quyền và trải nghiệm dịch vụ nghỉ dưỡng đẳng cấp được cá nhân hóa cho riêng bạn."
      stats={[
        { label: 'Đối tác khách sạn', value: '500+' },
        { label: 'Điểm đến toàn cầu', value: '120+' },
      ]}
    />
  );

  return (
    <AuthLayout heroContent={heroContent} showHero>
      <AuthCard
        title="Chào mừng bạn trở lại"
        subtitle="Vui lòng nhập thông tin để truy cập tài khoản của bạn."
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Role Selection */}
          <div className="text-left mb-4 sm:mb-5">
            <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-550 mb-2">
              Đăng nhập với tư cách
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((item) => (
                <RoleButton
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  active={role === item.id}
                  onClick={() => setRole(item.id)}
                />
              ))}
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="text-left p-3 sm:p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-105/10 rounded-2xl text-xxs font-bold text-blue-900 dark:text-blue-400 space-y-1">
            <p className="uppercase tracking-wider font-black mb-1">Tài khoản trải nghiệm:</p>
            <p className="text-xs">• Admin: admin@travelhub.com / admin123</p>
            <p className="text-xs">• Đối tác: hotel@travelhub.com / hotel123</p>
            <p className="text-xs">• Khách: nhập bất kỳ email và mật khẩu</p>
          </div>

          {/* Email Input */}
          <AuthInput label="Địa chỉ Email">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((curr) => !curr)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655"
              >
                {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
              </button>
            </div>
          </AuthInput>

          {/* Error Message */}
          {error && (
            <div className="p-3 sm:p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-left text-xs font-semibold text-red-600">
              <p>{error}</p>
            </div>
          )}

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <a href="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-all disabled:bg-slate-400 dark:disabled:bg-slate-800 font-bold text-sm cursor-pointer shadow-md"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <AuthFooter
          question="Chưa có tài khoản?"
          linkText="Đăng ký ngay"
          linkHref="/register"
        />
      </AuthCard>
    </AuthLayout>
  );
}
