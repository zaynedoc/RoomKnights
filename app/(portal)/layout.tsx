"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/Header';
import { AlertTriangle } from 'lucide-react';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    activeUserId,
    themeMode,
    accessibilityMode,
    inlineNotification,
    mounted
  } = useApp();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (mounted && !activeUserId) {
      router.push('/login');
    }
  }, [activeUserId, mounted, router]);

  if (!mounted || !activeUserId) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-amber-400 font-mono">
        <span>LOADING ROOMKNIGHTS PORTAL...</span>
      </div>
    );
  }

  return (
    <div className={`app-layout ${accessibilityMode} ${themeMode === 'light' ? 'theme-light' : ''} theme-transition-bg`}>
      <Header />

      <main className="app-main">
        {/* Inline Feedback Alerts */}
        {inlineNotification && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 animate-fadeIn mb-6 theme-transition-bg ${
            inlineNotification.type === 'alert'
              ? (themeMode === 'light' ? 'bg-rose-500/10 border-rose-500/20 text-rose-800' : 'bg-rose-950/20 border-rose-500/40 text-rose-100')
              : (themeMode === 'light' ? 'bg-amber-500/10 border-amber-500/20 text-amber-900' : 'bg-amber-950/20 border-amber-500/40 text-amber-100')
          }`}>
            <AlertTriangle className={inlineNotification.type === 'alert' ? 'text-rose-500' : 'text-amber-500'} size={18} />
            <span className="text-xs font-semibold">{inlineNotification.text}</span>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
