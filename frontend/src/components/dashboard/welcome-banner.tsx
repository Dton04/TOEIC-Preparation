'use client';

import React from 'react';
import { ArrowRight, Sparkles, LogIn } from 'lucide-react';

interface WelcomeBannerProps {
  userName?: string | null;
  progressPercent?: number;
  isLoggedIn?: boolean;
  onStartExam?: () => void;
  onOpenAuthModal?: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName,
  progressPercent = 78,
  isLoggedIn = true,
  onStartExam,
  onOpenAuthModal,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-md shadow-blue-500/10 sm:p-7">
      {/* Decorative Background Shapes */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-32 h-36 w-36 rounded-full bg-indigo-400/20 blur-xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Left Column: Greeting & Progress */}
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Lộ trình thông minh
            </span>
            {isLoggedIn ? (
              <span className="text-xs font-semibold text-blue-200">
                {progressPercent}% hoàn thành
              </span>
            ) : (
              <span className="text-xs font-semibold text-blue-200">
                Chuẩn cấu trúc ETS 2026
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {isLoggedIn && userName
              ? `Chào buổi sáng, ${userName}! 👋`
              : 'Chào mừng bạn đến với TOEIC Master! 👋'}
          </h1>

          <p className="text-xs leading-relaxed text-blue-100 sm:text-sm">
            {isLoggedIn
              ? `Bạn đang đi đúng lộ trình ${progressPercent}% chặng đường. Hãy hoàn thành 3 mục tiêu hôm nay để giữ vững chuỗi học tập 12 ngày nhé!`
              : 'Trải nghiệm thi thử 200 câu hỏi chuẩn đề ETS, phát hiện bẫy đề thi và nhận giải thích chi tiết từ gia sư AI thông minh.'}
          </p>
        </div>

        {/* Right Column: CTA Button */}
        <div className="flex items-center">
          {isLoggedIn ? (
            <button
              onClick={onStartExam}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-5 py-3 text-xs font-bold text-blue-700 shadow-md shadow-slate-900/10 transition-all hover:bg-blue-50 hover:shadow-lg active:scale-95 sm:text-sm"
            >
              <span>Luyện đề ngay</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-5 py-3 text-xs font-bold text-blue-700 shadow-md shadow-slate-900/10 transition-all hover:bg-blue-50 hover:shadow-lg active:scale-95 sm:text-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>Đăng nhập ngay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
