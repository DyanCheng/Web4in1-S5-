import { apiUrl } from '@/lib/backendUrl';

export type ServiceType = 'tour' | 'bus' | 'flight' | 'insurance' | 'vehicle';

export interface CheckoutItemPayload {
  serviceType: ServiceType;
  referenceId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  guests: number;
  date: string;
  metadata?: {
    seatNumber?: string;
    route?: string;
  };
}

export interface CheckoutPayload {
  userId: string;
  userEmail: string;
  userName: string;
  phone: string;
  discountCode?: string;
  items: CheckoutItemPayload[];
}

export interface CheckoutResponse {
  paymentCode: string;
  amount: number;
  subtotal: number;
  discountAmount: number;
  discountCode?: string | null;
  status: string;
  qrUrl: string;
  bookingRefs: string[];
}

export function getCartLineTotal(item: {
  serviceType?: ServiceType;
  price: number;
  quantity: number;
  guests: number;
}): number {
  const serviceType = item.serviceType ?? 'tour';

  if (serviceType === 'flight' || serviceType === 'insurance' || serviceType === 'vehicle' || serviceType === 'bus') {
    return item.price * item.quantity;
  }

  return item.price * item.quantity * Math.max(item.guests, 1);
}

export async function submitUnifiedCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const response = await fetch(apiUrl('/api/orders/checkout'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Không thể tạo đơn thanh toán');
  }

  return response.json();
}
