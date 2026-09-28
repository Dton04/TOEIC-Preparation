'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { StatsRow } from '@/components/dashboard/stats-card';
import { DailyTasks } from '@/components/dashboard/daily-tasks';
import { SkillsAnalytics } from '@/components/dashboard/skills-analytics';
import { RecommendedSection } from '@/components/dashboard/recommended-cards';
import { AuthModal } from '@/components/auth/auth-modal';

interface UserProfile {
  id?: string;
  fullName: string;
  email?: string;
  targetScore?: number;
  role?: string;
}

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Khôi phục trạng thái user hoặc tiếp nhận token từ Google OAuth Callback
  useEffect(() => {
    try {
      // 1. Tiếp nhận token từ Google OAuth redirect nếu có
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');
        const userParam = params.get('user');

        if (token && refreshToken && userParam) {
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', userParam);
          setUser(JSON.parse(userParam));

          // Xóa search params trên URL để thanh địa chỉ sạch sẽ
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsClientLoaded(true);
          return;
        }
      }

      // 2. Khôi phục từ localStorage nếu đã đăng nhập trước đó
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore
    } finally {
      setIsClientLoaded(true);
    }
  }, []);

  // Xử lý đăng xuất tài khoản
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex shrink-0" />

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-64 flex-col bg-slate-900 shadow-2xl">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        {/* Topbar: Hiển thị Đăng nhập hoặc Menu Profile + Đăng xuất */}
        <Topbar
          user={isClientLoaded ? user : null}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dashboard Scroll Body */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            {/* 1. Welcome Banner */}
            <WelcomeBanner
              userName={user?.fullName}
              progressPercent={78}
              isLoggedIn={!!user}
              onStartExam={() => {
                alert('Khởi động bài thi thử ETS Full Mock 200 câu!');
              }}
              onOpenAuthModal={() => setAuthModalOpen(true)}
            />

            {/* 2. Key Stats Row */}
            <StatsRow />

            {/* 3. Middle Grid: Daily Practice & Skills Analytics */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <DailyTasks />
              </div>
              <div className="lg:col-span-5">
                <SkillsAnalytics />
              </div>
            </div>

            {/* 4. AI Personalized Recommendations */}
            <RecommendedSection />
          </div>
        </main>
      </div>

      {/* Auth Modal (Login / Register / Google OAuth) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(newUser) => setUser(newUser)}
      />
    </div>
  );
}
