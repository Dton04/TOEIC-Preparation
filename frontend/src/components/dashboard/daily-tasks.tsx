'use client';

import React, { useState } from 'react';
import {
  Headphones,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DailyTask {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: typeof Headphones;
  iconColor: string;
  iconBg: string;
  actionText: string;
  completed: boolean;
}

const initialTasks: DailyTask[] = [
  {
    id: 'task-1',
    title: 'Listening Practice - Part 3',
    subtitle: 'Short Conversations · 5 câu hỏi',
    duration: '15 phút',
    icon: Headphones,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    actionText: 'Bắt đầu',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Reading Practice - Part 5',
    subtitle: 'Incomplete Sentences · 10 câu hỏi',
    duration: '10 phút',
    icon: FileText,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    actionText: 'Bắt đầu',
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Vocabulary Review',
    subtitle: '20 từ vựng chủ đề Office & Commerce',
    duration: '5 phút',
    icon: Sparkles,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    actionText: 'Ôn tập',
    completed: true,
  },
];

export const DailyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>(initialTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const completeAll = () => {
    setTasks((prev) => prev.map((t) => ({ ...t, completed: true })));
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Nhiệm vụ hôm nay
          </h2>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            {tasks.filter((t) => !t.completed).length}
          </span>
        </div>

        <button
          onClick={completeAll}
          className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400"
        >
          Đánh dấu hoàn thành tất cả
        </button>
      </div>

      {/* Task List */}
      <div className="mt-4 flex flex-col gap-3">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <div
              key={task.id}
              className={cn(
                'group flex items-center justify-between rounded-xl border p-3.5 transition-all',
                task.completed
                  ? 'border-slate-200/60 bg-slate-50/50 opacity-70 dark:border-slate-800 dark:bg-slate-800/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
              )}
            >
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="text-slate-300 transition hover:text-emerald-500 dark:text-slate-600"
                  title={task.completed ? 'Đánh dấu chưa xong' : 'Hoàn thành'}
                >
                  <CheckCircle2
                    className={cn(
                      'h-5 w-5',
                      task.completed
                        ? 'fill-emerald-500 text-white dark:text-slate-900'
                        : 'text-slate-300 dark:text-slate-600',
                    )}
                  />
                </button>

                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    task.iconBg,
                  )}
                >
                  <Icon className={cn('h-5 w-5', task.iconColor)} />
                </div>

                <div className="flex flex-col">
                  <span
                    className={cn(
                      'text-sm font-semibold text-slate-900 dark:text-white',
                      task.completed && 'line-through text-slate-400 dark:text-slate-500',
                    )}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {task.subtitle}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <Clock className="h-3 w-3" />
                      {task.duration}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  task.completed
                    ? 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/60',
                )}
              >
                <span>{task.actionText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
