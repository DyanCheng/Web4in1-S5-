import { apiUrl } from '@/lib/backendUrl';

export type ServiceType = 'tour' | 'bus' | 'flight' | 'insurance' | 'vehicle' | 'hotel';

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
    hotelId?: string;
    hotelName?: string;
    roomId?: string;
    roomName?: string;
    checkOutDate?: string;
    children?: number;
    childPrice?: number;
    totalNights?: number;
    departureAddress?: string;
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
  children?: number;
  metadata?: {
    childPrice?: number;
    children?: number;
    totalNights?: number;
  };
}): number {
  const serviceType = item.serviceType ?? 'tour';

  if (serviceType === 'flight' || serviceType === 'insurance' || serviceType === 'vehicle' || serviceType === 'bus' || serviceType === 'hotel') {
    return item.price * item.quantity;
  }

  const adults = Math.max(item.guests, 1);
  const children = Math.max(item.children ?? item.metadata?.children ?? 0, 0);
  const childPrice = item.metadata?.childPrice ?? 0;
  return (item.price * adults + childPrice * children) * Math.max(item.quantity, 1);
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
