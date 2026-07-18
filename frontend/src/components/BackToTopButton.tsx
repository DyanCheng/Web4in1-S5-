'use client';

import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      className="fixed bottom-3 right-4 z-50 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-lg cursor-pointer"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
