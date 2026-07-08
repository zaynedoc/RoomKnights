"use client";

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { InfoTooltip } from '../../../components/InfoTooltip';
import { Award } from 'lucide-react';

export default function AccountabilityPage() {
  const {
    roommates,
    chores,
    activeUserId,
    handleToggleGroupLeader,
    handleNudgeRoommate,
    auditLogs
  } = useApp();

  const activeUserObj = roommates.find(r => r.id === activeUserId);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Leaderboard */}
        <div className="section-card">
          <h2 className="section-card-title">
            Score Standings
            <InfoTooltip text="Total points accumulated by each roommate from completed chores and shared purchases." direction="down" />
          </h2>

          <div className="space-y-2.5 pt-2">
            {[...roommates]
              .sort((a, b) => b.score - a.score)
              .map((rm, idx) => (
                <div
                  key={rm.id}
                  className="p-3 rounded-2xl bg-[var(--card-bg)]/60 border border-[var(--border-color)] flex items-center justify-between theme-transition-bg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[var(--text-muted)] w-4">
                      #{idx + 1}
                    </span>
                    {/* Initials Avatar */}
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0`}>
                      {rm.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--foreground)]">{rm.name.split(' ')[0]}</h4>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {rm.choresCompleted} complete
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {idx === 0 && <Award size={14} className="accent-text" />}
                    <span className="text-xs font-bold font-mono accent-text px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--gold-bg) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--gold-bg) 20%, transparent)' }}>
                      {rm.score} pts
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Overdue alert and nudges */}
        <div className="lg:col-span-2 section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">
              Accountability Panel
              <InfoTooltip text="Enforce chore completion. Roommates can send friendly notifications for overdue duties." direction="down" />
            </h2>
            <div className="text-xs text-[var(--text-muted)] bg-[var(--input-bg)] border border-[var(--border-color)] px-3 py-1 rounded-xl theme-transition-bg">
              Leader: <strong className="accent-text">{roommates.find(r => r.isGroupLeader)?.name.split(' ')[0] || 'None'}</strong>
            </div>
          </div>

          <div className="space-y-3">
            {roommates
              .filter(r => r.id !== activeUserId)
              .map((rm) => {
                const rmChores = chores.filter(c => c.assignedTo === rm.id && !c.completed);
                const isOverdue = rmChores.some(c => c.missed);

                return (
                  <div
                    key={rm.id}
                    className={`p-4 rounded-2xl bg-[var(--card-bg)]/60 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 theme-transition-bg ${
                      isOverdue ? 'border-rose-900/60 bg-rose-950/5' : 'border-[var(--border-color)]'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${rm.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0 mt-1`}>
                        {rm.initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
                          <span className="truncate">{rm.name}</span>
                          {isOverdue && (
                            <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 animate-pulse">
                              Overdue
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          {rmChores.length === 0 ? 'All tasks complete' : `${rmChores.length} pending`}
                        </p>
                        {rmChores.length > 0 && (
                          <div className="text-[9px] text-[var(--text-muted)] font-mono mt-1 truncate">
                            Active: {rmChores.map(c => `"${c.title}"`).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {activeUserObj?.isGroupLeader && (
                        <button
                          onClick={() => handleToggleGroupLeader(rm.id)}
                          className="text-[10px] bg-[var(--input-bg)] hover:bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--border-color)] px-2.5 py-1.5 rounded-xl transition-all theme-transition-bg"
                        >
                          Make Leader
                        </button>
                      )}

                      {rmChores.length > 0 && (
                        <button
                          onClick={() => handleNudgeRoommate(rm.id, rmChores[0].title)}
                          className={`text-[10px] px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                            isOverdue ? 'btn-primary-gold' : 'bg-[var(--input-bg)] text-[var(--foreground)] border border-[var(--border-color)] theme-transition-bg'
                          }`}
                        >
                          Send Nudge
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

      {/* Systemic Audit Logs List */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            Systemic Audit Logs
            <InfoTooltip text="Transparent audit trail logging all systemic changes, chore actions, and supply logs." />
          </h2>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] font-medium">
              No logs logged yet
            </div>
          ) : (
            auditLogs.map((log) => {
              let badgeColor = 'bg-[var(--input-bg)] text-[var(--foreground)] border border-[var(--border-color)]';
              if (log.actionType === 'chore') badgeColor = 'indicator-badge-success';
              else if (log.actionType === 'supply') badgeColor = 'indicator-badge-alert';
              else if (log.actionType === 'expense') badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';

              return (
                <div key={log.id} className="p-3 rounded-2xl bg-[var(--card-bg)]/40 border border-[var(--border-color)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs theme-transition-bg">
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0 ${badgeColor}`}>
                      {log.actionType}
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">{log.text}</span>
                  </div>
                  <span className="text-[9px] text-[var(--text-muted)] shrink-0 font-mono font-semibold">{log.timestamp}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
