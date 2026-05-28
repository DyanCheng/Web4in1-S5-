import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    // Mock login - in production, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 500));

    // Demo accounts
    if (email === 'admin@travelhub.com' && password === 'admin123') {
      setUser({ id: '1', email, name: 'Admin', role: 'admin' });
    } else if (email === 'hotel@travelhub.com' && password === 'hotel123') {
      setUser({ id: '2', email, name: 'Hotel Owner', role: 'hotel_owner' });
    } else {
      setUser({ id: '3', email, name: email.split('@')[0], role: 'user' });
    }
  };

  const register = async (email: string, password: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({ id: Date.now().toString(), email, name, role: 'user' });
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
