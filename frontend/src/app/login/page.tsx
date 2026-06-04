"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

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
  'w-full pl-12 pr-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-855 dark:text-slate-100 font-bold text-sm transition-all';

function Section({ children }: { children: React.ReactNode }) {
  return <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-100/40 dark:border-slate-800/40">{children}</div>;
}

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-left">
      <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-550 mb-2">{label}</label>
      {children}
    </div>
  );
}

function RoleButton({ id, label, active, onClick }: { id: Role; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 rounded-xl text-xxs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
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
  const { theme, toggleTheme } = useTheme();
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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6 font-sans transition-colors duration-300 ${
        theme === 'dark' ? 'dark text-white' : 'text-slate-900'
      }`}>
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="size-5 text-yellow-400" /> : <Moon className="size-5" />}
        </button>
      </div>
      <div className="w-full max-w-7xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-2">
        {/* Left: Hero image */}
        <div className="hidden lg:block relative min-h-[680px]">
          <img src="/images/login-banner.jpg" alt="Travel" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
            <div>
              <span className="text-lg font-semibold opacity-80">Voyager Elite</span>
            </div>

            <div>
              <h1 className="text-5xl font-black leading-tight mb-4">Bắt đầu hành trình
                <br />tinh hoa của bạn.</h1>
              <p className="max-w-md opacity-90">Khám phá những điểm đến độc quyền và trải nghiệm dịch vụ nghỉ dưỡng đẳng cấp được cá nhân hóa cho riêng bạn.</p>
            </div>

            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-black">500+</div>
                <div className="text-sm">Đối tác khách sạn</div>
              </div>
              <div>
                <div className="text-3xl font-black">120+</div>
                <div className="text-sm">Điểm đến toàn cầu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Auth card */}
        <Section>
          <div className="mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-2xl font-black">Chào mừng bạn trở lại</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Vui lòng nhập thông tin để truy cập tài khoản của bạn.</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                <button className={`px-3 py-1 rounded-full text-sm font-semibold ${'bg-white dark:bg-slate-900'}`}>Đăng nhập</button>
                <button className="px-3 py-1 rounded-full text-sm text-slate-500">Đăng ký</button>
              </div>
            </div>
            <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-550 mb-2">Đăng nhập với tư cách</label>
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

          <div className="mb-6 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-105/10 rounded-2xl text-left text-xxs font-bold text-blue-900 dark:text-blue-400 space-y-1">
            <p className="uppercase tracking-wider font-black mb-1">Tài khoản trải nghiệm:</p>
            <p>• Admin: admin@travelhub.com / admin123</p>
            <p>• Đối tác: hotel@travelhub.com / hotel123</p>
            <p>• Khách: nhập bất kỳ email và mật khẩu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputRow label="Địa chỉ Email">
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
            </InputRow>

            <InputRow label="Mật khẩu">
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
            </InputRow>

            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-left text-xs font-semibold text-red-600">
                <p>{error}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-all disabled:bg-slate-400 dark:disabled:bg-slate-800 font-bold text-sm cursor-pointer shadow-md"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-455 font-bold">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold ml-1">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-slate-400 dark:text-slate-500 hover:underline font-bold">
              ← Quay lại trang chủ
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}
