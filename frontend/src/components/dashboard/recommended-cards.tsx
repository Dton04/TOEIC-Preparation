'use client';

import React from 'react';
import {
  AlertTriangle,
  Headphones,
  BookMarked,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Recommendation {
  id: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  title: string;
  type: string;
  duration: string;
  icon: typeof AlertTriangle;
}

const recommendations: Recommendation[] = [
  {
    id: 'rec-1',
    tag: 'Cải thiện ngữ pháp',
    tagColor: 'text-rose-600 dark:text-rose-400',
    tagBg: 'bg-rose-50 dark:bg-rose-950/50',
    title: 'Mẹo tránh bẫy Part 5 - Danh từ ghép',
    type: 'Bài học ngắn',
    duration: '8 phút',
    icon: AlertTriangle,
  },
  {
    id: 'rec-2',
    tag: 'Kỹ năng nghe hiểu',
    tagColor: 'text-blue-600 dark:text-blue-400',
    tagBg: 'bg-blue-50 dark:bg-blue-950/50',
    title: 'Listening Part 3 - Kỹ thuật paraphrase',
    type: 'Bài học ngắn',
    duration: '12 phút',
    icon: Headphones,
  },
  {
    id: 'rec-3',
    tag: 'Từ vựng cốt lõi',
    tagColor: 'text-emerald-600 dark:text-emerald-400',
    tagBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    title: '50 Từ vựng TOEIC về Office Equipment',
    type: 'Flashcards',
    duration: '6 phút',
    icon: BookMarked,
  },
];

export const RecommendedSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Đề xuất học tập dành riêng cho bạn
        </h2>
        <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer dark:text-blue-400">
          Xem tất cả đề xuất
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide',
                      item.tagBg,
                      item.tagColor,
                    )}
                  >
                    {item.tag}
                  </span>

                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-800 dark:group-hover:bg-blue-950/60 dark:group-hover:text-blue-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                  {item.title}
                </h3>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span className="font-medium">{item.type}</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="h-3 w-3" />
                  {item.duration}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
