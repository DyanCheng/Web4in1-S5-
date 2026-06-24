"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'hotel_owner' | 'employee' | 'accountant';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;

  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'cmc_travel_user';


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string, password: string, role: string = 'user') => {
    let response: Response;
    try {
      response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
    } catch {
      throw new Error('Không thể kết nối máy chủ. Kiểm tra backend Railway và redeploy Vercel.');
    }

    const data = await readAuthResponse(response, 'Đăng nhập thất bại');
    persistUser({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
    });
  };

  const loginWithGoogle = async (credential: string) => {
    let response: Response;
    try {
      response = await fetch(apiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
    } catch {
      throw new Error('Không thể kết nối máy chủ. Kiểm tra backend Railway và redeploy Vercel.');
    }


    const data = await readAuthResponse(response, 'Đăng nhập Google thất bại');
    persistUser({

      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,

  };

  const register = async (email: string, password: string, name: string) => {
    let response: Response;
    try {
      response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
    } catch {
      throw new Error('Không thể kết nối máy chủ. Kiểm tra backend Railway và redeploy Vercel.');
    }


      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,

  };

  const logout = () => {
    persistUser(null);

  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      register,
      logout,

      isAuthenticated: !!user,
      isLoading,
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
