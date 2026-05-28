import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plane, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, role);
      navigate(role === 'admin' ? '/admin' : role === 'hotel_owner' ? '/hotel-owner' : '/');
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
            <span className="text-3xl text-gray-900">TravelHub</span>
          </div>
          <h1 className="text-2xl text-gray-900 mb-2">Chào mừng trở lại!</h1>
          <p className="text-gray-600">Đăng nhập để tiếp tục</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-2">Đăng nhập với tư cách</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Khách hàng
              </button>
              <button
                type="button"
                onClick={() => setRole('hotel_owner')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  role === 'hotel_owner'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chủ khách sạn
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  role === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 mb-2">Tài khoản demo:</p>
            <p className="text-xs text-blue-700">Admin: admin@travelhub.com / admin123</p>
            <p className="text-xs text-blue-700">Chủ khách sạn: hotel@travelhub.com / hotel123</p>
            <p className="text-xs text-blue-700">Khách: bất kỳ email/mật khẩu nào</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
