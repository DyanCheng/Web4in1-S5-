"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  itemType?: 'tour' | 'hotel';
  tourId?: string;
  hotelId?: string;
  hotelName?: string;
  roomId?: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  date: string;
  checkOutDate?: string;
  guests: number;
  children?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
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

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setItems(prev => [...prev, newItem]); // Append to allow multiple items
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

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
