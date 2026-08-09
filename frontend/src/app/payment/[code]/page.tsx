"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, QrCode, RefreshCw, Clock, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageSkeleton } from '@/components/ux/PageSkeleton';
import { useTheme } from '@/contexts/ThemeContext';
import { apiUrl } from '@/lib/backendUrl';

interface PaymentStatus {
  paymentCode: string;
  amount: number;
  status: string;
  paidAt?: string | null;
  createdAt?: string | null;
  expiresAt?: string | null;
  qrUrl?: string | null;
  orderItems?: Array<{ title?: string; price?: number; quantity?: number }>;
}

/** Payment code validity window — must match backend expire_order_payment */
const PAYMENT_CODE_TTL_MS = 5 * 60_000;

/** DB stores UTC timestamps without offset; treat naive values as UTC. */
function parseUtcMs(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;
  if (/([zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed)) {
    return new Date(trimmed).getTime();
  }
  const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  return new Date(`${normalized}Z`).getTime();
}

function resolveExpiresAt(data: PaymentStatus): number | null {
  if (data.expiresAt) {
    const t = parseUtcMs(data.expiresAt);
    if (!Number.isNaN(t)) return t;
  }
  if (data.createdAt) {
    const t = parseUtcMs(data.createdAt);
    if (!Number.isNaN(t)) return t + PAYMENT_CODE_TTL_MS;
  }
  return null;
}

function resolveQrUrl(data: PaymentStatus, paymentCode: string): string {
  if (data.qrUrl) return data.qrUrl;

  const storedQr = typeof window !== 'undefined'
    ? sessionStorage.getItem(`payment_qr_${paymentCode}`)
    : null;
  if (storedQr) return storedQr;

  if (data.amount && data.status !== 'expired' && data.status !== 'paid') {
    const bankAccount = process.env.NEXT_PUBLIC_SEPAY_BANK_ACCOUNT;
    const bankName = process.env.NEXT_PUBLIC_SEPAY_BANK_NAME || 'MBBank';
    if (bankAccount) {
      return `https://qr.sepay.vn/img?acc=${encodeURIComponent(bankAccount)}&bank=${encodeURIComponent(bankName)}&amount=${Math.round(data.amount)}&des=${encodeURIComponent(paymentCode)}&template=QR`;
    }
  }
  return '';
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
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());

  const fetchStatus = useCallback(async () => {
    const response = await fetch(apiUrl(`/api/payments/${paymentCode}/status`));
    if (!response.ok) {
      throw new Error('Không tìm thấy đơn thanh toán');
    }
    return response.json() as Promise<PaymentStatus>;
  }, [paymentCode]);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchStatus();
        setPayment(data);
        setExpiresAtMs(resolveExpiresAt(data));

        const url = resolveQrUrl(data, paymentCode);
        setQrUrl(url);
        if (url && data.status !== 'expired' && data.status !== 'paid') {
          sessionStorage.setItem(`payment_qr_${paymentCode}`, url);
        } else {
          sessionStorage.removeItem(`payment_qr_${paymentCode}`);
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
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isExpiredClient =
    payment?.status === 'expired' ||
    (expiresAtMs != null && nowMs >= expiresAtMs && payment?.status !== 'paid');

  useEffect(() => {
    if (!payment || payment.status === 'paid' || payment.status === 'expired') return;

    const interval = setInterval(async () => {
      try {
        const data = await fetchStatus();
        setPayment(data);
        setExpiresAtMs(resolveExpiresAt(data));
        const url = resolveQrUrl(data, paymentCode);
        if (url) setQrUrl(url);
        if (data.status === 'paid' || data.status === 'expired') {
          clearInterval(interval);
          sessionStorage.removeItem(`payment_qr_${paymentCode}`);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [payment, fetchStatus, paymentCode]);

  // Nudge server to expire when local countdown hits 0 (do not force UI expired if server still pending)
  useEffect(() => {
    if (!isExpiredClient || !payment || payment.status === 'expired' || payment.status === 'paid') return;
    void fetch(apiUrl(`/api/payments/${paymentCode}/expire`), { method: 'POST' })
      .then(() => fetchStatus())
      .then((data) => {
        setPayment(data);
        setExpiresAtMs(resolveExpiresAt(data));
        if (data.status === 'expired' || data.status === 'paid') {
          sessionStorage.removeItem(`payment_qr_${paymentCode}`);
        }
      })
      .catch(() => {
        // Keep polling; only the server may mark the payment code expired
      });
  }, [isExpiredClient, payment, paymentCode, fetchStatus]);

  const remainingLabel = useMemo(() => {
    if (!expiresAtMs || payment?.status === 'paid') return null;
    const left = Math.max(0, expiresAtMs - nowMs);
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [expiresAtMs, nowMs, payment?.status]);

  const handleSimulate = async () => {
    setSimulating(true);
    setError('');
    try {
      const response = await fetch(apiUrl(`/api/payments/simulate/${paymentCode}`), { method: 'POST' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const fallback = response.status === 404
          ? 'Mô phỏng thanh toán chưa bật trên Railway. Thêm ALLOW_PAYMENT_SIMULATION=true và redeploy backend.'
          : 'Không thể mô phỏng thanh toán';
        throw new Error(err.message || fallback);
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
    return <PageSkeleton variant="form" />;
  }

  if ((error && !payment) || !payment) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900 dark:text-slate-50'}`}>
        <Header />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <p className="text-red-500 font-bold">{error || 'Đơn thanh toán không tồn tại'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const isPaid = payment.status === 'paid';
  const isPendingApproval = payment.status === 'pending_approval' && !isExpiredClient;
  const isExpired = payment.status === 'expired' || isExpiredClient;

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900 dark:text-slate-50'}`}>
      <Header />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-8">
          {isPaid ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full mb-4">
              <Check className="size-10 text-emerald-500" />
            </div>
          ) : isExpired ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 dark:bg-red-950/40 rounded-full mb-4">
              <XCircle className="size-10 text-red-500" />
            </div>
          ) : isPendingApproval ? (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 dark:bg-amber-950/40 rounded-full mb-4">
              <Clock className="size-10 text-amber-500" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-950/40 rounded-full mb-4">
              <QrCode className="size-10 text-blue-600" />
            </div>
          )}
          <h1 className="text-3xl font-black font-sans mb-2">
            {isPaid
              ? 'Thanh toán thành công!'
              : isExpired
                ? 'Mã thanh toán đã hết hạn'
                : isPendingApproval
                  ? 'Đang chờ Admin duyệt đơn'
                  : 'Quét mã QR để thanh toán'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">
            Mã thanh toán: <span className={`font-black ${isExpired ? 'text-red-500 line-through' : 'text-blue-600'}`}>{payment.paymentCode}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-500 dark:text-slate-400">Số tiền</span>
            <span className="text-blue-700 dark:text-blue-400 text-lg font-black">
              {payment.amount.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-500 dark:text-slate-400">Trạng thái</span>
            <span className={isPaid ? 'text-emerald-500' : isExpired ? 'text-red-500' : isPendingApproval ? 'text-amber-500' : 'text-blue-500'}>
              {isPaid ? 'Đã thanh toán' : isExpired ? 'Hết hạn' : isPendingApproval ? 'Đang chờ duyệt' : 'Đang chờ thanh toán'}
            </span>
          </div>

          {!isPaid && !isExpired && remainingLabel && (
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-500 dark:text-slate-400">Mã thanh toán còn hiệu lực</span>
              <span className="text-amber-600 font-black tabular-nums">{remainingLabel}</span>
            </div>
          )}

          {error && (
            <p className="text-sm font-semibold text-red-500 text-center">{error}</p>
          )}

          {isExpired && (
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-900/50 w-full">
                <p className="text-sm text-red-800 dark:text-red-200 text-center">
                  Mã thanh toán <strong>{payment.paymentCode}</strong> chỉ có hiệu lực trong 5 phút và đã hết hạn.
                  Chuyển khoản với mã này sẽ không được hệ thống xác nhận.
                  Vui lòng tạo lại đơn từ giỏ hàng / checkout để nhận mã mới.
                </p>
              </div>
              <button
                onClick={() => router.push('/tours')}
                className="w-full py-3 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-sm"
              >
                Quay lại giỏ hàng
              </button>
            </div>
          )}

          {isPendingApproval && (
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                  Đơn đặt của bạn đã được ghi nhận và đang chờ bộ phận quản trị duyệt.
                  Bạn có thể giữ nguyên trang này, hoặc lưu lại URL để kiểm tra tiến độ sau.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                <RefreshCw className="size-3.5 animate-spin" />
                Đang tự động làm mới trạng thái...
              </div>
            </div>
          )}

          {!isPaid && !isPendingApproval && !isExpired && (
            <div className="flex flex-col items-center gap-4 pt-4">
              {qrUrl ? (
                <div className="bg-white p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <img
                    src={qrUrl}
                    alt="SePay QR Code"
                    width={256}
                    height={256}
                    className="w-64 h-64 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-red-500 text-center">
                  Không tạo được mã QR. Kiểm tra cấu hình SEPAY_BANK_ACCOUNT trên máy chủ.
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
                Quét mã QR bằng app ngân hàng. Nội dung chuyển khoản phải chứa mã thanh toán <strong>{payment.paymentCode}</strong>.
                Mã này có hiệu lực <strong>5 phút</strong> — hết hạn thì cần tạo đơn mới. Hệ thống tự xác nhận sau khi nhận tiền.
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
