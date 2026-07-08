"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { InfoTooltip } from '../../../components/InfoTooltip';
import { AlertTriangle, DollarSign, CheckSquare } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const {
    roommates,
    chores,
    supplies,
    activeUserId,
    themeMode,
    accessibilityMode
  } = useApp();

  const activeUserObj = roommates.find(r => r.id === activeUserId);
  const userChores = chores.filter(c => c.assignedTo === activeUserId && !c.completed);
  const totalCompletedChores = chores.filter(c => c.completed).length;
  const householdScore = Math.round((totalCompletedChores / (chores.length || 1)) * 100);

  const totalHouseholdSpent = roommates.reduce((acc, curr) => acc + curr.expensesSpent, 0);
  const avgHouseholdSpent = totalHouseholdSpent / (roommates.length || 1);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Supply inventory alert warning */}
      {supplies.some(s => s.status === 'out') && (
        <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border theme-transition-bg ${
          themeMode === 'light' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-950/10 border-rose-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-rose-500 shrink-0" size={18} />
            <div>
              <span className="font-bold text-xs text-[var(--foreground)]">Inventory Warning</span>
              <p className={`text-[11px] mt-0.5 ${themeMode === 'light' ? 'text-rose-700' : 'text-rose-300'}`}>
                Supply item "{supplies.find(s => s.status === 'out')?.name}" is out of stock. Assign buyer to restock.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/supplies')}
            className="text-[10px] px-3.5 py-1.5 rounded-xl font-bold transition-all btn-primary-gold"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Stats 1: Cleanliness progress */}
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Chore Completion</span>
              <span className="text-2xl font-black text-[var(--foreground)] font-mono">{householdScore}%</span>
            </div>
            <div className="relative w-12 h-12">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" fill="transparent" stroke={themeMode === 'light' ? '#e4e4e7' : '#1f1f23'} strokeWidth="4" />
                <circle cx="24" cy="24" r="20" fill="transparent" stroke={accessibilityMode === 'high-contrast' ? (themeMode === 'light' ? '#000000' : '#ffffff') : '#fbbf24'} strokeWidth="4"
                  strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * householdScore) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--foreground)]">
                {totalCompletedChores}/{chores.length}
              </div>
            </div>
          </div>
        </div>

        {/* Stats 2: Expenditure Balance */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Budget Status</span>
              <span className="text-2xl font-black text-[var(--foreground)] font-mono block">
                ${activeUserObj ? ((activeUserObj.expensesSpent - avgHouseholdSpent) >= 0 ? '+' : '') + (activeUserObj.expensesSpent - avgHouseholdSpent).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeUserObj && (activeUserObj.expensesSpent - avgHouseholdSpent) >= 0 ? 'indicator-badge-success' : 'indicator-badge-alert'}`}>
              <DollarSign size={18} />
            </div>
          </div>
        </div>

        {/* Stats 3: Tasks count */}
        <div className="section-card">
          <div className="section-card-header">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">Your Pending Chores</span>
              <span className="text-2xl font-black text-[var(--foreground)] font-mono">{userChores.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] flex items-center justify-center accent-text theme-transition-bg">
              <CheckSquare size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Roommate Standings & Contribution Board */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            Roommate Standings
            <InfoTooltip text="Gamified leaderboard tracking roommates by completed chores and household expenditures." direction="down" />
          </h2>
          <div className="text-xs text-[var(--text-muted)] bg-[var(--input-bg)] border border-[var(--border-color)] px-3 py-1.5 rounded-xl theme-transition-bg shrink-0">
            Leader: <strong className="accent-text">{roommates.find(r => r.isGroupLeader)?.name.split(' ')[0] || 'None'}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roommates.map((rm) => (
            <div
              key={rm.id}
              className={`p-4 rounded-2xl bg-[var(--card-bg)]/40 border border-[var(--border-color)]/60 flex items-center justify-between theme-transition-bg ${
                rm.id === activeUserId ? 'ring-1 bg-[var(--input-bg)]/10' : ''
              }`}
              style={rm.id === activeUserId ? { '--tw-ring-color': 'color-mix(in srgb, var(--gold-bg) 50%, transparent)' } as React.CSSProperties : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm`}>
                  {rm.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <span className="truncate">{rm.name}</span>
                    {rm.isGroupLeader && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded shrink-0 font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--gold-bg) 10%, transparent)', color: 'var(--gold-text)', border: '1px solid color-mix(in srgb, var(--gold-bg) 25%, transparent)' }}>
                        Lead
                      </span>
                    )}
                  </h3>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                    {rm.choresCompleted} tasks complete • Spent ${rm.expensesSpent.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] text-[var(--text-muted)] block">Score</span>
                <span className={`text-xs font-mono font-bold ${rm.score > 70 ? 'accent-text' : 'text-[var(--text-muted)]'}`}>
                  {rm.score} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
