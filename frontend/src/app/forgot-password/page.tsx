"use client";

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { AuthLayout, AuthCard, AuthInput, AuthFooter } from '@/components/AuthLayout';

const inputClass =
  'w-full pl-12 pr-4 py-2 sm:py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-855 dark:text-slate-100 font-bold text-sm transition-all';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <AuthLayout showHero={false}>
      {submitted ? (
        <AuthCard
          title="Kiểm tra Email"
          subtitle=""
        >
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 bg-green-50 dark:bg-green-950/40 rounded-full mx-auto">
              <CheckCircle className="size-7 sm:size-8 text-emerald-500" />
            </div>

            <div>
              <p className="text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 text-sm font-semibold">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{' '}
                <strong className="font-extrabold text-slate-700 dark:text-slate-300">{email}</strong>
              </p>

              <p className="text-xs text-slate-400 dark:text-slate-550 font-medium">
                Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam) trong vài phút tới để tiến hành đặt lại mật khẩu của bạn.
              </p>
            </div>

            <a
              href="/login"
              className="inline-block w-full py-2.5 sm:py-3.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-all font-bold text-sm shadow-md"
            >
              Quay lại đăng nhập
            </a>
          </div>
        </AuthCard>
      ) : (
        <AuthCard
          title="Khôi phục mật khẩu"
          subtitle="Nhập địa chỉ email để nhận liên kết khôi phục"
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <AuthInput label="Địa chỉ Email của bạn">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-all disabled:bg-slate-400 dark:disabled:bg-slate-800 font-bold text-sm cursor-pointer shadow-md"
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">
              ← Quay lại đăng nhập
            </a>
          </div>
        </AuthCard>
      )}
    </AuthLayout>
  );
}
