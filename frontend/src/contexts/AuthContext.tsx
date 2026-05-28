"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5200';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'hotel_owner';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: string = 'user') => {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Đăng nhập thất bại');
    }

    const data = await response.json();
    setUser({ id: data.id, email: data.email, name: data.name, role: data.role });
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Đăng ký thất bại');
    }

    const data = await response.json();
    setUser({ id: data.id, email: data.email, name: data.name, role: data.role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
