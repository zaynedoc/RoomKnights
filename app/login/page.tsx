"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { UserCheck, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const {
    activeUserId,
    roommates,
    themeMode,
    accessibilityMode,
    handleLogin,
    handleResetData
  } = useApp();

  // If user is already logged in, redirect them to dashboard
  useEffect(() => {
    if (activeUserId) {
      router.push('/dashboard');
    }
  }, [activeUserId, router]);

  const onLogin = (id: string) => {
    handleLogin(id);
    router.push('/dashboard');
  };

  return (
    <div className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6 relative overflow-hidden ${accessibilityMode} ${themeMode === 'light' ? 'theme-light' : ''} theme-transition-bg`}>
      {/* Abstract Gold Background Glow elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl relative z-10 shadow-2xl space-y-6 theme-transition-bg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-wider text-[var(--foreground)]">
            ROOM<span style={{ color: 'var(--gold-text)' }}>KNIGHTS</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
            UCF Roommate Portal for Chores, Joint Purchases, and Task Accountability.
          </p>
        </div>

        <div className="space-y-4">
          <span className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest text-center">
            Select Profile to Log In
          </span>

          <div className="space-y-2.5">
            {roommates.map((rm) => (
              <button
                key={rm.id}
                onClick={() => onLogin(rm.id)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-color)] hover:border-amber-400/60 hover:bg-[var(--background)] hover:shadow-[0_0_15px_rgba(245,158,11,0.06)] transition-all duration-200 group text-left theme-transition-bg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-sm text-white shadow-inner`}>
                    {rm.initials}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:accent-text transition-colors">
                      {rm.name}
                    </h3>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      {rm.role}
                    </span>
                  </div>
                </div>
                <UserCheck size={16} className="text-neutral-600 group-hover:accent-text transition-colors" />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
          <span className="text-[10px] text-[var(--text-muted)]">CAP 3104 Project Simulation</span>
          <button
            onClick={handleResetData}
            className="text-[10px] text-[var(--text-muted)] hover:accent-text flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={10} /> Reset Data State
          </button>
        </div>
      </div>
    </div>
  );
}
