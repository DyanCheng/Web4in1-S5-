"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'hotel_owner' | 'employee' | 'accountant';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: string) => Promise<User>;
<<<<<<< HEAD
  loginWithGoogle: (credential: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
=======
  register: (email: string, password: string, name: string) => Promise<void>;
>>>>>>> 4918b1343dce50766289eaedd08fecac3fd8ebf3
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

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, []);

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
<<<<<<< HEAD
    const loggedInUser: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
    };
    persistUser(loggedInUser);
    return loggedInUser;
  };

  const loginWithGoogle = async (credential: string) => {
    const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Đăng nhập Google thất bại');
    }

    const data = await response.json();
    const loggedInUser: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
    };
    persistUser(loggedInUser);
    return loggedInUser;
=======
    const newUser = { id: data.id, email: data.email, name: data.name, role: data.role, avatar: data.avatar };
    
    // Giữ lại avatar local nếu có
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.email === newUser.email && parsed.avatar && !newUser.avatar) {
          newUser.avatar = parsed.avatar;
        }
      } catch (e) {}
    }
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
>>>>>>> 4918b1343dce50766289eaedd08fecac3fd8ebf3
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
<<<<<<< HEAD
    const registeredUser: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
    };
    persistUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    persistUser(null);
=======
    const newUser = { id: data.id, email: data.email, name: data.name, role: data.role, avatar: data.avatar };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...data };
      try {
        localStorage.setItem('user', JSON.stringify(newUser));
      } catch (e) {
        console.warn('Cannot save user to localStorage (maybe avatar is too large)');
      }
      return newUser;
    });
>>>>>>> 4918b1343dce50766289eaedd08fecac3fd8ebf3
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      register,
      logout,
<<<<<<< HEAD
      isAuthenticated: !!user,
      isLoading,
=======
      updateUser,
      isAuthenticated: !!user
>>>>>>> 4918b1343dce50766289eaedd08fecac3fd8ebf3
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
