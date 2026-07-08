"use client";

interface Props {
  accentColor?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function DotBackground({ accentColor = "#fbbf24" }: Props) {
  const dotColor = hexToRgba(accentColor, 0.18);
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: "18px 18px",
      }}
    />
  );
}
