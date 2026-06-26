"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout, AuthCard, AuthInput, HeroSection, AuthFooter } from '@/components/AuthLayout';
import GoogleSignInButton from '@/components/GoogleSignInButton';

const inputClass =
  'w-full pl-12 pr-4 py-2 sm:py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-855 dark:text-slate-100 font-bold text-sm transition-all';

const DEMO_ACCOUNTS = [
] as { label: string; email: string; password: string }[];

function redirectByRole(role: string, router: ReturnType<typeof useRouter>) {
  if (role === 'admin') router.push('/admin');
  else if (role === 'hotel_owner') router.push('/hotel-owner');
  else if (role === 'employee') router.push('/employee');
  else if (role === 'accountant') router.push('/accountant');
  else router.push('/');
}


export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      const loggedInUser = await login(email, password);
      redirectByRole(loggedInUser?.role || 'user', router);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback(async (credential: string) => {
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await loginWithGoogle(credential);
      redirectByRole(loggedInUser?.role || 'user', router);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập Google thất bại.');
    } finally {
      setLoading(false);
    }
  }, [loginWithGoogle, router]);

  const heroContent = (
    <HeroSection
      imageUrl="https://motogo.vn/wp-content/uploads/2023/10/bien-Nha-Trang-4-1024x765.jpg"
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
          {mounted && (
            <div className="text-left p-3 sm:p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-105/10 rounded-2xl text-xxs font-bold text-blue-900 dark:text-blue-400 space-y-1">
              {DEMO_ACCOUNTS.map((account) => (
                <p key={account.email} className="text-xs">
                  • {account.label}: {account.email} / {account.password}
                </p>
              ))}
            </div>
          )}

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

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">hoặc</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={setError}
            disabled={loading}
          />
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
