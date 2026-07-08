"use client";

interface Props {
  accentColor?: string;
}

export function GlowBackground({ accentColor = "#fbbf24" }: Props) {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 100% 70% at 50% -5%, ${accentColor}40, transparent 65%)`,
      }}
    />
  );
}
