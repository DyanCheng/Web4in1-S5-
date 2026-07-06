"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { apiUrl, parseJsonResponse } from '@/lib/backendUrl';
import { getAuthToken, setAuthToken } from '@/lib/authFetch';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'hotel_owner' | 'employee' | 'accountant';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role?: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthResponse {
  token: string;
  expiresIn: number;
  id: string;
  email: string;
  name: string;
  role: User['role'];
  avatar?: string;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'cmc_travel_user';

async function readAuthResponse(
  response: Response,
  fallbackMessage: string
): Promise<AuthResponse> {
  const data = await parseJsonResponse<AuthResponse>(response);
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
}

function persistSession(userData: User | null, token: string | null) {
  if (userData && token) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setAuthToken(token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedToken = getAuthToken();
      if (stored && storedToken) {
        setUser(JSON.parse(stored));
        setToken(storedToken);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setAuthToken(null);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    persistSession(userData, authToken);
  };

  const login = async (email: string, password: string, role: string = 'user'): Promise<User> => {
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
    const userData: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
    };
    saveSession(userData, data.token);
    return userData;
  };

  const loginWithGoogle = async (credential: string): Promise<User> => {
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
    const userData: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
    };
    saveSession(userData, data.token);
    return userData;
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

    const data = await readAuthResponse(response, 'Đăng ký thất bại');
    console.log(data);
    saveSession({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
    }, data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    persistSession(null, null);
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    if (token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      loginWithGoogle,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user && !!token,
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