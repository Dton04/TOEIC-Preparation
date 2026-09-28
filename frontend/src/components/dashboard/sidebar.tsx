'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  LayoutDashboard,
  Headphones,
  FileCheck2,
  TrendingUp,
  BookMarked,
  Sparkles,
  Settings,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export const navigationItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    name: 'Practice',
    icon: Headphones,
    href: '/practice',
    badge: '7 Parts',
  },
  {
    name: 'Mock Tests',
    icon: FileCheck2,
    href: '/mock-tests',
  },
  {
    name: 'Progress',
    icon: TrendingUp,
    href: '/progress',
  },
  {
    name: 'Vocabulary',
    icon: BookMarked,
    href: '/vocabulary',
    badge: 'SRS',
  },
  {
    name: 'AI Tutor',
    icon: Sparkles,
    href: '/ai-tutor',
    isAi: true,
  },
  {
    name: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath = '/',
  onNavigate,
  className,
}) => {
  return (
    <aside
      className={cn(
        'flex h-screen w-64 flex-col justify-between border-r border-slate-800 bg-slate-900 px-4 py-6 text-white transition-all',
        className,
      )}
    >
      {/* Top: Brand Logo & Navigation */}
      <div className="flex flex-col gap-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white">
              TOEIC Master
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400">
              PREMIUM SAAS
            </span>
          </div>
        </Link>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <button
                key={item.name}
                onClick={() => onNavigate && onNavigate(item.href)}
                className={cn(
                  'group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive
                        ? 'text-blue-500'
                        : 'text-slate-400 group-hover:text-slate-200',
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {isActive && (
                  <div className="h-2 w-2 rounded-full bg-blue-600 shadow-sm shadow-blue-500/50" />
                )}

                {item.badge && !isActive && (
                  <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                    {item.badge}
                  </span>
                )}

                {item.isAi && !isActive && (
                  <span className="flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Pro Upgrade Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-white">
            Học không giới hạn
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Mở khóa kho đề thi thử IELTS/TOEIC chuẩn đề thật kèm giải thích AI.
        </p>
        <button className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500 active:scale-[0.98]">
          Nâng cấp PRO
        </button>
      </div>
    </aside>
  );
};
