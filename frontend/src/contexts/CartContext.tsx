"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getCartLineTotal, type ServiceType } from '@/lib/checkoutApi';

export interface CartItem {
  id: string;
  serviceType: ServiceType;
  referenceId: string;
  tourId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  date: string;
  guests: number;
  metadata?: {
    seatNumber?: string;
    route?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'referenceId' | 'tourId'> & { referenceId?: string; tourId?: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  discountCode: string;
  applyDiscount: (code: string) => boolean;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DISCOUNT_CODES = {
  'SUMMER2026': 0.15,
  'WELCOME10': 0.10,
  'VIP20': 0.20
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState('');

  const addToCart = (item: Omit<CartItem, 'id' | 'referenceId' | 'tourId'> & { referenceId?: string; tourId?: string }) => {
    const referenceId = item.referenceId ?? item.tourId ?? '';
    const newItem: CartItem = {
      ...item,
      id: Date.now().toString(),
      referenceId,
      tourId: referenceId,
      serviceType: item.serviceType ?? 'tour',
    };
    setItems([newItem]);
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
    setDiscountCode('');
  };

  const total = items.reduce((sum, item) => sum + getCartLineTotal(item), 0);

  const applyDiscount = (code: string): boolean => {
    if (DISCOUNT_CODES[code as keyof typeof DISCOUNT_CODES]) {
      setDiscountCode(code);
      return true;
    }
    return false;
  };

  const discountAmount = discountCode ?
    total * (DISCOUNT_CODES[discountCode as keyof typeof DISCOUNT_CODES] || 0) : 0;

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      discountCode,
      applyDiscount,
      discountAmount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
