'use client';

import React from 'react';
import { Target, Trophy, Flame, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  subtext?: string;
  icon: typeof Target;
  iconColor: string;
  iconBg: string;
  badge?: {
    text: string;
    isPositive?: boolean;
  };
}

const defaultStats: StatItem[] = [
  {
    id: 'current-score',
    label: 'Điểm hiện tại',
    value: 545,
    unit: 'TOEIC',
    subtext: '+25 điểm so với tuần trước',
    icon: Target,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    badge: { text: '+25đ', isPositive: true },
  },
  {
    id: 'target-score',
    label: 'Mục tiêu',
    value: 700,
    unit: 'TOEIC',
    subtext: 'Còn 155 điểm để về đích',
    icon: Trophy,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    badge: { text: 'Target 700' },
  },
  {
    id: 'streak-days',
    label: 'Chuỗi liên tục',
    value: 12,
    unit: 'Ngày',
    subtext: 'Kỷ lục cá nhân tốt nhất',
    icon: Flame,
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-950/50',
    badge: { text: 'Top 5%', isPositive: true },
  },
  {
    id: 'vocab-learned',
    label: 'Từ vựng đã học',
    value: 328,
    unit: 'Từ',
    subtext: '+14 từ vựng mới hôm nay',
    icon: BookMarked,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    badge: { text: 'SRS Active' },
  },
];

interface StatsRowProps {
  stats?: StatItem[];
  className?: string;
}

export const StatsRow: React.FC<StatsRowProps> = ({
  stats = defaultStats,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>

              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {stat.unit}
                </span>
              </div>

              {stat.subtext && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {stat.subtext}
                </span>
              )}
            </div>

            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                stat.iconBg,
              )}
            >
              <Icon className={cn('h-6 w-6', stat.iconColor)} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
