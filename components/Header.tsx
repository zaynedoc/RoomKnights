"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Settings as SettingsIcon,
  LogOut,
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    roommates,
    activeUserId,
    notifications,
    setNotifications,
    notificationsOpen,
    setNotificationsOpen,
    triggerFeedback,
    handleLogout,
    accentColor,
  } = useApp();

  const activeUserObj = roommates.find(r => r.id === activeUserId);

  const navTo = (path: string) => {
    router.push(path);
  };

  const getIsActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = () => {
    handleLogout();
    router.push('/login');
  };

  /** Shared active-tab style using accent CSS variable */
  const activeTabStyle = {
    backgroundColor: 'var(--gold-bg)',
    color: '#000',
    boxShadow: '0 1px 6px var(--shadow-glow)',
  };

  const inactiveTabClass = 'text-[var(--text-muted)] hover:text-[var(--foreground)]';

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border-color)] py-4 px-4 sm:px-6 theme-transition-bg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="shrink-0 cursor-pointer" onClick={() => navTo('/dashboard')}>
          <span className="font-black text-lg tracking-wider text-[var(--foreground)]">
            ROOM<span style={{ color: 'var(--gold-text)' }}>KNIGHTS</span>
          </span>
        </div>

        {/* Navigation Tabs - Centered on Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--input-bg)]/80 p-1.5 rounded-2xl border border-[var(--border-color)] theme-transition-bg">
          {[
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/chores', label: 'Chores' },
            { path: '/supplies', label: 'Supplies & Expenses' },
            { path: '/accountability', label: 'Accountability Logs' },
          ].map(({ path, label }) => (
            <button
              key={path}
              onClick={() => navTo(path)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${getIsActive(path) ? '' : inactiveTabClass}`}
              style={getIsActive(path) ? activeTabStyle : undefined}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right Accessories */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification alert bells */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--foreground)] rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] transition-colors theme-transition-bg"
            >
              <Bell size={14} />
              {notifications.filter(n => !n.read && n.type === 'alert').length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 text-white rounded-full text-[7px] flex items-center justify-center font-bold animate-pulse">
                  {notifications.filter(n => !n.read && n.type === 'alert').length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden z-50 theme-transition-bg">
                <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--foreground)]">Alerts &amp; Nudges</span>
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => n.type === 'alert' ? { ...n, read: true } : n));
                      triggerFeedback('All alerts cleared', 'info');
                    }}
                    className="text-[10px] font-semibold transition-colors"
                    style={{ color: 'var(--gold-text)' }}
                  >
                    Clear unread
                  </button>
                </div>
                <div className="divide-y divide-[var(--border-color)] max-h-60 overflow-y-auto">
                  {notifications.filter(n => n.type === 'alert').length === 0 ? (
                    <div className="p-6 text-center text-xs text-[var(--text-muted)] font-medium">
                      No active alerts or nudges
                    </div>
                  ) : (
                    notifications.filter(n => n.type === 'alert').map((n) => (
                      <div key={n.id} className={`p-3 transition-colors ${n.read ? 'opacity-60' : 'bg-rose-500/5'}`}>
                        <p className="text-[11px] text-[var(--foreground)] leading-relaxed font-semibold">{n.text}</p>
                        <span className="text-[8px] text-[var(--text-muted)] block mt-1">{n.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings cog button */}
          <button
            onClick={() => navTo('/settings')}
            className="p-1.5 rounded-lg border transition-colors theme-transition-bg"
            style={
              getIsActive('/settings')
                ? { backgroundColor: 'var(--gold-bg)', color: '#000', borderColor: 'var(--gold-hover)' }
                : undefined
            }
            title="Settings Options"
          >
            <SettingsIcon size={14} className={getIsActive('/settings') ? '' : 'text-[var(--text-muted)]'} />
          </button>

          {/* Initials Avatar */}
          {activeUserObj && (
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activeUserObj.avatarColor} flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm`}>
              {activeUserObj.initials}
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleSignOut}
            className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] transition-colors theme-transition-bg"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--card-bg)] p-2 flex justify-around text-xs font-semibold theme-transition-bg">
        {[
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/chores', label: 'Chores' },
          { path: '/supplies', label: 'Supplies' },
          { path: '/accountability', label: 'Accountability' },
        ].map(({ path, label }) => (
          <button
            key={path}
            onClick={() => navTo(path)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${getIsActive(path) ? '' : 'text-[var(--text-muted)]'}`}
            style={getIsActive(path) ? activeTabStyle : undefined}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
};
