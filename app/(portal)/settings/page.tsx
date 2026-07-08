"use client";

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { InfoTooltip } from '../../../components/InfoTooltip';

export default function SettingsPage() {
  const {
    accessibilityMode,
    setAccessibilityMode,
    themeMode,
    setThemeMode,
    busyWeekMode,
    setBusyWeekMode,
    soundEnabled,
    setSoundEnabled,
    handleResetData,
    triggerFeedback
  } = useApp();

  return (
    <div className="section-card max-w-2xl mx-auto space-y-6">
      <div className="section-card-header">
        <h2 className="section-card-title">
          System Options
          <InfoTooltip text="Configure accessibility preferences, toggle simulation features, or modify room details." direction="down" />
        </h2>
      </div>

      <div className="space-y-4 divide-y divide-[var(--border-color)]">
        {/* Setting 1: Busy Week Mode */}
        <div className="pt-4 first:pt-0 flex items-start justify-between gap-4">
          <div className="max-w-md">
            <h3 className="text-xs font-bold text-[var(--foreground)]">Busy Week Mode (Alex's Scenario)</h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Mutes non-essential notifications during exams. Reallocates tasks dynamically.
            </p>
          </div>
          <button
            onClick={() => {
              setBusyWeekMode(!busyWeekMode);
              triggerFeedback(busyWeekMode ? 'Snooze deactivated' : 'Snooze activated', 'info');
            }}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 ${
              busyWeekMode ? 'bg-amber-400' : 'bg-[var(--input-bg)] border border-[var(--border-color)]'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${
              busyWeekMode ? 'transform translate-x-4' : ''
            }`} />
          </button>
        </div>

        {/* Setting 2: Colorblind options */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-md">
            <h3 className="text-xs font-bold text-[var(--foreground)]">Colorblind Filters (Req 10)</h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Modifies highlight overlays and adds explicit symbols/icons to indicators to support colorblind conditions.
            </p>
          </div>

          <div className="bg-[var(--input-bg)] border border-[var(--border-color)] px-3 py-2 rounded-xl shrink-0 theme-transition-bg">
            <select
              value={accessibilityMode}
              onChange={(e) => {
                setAccessibilityMode(e.target.value as any);
                triggerFeedback(`Accessibility set to: ${e.target.value}`, 'info');
              }}
              className="bg-transparent text-xs text-[var(--foreground)] font-bold focus:outline-none cursor-pointer"
            >
              <option value="none" className="bg-[var(--card-bg)] text-[var(--foreground)]">None (UCF Gold)</option>
              <option value="deuteranopia" className="bg-[var(--card-bg)] text-[var(--foreground)]">Deuteranopia</option>
              <option value="protanopia" className="bg-[var(--card-bg)] text-[var(--foreground)]">Protanopia</option>
              <option value="tritanopia" className="bg-[var(--card-bg)] text-[var(--foreground)]">Tritanopia</option>
              <option value="high-contrast" className="bg-[var(--card-bg)] text-[var(--foreground)]">High Contrast</option>
            </select>
          </div>
        </div>

        {/* Setting 3: Audio Feedbacks */}
        <div className="pt-4 flex items-start justify-between gap-4">
          <div className="max-w-md">
            <h3 className="text-xs font-bold text-[var(--foreground)]">Oscillating Tone Feedback</h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Plays responsive audio signals representing completed/warning states for multimodal accessibility.
            </p>
          </div>
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              triggerFeedback(soundEnabled ? 'Audio tones off' : 'Audio tones on', 'info');
            }}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 ${
              soundEnabled ? 'bg-amber-400' : 'bg-[var(--input-bg)] border border-[var(--border-color)]'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${
              soundEnabled ? 'transform translate-x-4' : ''
            }`} />
          </button>
        </div>

        {/* Setting 4: Theme Mode */}
        <div className="pt-4 flex items-start justify-between gap-4">
          <div className="max-w-md">
            <h3 className="text-xs font-bold text-[var(--foreground)]">Theme Mode (Light / Dark)</h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Transitions background and layout colors smoothly over 700ms. Adjust "--theme-transition-speed" in app/globals.css to fine-tune.
            </p>
          </div>
          <button
            onClick={() => {
              const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
              setThemeMode(nextTheme);
              triggerFeedback(`Theme switched to ${nextTheme}`, 'info');
            }}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 ${
              themeMode === 'light' ? 'bg-amber-400' : 'bg-[var(--input-bg)] border border-[var(--border-color)]'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${
              themeMode === 'light' ? 'transform translate-x-4' : ''
            }`} />
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between gap-4 flex-wrap">
        <span className="text-[9px] text-[var(--text-muted)]">
          Data caches automatically inside local browser database (localStorage).
        </span>
        <button
          onClick={handleResetData}
          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold border border-rose-950 px-4 py-2 rounded-xl bg-rose-950/10 transition-colors animate-pulse"
        >
          Clear Caches & Reset
        </button>
      </div>
    </div>
  );
}
