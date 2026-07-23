"use client";

import React from 'react';
import { useApp } from '../../../context/AppContext';
import { InfoTooltip } from '../../../components/InfoTooltip';
import { Check, Eye, Sun, Moon, Zap, Grid, Sparkles, Dot, Ban } from 'lucide-react';

type BgType = 'none' | 'beams' | 'grid' | 'glow' | 'dots';

const BG_OPTIONS: { id: BgType; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'none', label: 'None', icon: <Ban size={16} />, desc: 'Clean solid background' },
  { id: 'beams', label: 'Beams', icon: <Zap size={16} />, desc: 'Animated light beams' },
  { id: 'grid', label: 'Grid', icon: <Grid size={16} />, desc: 'Animated grid cells' },
  { id: 'glow', label: 'Glow', icon: <Sparkles size={16} />, desc: 'Radial accent glow' },
  { id: 'dots', label: 'Dots', icon: <Dot size={16} />, desc: 'Dot-grid pattern' },
];

type AccessibilityMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'high-contrast';

const ACCESSIBILITY_MODES: { id: AccessibilityMode; label: string; description: string }[] = [
  { id: 'none', label: 'None', description: 'Use the standard UCF Gold palette.' },
  { id: 'deuteranopia', label: 'Deuteranopia', description: 'Use blue and amber status cues.' },
  { id: 'protanopia', label: 'Protanopia', description: 'Use violet and orange status cues.' },
  { id: 'tritanopia', label: 'Tritanopia', description: 'Use pink and orange status cues.' },
  { id: 'high-contrast', label: 'High Contrast', description: 'Maximize text and border contrast.' },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0 ${on ? 'bg-[var(--gold-bg)]' : 'bg-[var(--input-bg)] border border-[var(--border-color)]'
        }`}
    >
      <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${on ? 'translate-x-4' : ''}`} />
    </button>
  );
}

export default function SettingsPage() {
  const {
    accessibilityMode,
    setAccessibilityMode,
    themeMode,
    setThemeMode,
    busyWeekMode,
    setBusyWeekMode,
    handleResetData,
    triggerFeedback,
    accentColor,
    setAccentColor,
    bgType,
    setBgType,
    bgEnabled,
    setBgEnabled,
    bgSpeed,
    setBgSpeed,
  } = useApp();

  const toggleAccessibilityMode = (mode: AccessibilityMode) => {
    const nextMode = accessibilityMode === mode ? 'none' : mode;
    setAccessibilityMode(nextMode);
    triggerFeedback(
      nextMode === 'none' ? 'Accessibility mode reset to UCF Gold' : `${ACCESSIBILITY_MODES.find(option => option.id === nextMode)?.label} mode applied`,
      'info'
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn">

      {/* ── APPEARANCE CARD ─────────────────────────────────── */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            Appearance
            <InfoTooltip text="Personalise the app's look: switch themes, pick an accent color, and choose an animated background." direction="down" />
          </h2>
        </div>

        <div className="space-y-4 divide-y divide-[var(--border-color)]">

          {/* Theme Mode */}
          <div className="settings-option-row" style={{ paddingTop: 0 }}>
            <div className="settings-option-info">
              <h3 className="settings-option-title">Theme Mode</h3>
              <p className="settings-option-desc">Switch between Dark and Light themes.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Moon size={14} className="text-[var(--text-muted)]" />
              <Toggle
                on={themeMode === 'light'}
                onToggle={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              />
              <Sun size={14} className="text-[var(--text-muted)]" />
            </div>
          </div>

          {/* Accent Color */}
          <div className="settings-option-row">
            <div className="settings-option-info">
              <h3 className="settings-option-title">Accent Color</h3>
              <p className="settings-option-desc">
                Adjusts the global highlight color — buttons, badges, points, and background tints.
                Defaults to UCF Gold <code className="text-[var(--gold-text)]">#fbbf24</code>.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Color swatch + native color wheel */}
              <label
                className="w-9 h-9 rounded-xl border-2 cursor-pointer overflow-hidden transition-all hover:scale-105"
                style={{ borderColor: accentColor, backgroundColor: accentColor }}
                title="Open color picker"
              >
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="opacity-0 w-0 h-0 absolute"
                />
              </label>
              <span className="text-[10px] font-mono font-bold text-[var(--foreground)] bg-[var(--input-bg)] border border-[var(--border-color)] px-2 py-1 rounded-lg">
                {accentColor.toUpperCase()}
              </span>
              {accentColor.toLowerCase() !== '#fbbf24' && (
                <button
                  onClick={() => setAccentColor('#fbbf24')}
                  className="text-[9px] font-bold text-[var(--text-muted)] hover:text-[var(--foreground)] border border-[var(--border-color)] px-2 py-1 rounded-lg transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Accessibility modes */}
          <div className="settings-option-row" style={{ flexDirection: 'column', gap: '0.75rem' }}>
            <div className="settings-option-info" style={{ maxWidth: '100%' }}>
              <h3 className="settings-option-title">Colorblind Filters</h3>
              <p className="settings-option-desc">Choose one display mode. Selecting the active mode again returns to the standard palette.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {ACCESSIBILITY_MODES.map((mode) => {
                const isActive = accessibilityMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => toggleAccessibilityMode(mode.id)}
                    className={`relative text-left p-3 rounded-2xl border transition-all theme-transition-bg ${isActive
                      ? 'border-[var(--gold-bg)] bg-[var(--input-bg)] text-[var(--gold-text)]'
                      : 'border-[var(--border-color)] bg-[var(--input-bg)]/60 text-[var(--text-muted)] hover:border-[var(--gold-border)] hover:text-[var(--foreground)]'
                      }`}
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider pr-6">{mode.label}</span>
                    <span className="block text-[9px] mt-1 leading-relaxed">{mode.description}</span>
                    {isActive && <Check size={14} className="absolute right-3 top-3" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <div className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] theme-transition-bg">
              <Eye size={15} className="text-[var(--gold-text)] shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[10px] font-bold text-[var(--foreground)]">Preview: {ACCESSIBILITY_MODES.find(mode => mode.id === accessibilityMode)?.label}</span>
                <span className="text-[9px] text-[var(--text-muted)]">Completed chores use a checkmark. Alerts use an alert icon and label.</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5 shrink-0">
                <span className="indicator-badge-success text-[9px] font-bold px-2 py-1 rounded-lg">Done</span>
                <span className="indicator-badge-alert text-[9px] font-bold px-2 py-1 rounded-lg">Alert</span>
              </div>
            </div>
          </div>

          {/* Background Style Selector */}
          <div className="settings-option-row" style={{ flexDirection: 'column', gap: '0.75rem' }}>
            <div className="settings-option-info" style={{ maxWidth: '100%' }}>
              <h3 className="settings-option-title">Background Style</h3>
              <p className="settings-option-desc">Choose the animated background type. Works when the toggle above is on.</p>
            </div>
            <div className="grid grid-cols-5 gap-2 w-full">
              {BG_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setBgType(opt.id);
                    if (opt.id !== 'none') setBgEnabled(true);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${bgType === opt.id
                    ? 'border-[var(--gold-bg)] bg-[var(--input-bg)] text-[var(--gold-text)]'
                    : 'border-[var(--border-color)] bg-[var(--input-bg)]/60 text-[var(--text-muted)] hover:border-[var(--gold-border)] hover:text-[var(--foreground)]'
                    }`}
                >
                  {opt.icon}
                  <span className="text-[9px] font-bold uppercase tracking-wider">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Speed */}
          <div className="settings-option-row">
            <div className="settings-option-info">
              <h3 className="settings-option-title">Animation Speed</h3>
              <p className="settings-option-desc">Controls how fast animated backgrounds move. Has no effect on static styles (Glow, Dots).</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0 min-w-[140px]">
              <input
                type="range"
                min={0.25}
                max={3}
                step={0.05}
                value={bgSpeed}
                onChange={(e) => setBgSpeed(parseFloat(e.target.value))}
                className="w-full accent-[var(--gold-bg)] cursor-pointer"
                style={{ accentColor: accentColor }}
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-[9px] text-[var(--text-muted)]">Slow</span>
                <span className="text-[9px] font-mono font-bold text-[var(--gold-text)]">{bgSpeed.toFixed(2)}×</span>
                <span className="text-[9px] text-[var(--text-muted)]">Fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SYSTEM OPTIONS CARD ──────────────────────────────── */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            System Options
            <InfoTooltip text="Configure accessibility preferences, toggle simulation features, or modify room details." direction="down" />
          </h2>
        </div>

        <div className="space-y-4 divide-y divide-[var(--border-color)]">
          {/* Busy Week Mode */}
          <div className="settings-option-row" style={{ paddingTop: 0 }}>
            <div className="settings-option-info">
              <h3 className="settings-option-title">Busy Week Mode</h3>
              <p className="settings-option-desc">Mutes non-essential notifications during exams. Reallocates tasks dynamically.</p>
            </div>
            <Toggle
              on={busyWeekMode}
              onToggle={() => {
                setBusyWeekMode(!busyWeekMode);
                triggerFeedback(busyWeekMode ? 'Snooze deactivated' : 'Snooze activated', 'info');
              }}
            />
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
            Clear Caches &amp; Reset
          </button>
        </div>
      </div>
    </div>
  );
}
