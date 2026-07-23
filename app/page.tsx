"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BellRing,
  Check,
  ClipboardCheck,
  Moon,
  PackageCheck,
  Sun,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { accessibilityMode, themeMode, setThemeMode } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const nextValue = window.scrollY > 40;
      setIsScrolled((currentValue) => currentValue === nextValue ? currentValue : nextValue);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className={`rk-landing ${accessibilityMode} ${themeMode === 'light' ? 'theme-light' : ''} theme-transition-bg`}>
      <div className="rk-nav-shell">
        <nav className={`rk-nav ${isScrolled ? 'rk-nav-scrolled' : ''}`} aria-label="Public navigation">
          <Link href="/" className="rk-wordmark" aria-label="RoomKnights home">
            ROOM<span>KNIGHTS</span>
          </Link>
          <div className="rk-nav-links">
            <a href="#preview">Preview</a>
            <a href="#demo-route">Demo and deploy</a>
          </div>
          <div className="rk-nav-actions">
            <button
              type="button"
              className="rk-theme-toggle"
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              aria-label={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {themeMode === 'light' ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
            </button>
            <Link href="/login" className="rk-demo-action">Open demo <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </nav>
      </div>

      <section className="rk-hero" aria-labelledby="landing-title">
        <div className="rk-hero-copy">
          <p className="rk-overline">RoomKnights · Shared home coordination</p>
          <h1 id="landing-title">Roommates, on the same page.</h1>
          <p>
            RoomKnights puts chores, supply runs, and the occasional nudge in one shared space. Pick a demo roommate, look over the week, and see what the household needs next.
          </p>
          <div className="rk-hero-actions">
            <Link href="/login" className="rk-primary-action">Try the demo <ArrowRight size={16} aria-hidden="true" /></Link>
            <a href="#preview" className="rk-secondary-action">Browse the preview</a>
          </div>
          <p className="rk-course-note">CAP 3104 (HCI Foundations) student group project at UCF, made for university roommate groups anywhere.</p>
        </div>
      </section>

      <section id="preview" className="rk-preview" aria-labelledby="preview-title">
        <div className="rk-section-copy">
          <p className="rk-overline">A closer look</p>
          <h2 id="preview-title">One home view for the whole week.</h2>
          <p>A smaller version of the current RoomKnights workspace, with only the details a roommate needs at a glance.</p>
        </div>

        <div className="rk-demo-window" aria-label="RoomKnights portal preview">
          <div className="rk-demo-window-header">
            <span className="rk-demo-window-brand">ROOM<span>KNIGHTS</span></span>
            <div className="rk-demo-window-tabs"><span className="is-active">Dashboard</span><span>Chores</span><span>Supplies</span></div>
            <span className="rk-demo-portal-user">AJ</span>
          </div>
          <div className="rk-demo-window-body">
            <aside className="rk-demo-window-rail">
              <span className="is-active">Overview</span>
              <span>My chores</span>
              <span>Household</span>
            </aside>
            <div className="rk-demo-dashboard">
              <div className="rk-demo-dashboard-heading">
                <div><span>This week</span><h3>Good afternoon, AJ.</h3></div>
                <span className="rk-demo-live"><i aria-hidden="true" /> Household is active</span>
              </div>
              <div className="rk-demo-stat-row">
                <div><span>Open chores</span><strong>04</strong></div>
                <div><span>Supply runs</span><strong>02</strong></div>
                <div><span>Updates</span><strong>03</strong></div>
              </div>
              <div className="rk-demo-workspace">
                <section className="rk-demo-panel">
                  <div className="rk-demo-panel-title"><ClipboardCheck size={15} aria-hidden="true" /><strong>Up next</strong></div>
                  <div className="rk-demo-task"><span className="rk-demo-check" /><b>Kitchen reset</b><small>Today</small></div>
                  <div className="rk-demo-task"><span className="rk-demo-check rk-demo-check-done"><Check size={11} aria-hidden="true" /></span><b>Take out recycling</b><small>Done</small></div>
                </section>
                <section className="rk-demo-panel">
                  <div className="rk-demo-panel-title"><PackageCheck size={15} aria-hidden="true" /><strong>Supplies</strong></div>
                  <div className="rk-demo-supply"><span>Dish soap</span><b>Low</b></div>
                  <div className="rk-demo-meter"><i /><i /><i /><i /></div>
                  <button type="button">Claim this run</button>
                </section>
                <section className="rk-demo-panel rk-demo-panel-nudge">
                  <div className="rk-demo-panel-title"><BellRing size={15} aria-hidden="true" /><strong>Accountability</strong></div>
                  <p>Kitchen reset is still open.</p>
                  <span><Check size={11} aria-hidden="true" /> Nudge sent</span>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="demo-route" className="rk-route-section" aria-labelledby="route-title">
        <div>
          <p className="rk-overline">The next route</p>
          <h2 id="route-title">Demo now. Deployed space next.</h2>
        </div>
        <div className="rk-route-options">
          <article><span>Demo</span><strong>Sample household</strong><p>Choose a roommate and explore the current scenario.</p></article>
          <article><span>Deployed</span><strong>Real group space</strong><p>Database-backed accounts and shared household data are planned next.</p></article>
        </div>
      </section>

      <section className="rk-close" aria-labelledby="close-title">
        <div>
          <p className="rk-overline">Free course prototype</p>
          <h2 id="close-title">Enter the sample household.</h2>
        </div>
        <Link href="/login" className="rk-primary-action">Choose a roommate <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <footer className="rk-footer">
        <span>RoomKnights</span>
        <span>CAP 3104 (HCI Foundations)</span>
        <span>University of Central Florida</span>
      </footer>
    </main>
  );
}
