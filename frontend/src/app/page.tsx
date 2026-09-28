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

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<{
    id?: string;
    fullName: string;
    email?: string;
    targetScore?: number;
  } | null>({
    fullName: 'Minh Nguyễn',
    targetScore: 700,
    email: 'minh.nguyen@example.com',
  });

  // Check saved user in localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore
    }
  }, []);

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
        {/* Topbar */}
        <Topbar
          user={user}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        {/* Dashboard Scroll Body */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            {/* 1. Welcome Banner */}
            <WelcomeBanner
              userName={user?.fullName?.split(' ').pop() || 'Minh'}
              progressPercent={78}
              onStartExam={() => {
                alert('Khởi động bài thi thử ETS Full Mock 200 câu!');
              }}
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
