import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Check, Plane, Tag } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart, discountCode, applyDiscount, discountAmount } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [discountInput, setDiscountInput] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleApplyDiscount = () => {
    const success = applyDiscount(discountInput);
    if (success) {
      setDiscountMessage('✓ Mã giảm giá đã được áp dụng!');
    } else {
      setDiscountMessage('✗ Mã giảm giá không hợp lệ');
    }
    setTimeout(() => setDiscountMessage(''), 3000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrderId = 'ORD-' + Date.now().toString();
    setOrderId(newOrderId);
    setOrderComplete(true);
    clearCart();
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <Check className="size-10 text-green-600" />
          </div>

          <h1 className="text-3xl text-gray-900 mb-4">Đặt tour thành công!</h1>
          <p className="text-gray-600 mb-2">Cảm ơn bạn đã tin tưởng TravelHub</p>
          <p className="text-lg text-gray-900 mb-8">Mã đơn hàng: <strong>{orderId}</strong></p>

          <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-lg text-gray-900 mb-4">Thông tin đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="text-gray-900">{(total - discountAmount).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="text-green-600">Đã xác nhận</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email xác nhận:</span>
                <span className="text-gray-900">{formData.email}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Plane className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900">TravelHub</span>
            </div>
            <Link to="/cart" className="text-blue-600 hover:text-blue-700">← Quay lại giỏ hàng</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-xl text-gray-900 mb-6">Thông tin liên hệ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Thành phố</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-xl text-gray-900 mb-6">Phương thức thanh toán</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === 'credit_card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="size-6 mx-auto mb-2" />
                    <span className="text-sm">Thẻ tín dụng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('banking')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === 'banking'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2">🏦</span>
                    <span className="text-sm block">Chuyển khoản</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('momo')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === 'momo'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2">📱</span>
                    <span className="text-sm block">MoMo</span>
                  </button>
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Số thẻ</label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Tên trên thẻ</label>
                      <input
                        type="text"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Ngày hết hạn</label>
                        <input
                          type="text"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          value={formData.cvv}
                          onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                          placeholder="123"
                          className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
              >
                Xác nhận thanh toán {(total - discountAmount).toLocaleString('vi-VN')}đ
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-8">
              <h2 className="text-xl text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b">
                    <div className="size-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                      <p className="text-sm text-blue-600">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">Mã giảm giá</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="text"
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                      placeholder="Nhập mã"
                      className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
                {discountMessage && (
                  <p className={`text-xs mt-2 ${discountMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                    {discountMessage}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Mã khả dụng: SUMMER2026, WELCOME10, VIP20
                </p>
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="text-gray-900">{total.toLocaleString('vi-VN')}đ</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá ({discountCode})</span>
                    <span className="text-green-600">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí dịch vụ</span>
                  <span className="text-gray-900">0đ</span>
                </div>
              </div>

              <div className="flex justify-between text-lg mb-4">
                <span className="text-gray-900">Tổng cộng</span>
                <span className="text-blue-600">{(total - discountAmount).toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ Bảo mật thanh toán SSL</p>
                <p>✓ Hoàn tiền 100% nếu hủy trước 7 ngày</p>
                <p>✓ Hỗ trợ 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
