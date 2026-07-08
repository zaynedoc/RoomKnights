"use client";

import React from 'react';

interface InfoTooltipProps {
  text: string;
  direction?: 'up' | 'down';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, direction = 'up' }) => {
  return (
    <span className="group relative inline-flex items-center shrink-0 cursor-help normal-case font-sans">
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-[var(--text-muted)] text-[9px] font-bold text-[var(--text-muted)] hover:text-amber-400 hover:border-amber-400 transition-colors ml-1.5 select-none">
        i
      </span>
      <span className={`absolute left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] text-[10px] font-semibold rounded-xl shadow-2xl z-50 text-center leading-normal tracking-normal theme-transition-bg ${
        direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
      }`}>
        {text}
        {direction === 'up' ? (
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--card-bg)] border-r border-b border-[var(--border-color)] rotate-45 -mt-[3px]" />
        ) : (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--card-bg)] border-l border-t border-[var(--border-color)] rotate-45 -mb-[3px]" />
        )}
      </span>
    </span>
  );
};
