"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, Loader2, QrCode, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';


interface PaymentStatus {
  paymentCode: string;
  amount: number;
  status: string;
  paidAt?: string | null;
  orderItems?: Array<{ title?: string; price?: number; quantity?: number }>;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const paymentCode = params.code as string;
  const { theme } = useTheme();
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulating, setSimulating] = useState(false);

  const fetchStatus = useCallback(async () => {

    if (!response.ok) {
      throw new Error('Không tìm thấy đơn thanh toán');
    }
    return response.json() as Promise<PaymentStatus>;
  }, [paymentCode]);

  useEffect(() => {
    const init = async () => {
      try {
        const storedQr = sessionStorage.getItem(`payment_qr_${paymentCode}`);
        if (storedQr) setQrUrl(storedQr);

        const data = await fetchStatus();
        setPayment(data);

        if (!storedQr && data.amount) {
          const bankAccount = process.env.NEXT_PUBLIC_SEPAY_BANK_ACCOUNT;
          const bankName = process.env.NEXT_PUBLIC_SEPAY_BANK_NAME || 'Vietcombank';
          if (bankAccount) {
            const url = `https://qr.sepay.vn/img?acc=${encodeURIComponent(bankAccount)}&bank=${encodeURIComponent(bankName)}&amount=${Math.round(data.amount)}&des=${encodeURIComponent(paymentCode)}`;
            setQrUrl(url);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin thanh toán');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [paymentCode, fetchStatus]);

  useEffect(() => {
    if (!payment || payment.status === 'paid') return;

    const interval = setInterval(async () => {
      try {
        const data = await fetchStatus();
        setPayment(data);
        if (data.status === 'paid') {
          clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [payment, fetchStatus]);

  const handleSimulate = async () => {
    setSimulating(true);
    setError('');
    try {

      }
      const data = await fetchStatus();
      setPayment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể mô phỏng thanh toán');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <Header />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <p className="text-red-500 font-bold">{error || 'Đơn thanh toán không tồn tại'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const isPaid = payment.status === 'paid';

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-8">
          {isPaid ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full mb-4">
              <Check className="size-10 text-emerald-500" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-950/40 rounded-full mb-4">
              <QrCode className="size-10 text-blue-600" />
            </div>
          )}
          <h1 className="text-3xl font-black font-serif mb-2">
            {isPaid ? 'Thanh toán thành công!' : 'Quét mã QR để thanh toán'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">
            Mã thanh toán: <span className="font-black text-blue-600">{payment.paymentCode}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-500">Số tiền</span>
            <span className="text-blue-700 dark:text-blue-400 text-lg font-black">
              {payment.amount.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-500">Trạng thái</span>
            <span className={isPaid ? 'text-emerald-500' : 'text-amber-500'}>
              {isPaid ? 'Đã thanh toán' : 'Đang chờ thanh toán'}
            </span>
          </div>

          {!isPaid && qrUrl && (
            <div className="flex flex-col items-center gap-4 pt-4">
              <img src={qrUrl} alt="SePay QR Code" className="w-64 h-64 rounded-2xl border border-slate-200 dark:border-slate-700" />
              <p className="text-xs text-slate-500 text-center max-w-sm">
                Quét mã QR bằng app ngân hàng. Nội dung chuyển khoản phải chứa mã <strong>{payment.paymentCode}</strong>.
                Hệ thống sẽ tự động xác nhận sau khi nhận tiền.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="size-3.5 animate-spin" />
                Đang chờ xác nhận thanh toán...
              </div>
              <button
                type="button"
                onClick={handleSimulate}
                disabled={simulating}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                {simulating ? 'Đang mô phỏng...' : '[Dev] Mô phỏng thanh toán thành công'}
              </button>
            </div>
          )}

          {isPaid && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm"
              >
                Xem đơn đặt
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 py-3 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-sm"
              >
                Về trang chủ
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
