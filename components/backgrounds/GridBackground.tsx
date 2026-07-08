"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  speed?: number;
  accentColor?: string;
}

interface Square {
  id: number;
  pos: [number, number];
}

function generateSquares(count: number, w: number, h: number, cellW: number, cellH: number): Square[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    pos: [
      Math.floor((Math.random() * w) / cellW),
      Math.floor((Math.random() * h) / cellH),
    ] as [number, number],
  }));
}

export function GridBackground({ speed = 1, accentColor = "#fbbf24" }: Props) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const cellW = 40, cellH = 40, numSquares = 40;

  const [squares, setSquares] = useState<Square[]>([]);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares, dimensions.width, dimensions.height, cellW, cellH));
    }
  }, [dimensions]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const duration = Math.max(0.5, 4 / speed);

  function updateSquare(id: number) {
    setSquares((prev) =>
      prev.map((sq) =>
        sq.id === id
          ? {
              ...sq,
              pos: [
                Math.floor((Math.random() * dimensions.width) / cellW),
                Math.floor((Math.random() * dimensions.height) / cellH),
              ] as [number, number],
            }
          : sq
      )
    );
  }

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none"
    >
      <defs>
        <pattern id={id} width={cellW} height={cellH} patternUnits="userSpaceOnUse">
          <path
            d={`M.5 ${cellH}V.5H${cellW}`}
            fill="none"
            stroke={`${accentColor}28`}
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg className="overflow-visible">
        {squares.map(({ pos: [x, y], id: sqId }, index) => (
          <motion.rect
            key={`${x}-${y}-${sqId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.05,
              repeatType: "reverse",
            }}
            onAnimationComplete={() => updateSquare(sqId)}
            width={cellW - 1}
            height={cellH - 1}
            x={x * cellW + 1}
            y={y * cellH + 1}
            fill={accentColor}
            fillOpacity={0.07}
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}
