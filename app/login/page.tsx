"use client";

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, RefreshCw, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (activeUserId) {
      router.push('/dashboard');
    }
  }, [activeUserId, router]);

  const selectedRoommate = useMemo(
    () => roommates.find((roommate) => roommate.id === selectedUserId),
    [roommates, selectedUserId]
  );

  const onLogin = () => {
    if (!selectedUserId) return;
    handleLogin(selectedUserId);
    router.push('/dashboard');
  };

  return (
    <main className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6 relative overflow-hidden ${accessibilityMode} ${themeMode === 'light' ? 'theme-light' : ''} theme-transition-bg`}>
      <section className="max-w-md w-full bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-3xl relative z-10 space-y-6 theme-transition-bg" aria-labelledby="login-title">
        <Link href="/" className="login-public-link inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)] hover:accent-text transition-colors duration-200 whitespace-nowrap">
          <ArrowLeft size={14} aria-hidden="true" /> Back to RoomKnights
        </Link>

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.16em] font-bold accent-text">Prototype demo</p>
          <h1 id="login-title" className="text-3xl font-black tracking-tight text-[var(--foreground)]">Choose a demo roommate.</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            This course prototype uses a sample household. Select a roommate profile to enter the current scenario.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="demo-roommate" className="block text-xs font-bold text-[var(--foreground)]">Demo profile</label>
          <select
            id="demo-roommate"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="select-custom login-demo-select min-h-11"
          >
            <option value="" disabled>Choose a roommate</option>
            {roommates.map((roommate) => (
              <option key={roommate.id} value={roommate.id}>
                {roommate.name} · {roommate.role}
              </option>
            ))}
          </select>
        </div>

        {selectedRoommate && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-color)] theme-transition-bg" aria-live="polite">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${selectedRoommate.avatarColor} flex items-center justify-center font-bold text-sm text-white shadow-inner`}>
              {selectedRoommate.initials}
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--foreground)]">{selectedRoommate.name}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{selectedRoommate.role} in the sample household</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onLogin}
          disabled={!selectedUserId}
          className="btn-primary-gold login-demo-submit w-full min-h-11 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <UserCheck size={16} aria-hidden="true" /> Enter RoomKnights <ArrowRight size={15} aria-hidden="true" />
        </button>

        <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-4">
          <span className="text-[10px] text-[var(--text-muted)]">CAP 3104 project simulation</span>
          <button
            onClick={handleResetData}
            className="login-reset-data text-[10px] text-[var(--text-muted)] hover:accent-text flex items-center gap-1 transition-colors duration-200 whitespace-nowrap"
          >
            <RefreshCw size={10} aria-hidden="true" /> Reset demo data
          </button>
        </div>
      </section>
    </main>
  );
}
