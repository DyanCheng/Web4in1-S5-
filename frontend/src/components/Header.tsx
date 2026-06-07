"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ShoppingCart, Sun, Moon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const navigate = (url: string) => router.push(url);
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getNavLink = (anchor: string) => {
    return pathname === '/' ? anchor : `/${anchor}`;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md py-4' 
        : 'bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <span className="text-2xl font-black text-blue-900 dark:text-blue-400 font-serif italic tracking-wide group-hover:scale-105 transition-transform">
              Travel Booking
            </span>
          </div>
          
          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm tracking-wider uppercase text-slate-600 dark:text-slate-350">
            <a 
              href={getNavLink('#destinations')} 
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 ${
                pathname === '/' ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Điểm đến
            </a>
            <button 
              onClick={() => navigate('/tours')} 
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider cursor-pointer ${
                pathname.startsWith('/tours') || pathname.startsWith('/tour') ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Tours
            </button>
            <button
              onClick={() => navigate('/hotel')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider cursor-pointer ${
                pathname.startsWith('/hotel') ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Khách sạn
            </button>
            <button
              onClick={() => navigate('/vehicle')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider cursor-pointer ${
                pathname.startsWith('/vehicle') ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Phương tiện
            </button>
            {user?.role === 'admin' && (
              <a 
                href={getNavLink('#partners')} 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
              >
                Đối tác
              </a>
            )}
            {user && (user.role === 'admin' || user.role === 'hotel_owner') && (
              <button 
                onClick={() => navigate(user.role === 'admin' ? '/admin' : '/hotel-owner')} 
                className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider cursor-pointer ${
                  pathname === '/admin' || pathname === '/hotel-owner' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Quản trị
              </button>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            
            {/* Shopping Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer"
            >
              <ShoppingCart className="size-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xxs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce shadow">
                  {items.length}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="size-5 text-yellow-400" /> : <Moon className="size-5" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : user.role === 'hotel_owner' ? '/hotel-owner' : '/dashboard')}
                  className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors font-bold text-sm cursor-pointer"
                >
                  {user.name}
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-full transition-all text-xs font-bold cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors font-bold text-sm cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full transition-all font-bold text-sm shadow-md cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <Menu className="size-5.5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 text-left">
            <a 
              href={getNavLink('#destinations')} 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
              Điểm đến
            </a>
            <button 
              onClick={() => { navigate('/tours'); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Tours
            </button>
            <button
              onClick={() => { navigate('/hotel'); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Khách sạn
            </button>
            <button
              onClick={() => { navigate('/vehicle'); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Phương tiện
            </button>
            {user?.role === 'admin' && (
              <a 
                href={getNavLink('#partners')} 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
              >
                Đối tác
              </a>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { navigate(user.role === 'admin' ? '/admin' : user.role === 'hotel_owner' ? '/hotel-owner' : '/dashboard'); setMobileMenuOpen(false); }}
                    className="px-3 py-2 text-left text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Tài khoản: {user.name}
                  </button>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="px-3 py-2 text-left text-sm font-bold text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-3">
                  <button
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    className="flex-1 py-2 text-center text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750 rounded-full cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                    className="flex-1 py-2 text-center text-sm font-bold text-white bg-blue-900 dark:bg-blue-600 rounded-full cursor-pointer"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
