"use client";

import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  heroContent?: React.ReactNode;
  showHero?: boolean;
}

export function AuthLayout({ children, heroContent, showHero = true }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-300 ${
        theme === 'dark' ? 'dark text-white' : 'text-slate-900'
      }`}
    >
      {/* Theme Toggle */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="size-5 text-yellow-400" />
          ) : (
            <Moon className="size-5" />
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-2 min-h-screen lg:min-h-[680px]">
        {/* Hero Section - Hidden on mobile */}
        {showHero && heroContent && (
          <div className="hidden lg:block relative min-h-[680px]">
            {heroContent}
          </div>
        )}

        {/* Form Section */}
        <div className="flex items-center justify-center w-full p-4 sm:p-8 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      {/* Title */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-semibold">
            {subtitle}
          </p>
        )}
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-100/40 dark:border-slate-800/40">
        {children}
      </div>
    </div>
  );
}

interface AuthInputProps {
  label: string;
  children: React.ReactNode;
}

export function AuthInput({ label, children }: AuthInputProps) {
  return (
    <div className="text-left">
      <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-550 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

interface HeroSectionProps {
  imageUrl: string;
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string }>;
}

export function HeroSection({ imageUrl, title, description, stats }: HeroSectionProps) {
  return (
    <>
      <img src={imageUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative z-10 flex flex-col justify-between p-8 sm:p-12 text-white h-full">
        <div>
          <span className="text-base sm:text-lg font-semibold opacity-80">CMC Travel</span>
        </div>

        <div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-3 sm:mb-4">
            {title}
          </h1>
          <p className="max-w-md text-sm sm:text-base opacity-90">{description}</p>
        </div>

        {stats && stats.length > 0 && (
          <div className="flex gap-6 sm:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-2xl sm:text-3xl font-black">{stat.value}</div>
                <div className="text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

interface AuthFooterProps {
  question: string;
  linkText: string;
  linkHref: string;
  showBackLink?: boolean;
}

export function AuthFooter({ question, linkText, linkHref, showBackLink = true }: AuthFooterProps) {
  return (
    <>
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-455 font-bold">
          {question}{' '}
          <Link
            href={linkHref}
            className="text-blue-600 dark:text-blue-400 hover:underline font-extrabold ml-1"
          >
            {linkText}
          </Link>
        </p>
      </div>

      {showBackLink && (
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 dark:text-slate-500 hover:underline font-bold"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      )}
    </>
  );
}
