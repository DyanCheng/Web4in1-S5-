"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Menu, Heart, ChevronDown, Plane, Bus, Car, Shield, MessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { canAccessSupportInbox } from '@/lib/chat/support-constants';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const navigate = (url: string) => router.push(url);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy chữ cái đầu để hiển thị trong avatar khi chưa có ảnh
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const moreItems = [
    { label: 'Vé máy bay', icon: Plane, href: '/flight' },
    { label: 'Vé xe khách', icon: Bus, href: '/bus' },
    { label: 'Phương tiện cho thuê', icon: Car, href: '/vehicle' },
    { label: 'Bảo hiểm du lịch', icon: Shield, href: '/insurance' },
  ];

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
            <img 
              src="/logo.svg" 
              alt="CMC Travel" 
              className="h-10 sm:h-12 w-auto group-hover:scale-105 transition-transform"
            />
          </div>
          
          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm tracking-wider uppercase text-slate-600 dark:text-slate-350">
            {/* Tours */}
            <button 
              onClick={() => navigate('/#tours')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider cursor-pointer ${
                pathname === '/' ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Tours
            </button>

            {/* Khách sạn */}
            <button
              onClick={() => navigate('/hotel')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider cursor-pointer ${
                pathname.startsWith('/hotel') ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Khách sạn
            </button>

            {canAccessSupportInbox(user?.role) ? (
              <button
                onClick={() => navigate('/employee/support')}
                className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider cursor-pointer inline-flex items-center gap-1 ${
                  pathname.startsWith('/employee/support') ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <MessageSquare className="size-4" />
                Hỗ trợ
              </button>
            ) : null}

            {/* Yêu thích */}
            <button
              onClick={() => navigate('/favorites')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider cursor-pointer inline-flex items-center gap-1 ${
                pathname.startsWith('/favorites') ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              <Heart className="size-4" />
              Yêu thích
            </button>

            {/* Xem thêm dropdown */}
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider cursor-pointer inline-flex items-center gap-1 ${
                  moreOpen ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Xem thêm
                <ChevronDown className={`size-4 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown panel */}
              {moreOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-fade-in">
                  {/* Arrow */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
                    <div className="w-3 h-3 bg-white dark:bg-slate-800 border-l border-t border-slate-100 dark:border-slate-700 rotate-45 mx-auto mt-1" />
                  </div>
                  {moreItems.map(({ label, icon: Icon, href }) => (
                    <button
                      key={href}
                      onClick={() => { navigate(href); setMoreOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-semibold normal-case tracking-normal text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer ${
                        pathname.startsWith(href) ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-700' : ''
                      }`}
                    >
                      <span className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                        <Icon className="size-4" />
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate('/#partners')} 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 cursor-pointer"
              >
                Đối tác
              </button>
            )}
            {user && (user?.role === 'admin' || user?.role === 'hotel_owner' || user?.role === 'employee' || user?.role === 'accountant') && (
              <button 
                onClick={() => {
                  if (user?.role === 'admin') navigate('/admin');
                  else if (user?.role === 'hotel_owner') navigate('/hotel-owner');
                  else if (user?.role === 'employee') navigate('/employee');
                  else if (user?.role === 'accountant') navigate('/accountant');
                }} 
                className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider cursor-pointer ${
                  pathname === '/admin' || pathname === '/hotel-owner' || pathname === '/employee' || pathname === '/accountant' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Quản trị
              </button>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">

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
              <div className="flex items-center gap-3">
                {/* Avatar vòng tròn */}
                <button
                  onClick={() => {
                    if (user?.role === 'admin') navigate('/admin');
                    else if (user?.role === 'hotel_owner') navigate('/hotel-owner');
                    else if (user?.role === 'employee') navigate('/employee');
                    else if (user?.role === 'accountant') navigate('/accountant');
                    else navigate('/dashboard');
                  }}
                  className="cursor-pointer group"
                  title={user.name}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 group-hover:border-blue-700 transition-all shadow-sm"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold border-2 border-blue-500 group-hover:border-blue-700 transition-all shadow-sm select-none">
                      {getInitials(user.name)}
                    </div>
                  )}
                </button>

                <button
                  onClick={logout}
                  className="hidden sm:block px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-full transition-all text-xs font-bold cursor-pointer"
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
            <button 
              onClick={() => { navigate('/#tours'); setMobileMenuOpen(false); }}
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
            {canAccessSupportInbox(user?.role) ? (
              <button
                onClick={() => { navigate('/employee/support'); setMobileMenuOpen(false); }}
                className="px-3 py-2 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer inline-flex items-center gap-2"
              >
                <MessageSquare className="size-4" />
                Hỗ trợ
              </button>
            ) : null}
            <button
              onClick={() => { navigate('/favorites'); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer inline-flex items-center gap-2"
            >
              <Heart className="size-4" />
              Yêu thích
            </button>

            {/* Xem thêm section mobile */}
            <div className="px-3 py-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Xem thêm</p>
              <div className="flex flex-col gap-1">
                {moreItems.map(({ label, icon: Icon, href }) => (
                  <button
                    key={href}
                    onClick={() => { navigate(href); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-2 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <span className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                      <Icon className="size-3.5" />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {user?.role === 'admin' && (
              <button 
                onClick={() => { navigate('/#partners'); setMobileMenuOpen(false); }}
                className="px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer"
              >
                Đối tác
              </button>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
              {user ? (
                <div className="flex flex-col gap-2">
                  {/* Avatar + tên trong mobile */}
                  <button
                    onClick={() => {
                      if (user?.role === 'admin') navigate('/admin');
                      else if (user?.role === 'hotel_owner') navigate('/hotel-owner');
                      else if (user?.role === 'employee') navigate('/employee');
                      else if (user?.role === 'accountant') navigate('/accountant');
                      else navigate('/dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 flex items-center gap-3 text-left text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-blue-500" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold border-2 border-blue-500 select-none">
                        {getInitials(user.name)}
                      </div>
                    )}
                    {user.name}
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
