"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/Header';
import { AlertTriangle } from 'lucide-react';
import { BeamsBackground } from '../../components/backgrounds/BeamsBackground';
import { GridBackground } from '../../components/backgrounds/GridBackground';
import { GlowBackground } from '../../components/backgrounds/GlowBackground';
import { DotBackground } from '../../components/backgrounds/DotBackground';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    activeUserId,
    themeMode,
    accessibilityMode,
    inlineNotification,
    mounted,
    accentColor,
    bgType,
    bgEnabled,
    bgSpeed,
  } = useApp();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (mounted && !activeUserId) {
      router.push('/login');
    }
  }, [activeUserId, mounted, router]);

  if (!mounted || !activeUserId) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono" style={{ color: 'var(--gold-text)' }}>
        <span>LOADING ROOMKNIGHTS PORTAL...</span>
      </div>
    );
  }

  const showBg = bgEnabled && bgType !== 'none';

  return (
    <>
      {/* ── Animated Background Layer ────────────────────────────────────────
          Rendered OUTSIDE app-layout so its fixed positioning isn't clipped
          by app-layout's stacking context or background-color.              */}
      {showBg && (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          {bgType === 'beams' && <BeamsBackground speed={bgSpeed} accentColor={accentColor} />}
          {bgType === 'grid'  && <GridBackground  speed={bgSpeed} accentColor={accentColor} />}
          {bgType === 'glow'  && <GlowBackground  accentColor={accentColor} />}
          {bgType === 'dots'  && <DotBackground   accentColor={accentColor} />}
        </div>
      )}

      {/* ── App Shell ────────────────────────────────────────────────────────
          app-layout--has-bg removes the solid background-color so the
          fixed background above shows through.                              */}
      <div
        className={`app-layout ${showBg ? 'app-layout--has-bg' : ''} ${accessibilityMode} ${themeMode === 'light' ? 'theme-light' : ''} theme-transition-bg`}
        style={{ position: 'relative', zIndex: 1 }}
      >
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
    </>
  );
}
