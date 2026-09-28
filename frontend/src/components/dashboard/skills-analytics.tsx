'use client';

import React from 'react';
import { TrendingUp, Award, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SkillsAnalytics: React.FC = () => {
  const examHistory = [
    { label: 'Đề #1', score: 420, height: '45%' },
    { label: 'Đề #2', score: 460, height: '58%' },
    { label: 'Đề #3', score: 490, height: '68%' },
    { label: 'Đề #4', score: 515, height: '76%' },
    { label: 'Đề #5', score: 545, height: '88%', isCurrent: true },
  ];

  const skillBreakdown = [
    {
      skill: 'Nghe hiểu (Listening)',
      percent: 68,
      color: 'bg-blue-600',
    },
    {
      skill: 'Đọc hiểu (Reading)',
      percent: 72,
      color: 'bg-indigo-600',
    },
    {
      skill: 'Ngữ pháp (Grammar)',
      percent: 58,
      color: 'bg-rose-500',
      badge: 'Yếu',
    },
    {
      skill: 'Từ vựng (Vocabulary)',
      percent: 75,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Kết quả & Kỹ năng
        </h2>
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          +55đ tuần này
        </span>
      </div>

      {/* Part 1: Exam Score History Bar Chart */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Lịch sử điểm đề thi thử
          </span>
          <span className="text-[11px] text-slate-400">Gần nhất 5 đề</span>
        </div>

        {/* Mini Bar Chart */}
        <div className="flex h-32 items-end justify-between gap-3 pt-4 px-2">
          {examHistory.map((item) => (
            <div key={item.label} className="group flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-bold text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-300">
                {item.score}đ
              </span>
              <div className="w-full rounded-t-lg bg-slate-100 relative overflow-hidden dark:bg-slate-800" style={{ height: '100%' }}>
                <div
                  className={cn(
                    'w-full absolute bottom-0 rounded-t-lg transition-all duration-500',
                    item.isCurrent
                      ? 'bg-gradient-to-t from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30'
                      : 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600',
                  )}
                  style={{ height: item.height }}
                />
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium',
                  item.isCurrent
                    ? 'font-bold text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400',
                )}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: Skill Diagnostic Breakdown */}
      <div className="flex flex-col gap-3 pt-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Phân tích kỹ năng
        </span>

        <div className="flex flex-col gap-3">
          {skillBreakdown.map((item) => (
            <div key={item.skill} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {item.skill}
                  </span>
                  {item.badge && (
                    <span className="flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.2 text-[10px] font-bold text-rose-600 ring-1 ring-inset ring-rose-500/20 dark:bg-rose-950/50 dark:text-rose-400">
                      <AlertCircle className="h-2.5 w-2.5" />
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {item.percent}%
                </span>
              </div>

              {/* Progress track */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', item.color)}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
