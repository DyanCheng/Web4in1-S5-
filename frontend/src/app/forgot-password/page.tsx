"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Plane, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock sending reset email
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="size-8 text-green-600" />
            </div>

            <h1 className="text-2xl text-gray-900 mb-2 font-bold">Kiểm tra email của bạn</h1>
            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Nếu bạn không nhận được email trong vài phút, vui lòng kiểm tra thư mục spam.
            </p>

            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="size-10 text-blue-600" />
            <span className="text-3xl text-gray-900 font-bold">TravelHub</span>
          </div>
          <h1 className="text-2xl text-gray-900 mb-2 font-bold">Quên mật khẩu?</h1>
          <p className="text-gray-600">Nhập email để đặt lại mật khẩu</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <label className="block text-sm text-gray-700 mb-2 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium cursor-pointer"
            >
              {loading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
