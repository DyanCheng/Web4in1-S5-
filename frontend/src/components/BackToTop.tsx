'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Check both window and the main scrollable container if applicable
      const scrolled = window.scrollY > 300;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Lên đầu trang"
      className="fixed bottom-[90px] right-5 z-40 flex size-12 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur hover:bg-slate-800 transition-all duration-300 dark:bg-white/80 dark:text-slate-900 dark:hover:bg-white"
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
