'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Flame,
  Bell,
  Globe,
  ChevronDown,
  Menu,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  user?: {
    fullName: string;
    targetScore?: number;
    email?: string;
    role?: string;
  } | null;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  onOpenAuthModal,
  onLogout,
  user,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-8 dark:border-slate-800 dark:bg-slate-900/90">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-64 sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học, đề thi..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500"
          />
        </div>
      </div>

      {/* Right: Actions, Streak, Notifications, User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
          <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
          <span>12 Ngày</span>
        </div>

        {/* Language Selector */}
        <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 md:flex dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
          <Globe className="h-3.5 w-3.5 text-slate-500" />
          <span>VIE</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </div>

        {/* Notification Bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Thông báo"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Divider */}
        <div className="hidden h-6 w-[1px] bg-slate-200 sm:block dark:bg-slate-800" />

        {/* User Profile or Login Trigger */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Tùy chọn tài khoản"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="hidden flex-col text-left sm:flex">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {user.fullName}
                </span>
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  Target: {user.targetScore || 700} TOEIC
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-slate-400 transition-transform duration-200',
                  dropdownOpen && 'rotate-180',
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 dark:border-slate-800 dark:bg-slate-900">
                {/* User info header */}
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {user.fullName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user.email || 'Học viên TOEIC'}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    <Target className="h-3 w-3" />
                    <span>Mục tiêu: {user.targetScore || 700} điểm</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-1 flex flex-col gap-0.5">
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>Hồ sơ học tập</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500 active:scale-95"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
};
