"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DarkModePaywall } from '@/components/DarkModePaywall';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  paywallOpen: boolean;
  closePaywall: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    // Dark mode is a premium feature — always force light
    localStorage.setItem('theme', 'light');
    window.document.documentElement.classList.remove('dark');
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setPaywallOpen(true);
  };

  const closePaywall = () => setPaywallOpen(false);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, paywallOpen, closePaywall }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }} className="contents">
        {children}
        <DarkModePaywall open={paywallOpen} onClose={closePaywall} />
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
