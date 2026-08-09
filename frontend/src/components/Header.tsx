"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Menu, Heart, ChevronDown, Plane, Bus, Car, Shield, MessageSquare, LayoutDashboard, History, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { canAccessSupportInbox } from '@/lib/chat/support-constants';

const navLinkClass =
  'interactive-press hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 uppercase font-bold text-sm tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-md';

const menuItemClass =
  'interactive-press w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-semibold normal-case tracking-normal text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40';

const mobileItemClass =
  'interactive-press px-3 py-2 text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40';

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  user: { label: 'Khách hàng', className: 'text-zinc-600 bg-zinc-100' },
  admin: { label: 'Adminstrator', className: 'text-red-600 bg-red-100' },
  employee: { label: 'Nhân viên', className: 'text-yellow-600 bg-yellow-100' },
  accountant: { label: 'Kế toán', className: 'text-blue-600 bg-blue-100' },
};

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const canAccessAdmin =
    user?.role === 'admin' ||
    user?.role === 'hotel_owner' ||
    user?.role === 'employee' ||
    user?.role === 'accountant';

  const roleBadge = user ? ROLE_BADGE[user.role] : undefined;

  const getAdminPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'hotel_owner') return '/hotel-owner';
    if (user?.role === 'employee') return '/employee';
    if (user?.role === 'accountant') return '/accountant';
    return '/dashboard';
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    setMoreOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

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
        ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border-b border-slate-200/60 dark:border-slate-700/60 py-4' 
        : 'bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-5 shadow-none'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <Link href="/" className="flex items-center gap-2 group py-1 interactive-press rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
            <img 
              src="/logo.png" 
              alt="CMC Travel" 
              className="h-16 sm:h-20 w-auto group-hover:scale-105 transition-transform duration-200"
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 font-bold text-sm tracking-wider uppercase text-slate-600 dark:text-slate-350">
            <Link
              href="/#tours"
              className={`${navLinkClass} ${pathname === '/' ? 'text-blue-600 dark:text-blue-400' : ''}`}
            >
              Tours
            </Link>

            <Link
              href="/hotel"
              prefetch
              className={`${navLinkClass} ${pathname.startsWith('/hotel') ? 'text-blue-600 dark:text-blue-400' : ''}`}
            >
              Khách sạn
            </Link>

            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={`${navLinkClass} inline-flex items-center gap-1 cursor-pointer ${
                  moreOpen ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Xem thêm
                <ChevronDown className={`size-4 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-fade-in">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
                    <div className="w-3 h-3 bg-white dark:bg-slate-800 border-l border-t border-slate-100 dark:border-slate-700 rotate-45 mx-auto mt-1" />
                  </div>
                  {moreItems.map(({ label, icon: Icon, href }) => (
                    <Link
                      key={href}
                      href={href}
                      prefetch
                      onClick={() => setMoreOpen(false)}
                      className={`${menuItemClass} ${
                        pathname.startsWith(href) ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-700' : ''
                      }`}
                    >
                      <span className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                        <Icon className="size-4" />
                      </span>
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="interactive-press p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="size-5 text-yellow-400" /> : <Moon className="size-5" />}
            </button>

            {user ? (
              <div ref={userMenuRef} className="relative hidden sm:block w-full">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="interactive-press relative flex items-center gap-1 pl-1 pr-2 py-1 rounded-full cursor-pointer before:absolute before:inset-0 before:rounded-full before:bg-white/30 before:opacity-0 before:transition-opacity hover:before:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
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
                  <div className="flex flex-col items-start min-w-0 px-2">
                    <div className="UserNameHeader py-0.5 text-sm font-bold truncate max-w-[9rem]">{user.name}</div>
                    {roleBadge && (
                      <div className={`UserRoleHeader rounded-md px-2 py-0.5 text-xs font-medium ${roleBadge.className}`}>
                        {roleBadge.label}
                      </div>
                    )}
                  </div>
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-fade-in"
                  >
                    <div className="absolute -top-2 right-6 w-4 h-2 overflow-hidden">
                      <div className="w-3 h-3 bg-white dark:bg-slate-800 border-l border-t border-slate-100 dark:border-slate-700 rotate-45 mx-auto mt-1" />
                    </div>

                    <div className="flex flex-col items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-bold border-2 border-blue-500 shadow-sm select-none">
                          {getInitials(user.name)}
                        </div>
                      )}
                      <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white truncate max-w-full">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-full mt-0.5">{user.email}</p>
                    </div>

                    <div className="p-1.5">
                      <Link
                        role="menuitem"
                        href="/dashboard"
                        prefetch
                        onClick={() => setUserMenuOpen(false)}
                        className="interactive-press w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="size-4 shrink-0" />
                        Dashboard / Hồ sơ
                      </Link>
                      <Link
                        role="menuitem"
                        href="/dashboard"
                        prefetch
                        onClick={() => setUserMenuOpen(false)}
                        className="interactive-press w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors cursor-pointer"
                      >
                        <History className="size-4 shrink-0" />
                        Lịch sử đặt tour
                      </Link>
                      <Link
                        role="menuitem"
                        href="/favorites"
                        prefetch
                        onClick={() => setUserMenuOpen(false)}
                        className="interactive-press w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors cursor-pointer"
                      >
                        <Heart className="size-4 shrink-0" />
                        Yêu thích
                      </Link>
                      {canAccessAdmin && (
                        <Link
                          role="menuitem"
                          href={getAdminPath()}
                          prefetch
                          onClick={() => setUserMenuOpen(false)}
                          className="interactive-press w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors cursor-pointer"
                        >
                          <Shield className="size-4 shrink-0" />
                          Quản trị
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 p-1.5 mt-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="interactive-press w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="size-4 shrink-0" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/login"
                  prefetch
                  className="interactive-press px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-md"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  prefetch
                  className="interactive-press px-5 py-2 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full transition-all font-bold text-sm shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="interactive-press md:hidden p-2 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <Menu className="size-5.5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 text-left animate-fade-in">
            <Link 
              href="/#tours"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileItemClass}
            >
              Tours
            </Link>
            <Link
              href="/hotel"
              prefetch
              onClick={() => setMobileMenuOpen(false)}
              className={mobileItemClass}
            >
              Khách sạn
            </Link>
            {canAccessSupportInbox(user?.role) ? (
              <Link
                href="/employee/support"
                prefetch
                onClick={() => setMobileMenuOpen(false)}
                className={`${mobileItemClass} inline-flex items-center gap-2`}
              >
                <MessageSquare className="size-4" />
                Hỗ trợ
              </Link>
            ) : null}
            <Link
              href="/favorites"
              prefetch
              onClick={() => setMobileMenuOpen(false)}
              className={`${mobileItemClass} inline-flex items-center gap-2`}
            >
              <Heart className="size-4" />
              Yêu thích
            </Link>

            <div className="px-3 py-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Xem thêm</p>
              <div className="flex flex-col gap-1">
                {moreItems.map(({ label, icon: Icon, href }) => (
                  <Link
                    key={href}
                    href={href}
                    prefetch
                    onClick={() => setMobileMenuOpen(false)}
                    className="interactive-press flex items-center gap-3 px-2 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <span className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                      <Icon className="size-3.5" />
                    </span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {user?.role === 'admin' && (
              <Link 
                href="/#partners"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileItemClass}
              >             
                Đối tác
              </Link>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
              {user ? (
                <div className="flex flex-col gap-1">
                  <div className="px-3 py-2 flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-blue-500" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold border-2 border-blue-500 select-none">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    prefetch
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${mobileItemClass} flex items-center gap-3`}
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard / Hồ sơ
                  </Link>
                  <Link
                    href="/dashboard"
                    prefetch
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${mobileItemClass} flex items-center gap-3`}
                  >
                    <History className="size-4" />
                    Lịch sử đặt tour
                  </Link>
                  <Link
                    href="/favorites"
                    prefetch
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${mobileItemClass} flex items-center gap-3`}
                  >
                    <Heart className="size-4" />
                    Yêu thích
                  </Link>
                  {canAccessAdmin && (
                    <Link
                      href={getAdminPath()}
                      prefetch
                      onClick={() => setMobileMenuOpen(false)}
                      className={`${mobileItemClass} flex items-center gap-3`}
                    >
                      <Shield className="size-4" />
                      Quản trị
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className={`${mobileItemClass} flex items-center gap-3 text-red-500`}
                  >
                    <LogOut className="size-4" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-3">
                  <Link
                    href="/login"
                    prefetch
                    onClick={() => setMobileMenuOpen(false)}
                    className="interactive-press flex-1 py-2 text-center text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750 rounded-full"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    prefetch
                    onClick={() => setMobileMenuOpen(false)}
                    className="interactive-press flex-1 py-2 text-center text-sm font-bold text-white bg-blue-900 dark:bg-blue-600 rounded-full"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}