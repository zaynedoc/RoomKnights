"use client";

import { useEffect, useRef } from "react";

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.10 + Math.random() * 0.12,
    hue: 40 + Math.random() * 20, // warm gold range by default
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

interface Props {
  speed?: number; // multiplier, 1 = normal
  accentColor?: string; // hex, e.g. "#fbbf24"
}

export function BeamsBackground({ speed = 1, accentColor = "#fbbf24" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);
  const speedRef = useRef(speed);
  const accentRef = useRef(accentColor);

  // Keep refs updated without restarting the animation loop
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { accentRef.current = accentColor; }, [accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BEAM_COUNT = 28;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      beamsRef.current = Array.from({ length: BEAM_COUNT }, () =>
        createBeam(window.innerWidth, window.innerHeight)
      );
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    function hexToHsl(hex: string): number {
      // Return approximate hue from hex string
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0;
      if (max !== min) {
        const d = max - min;
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
      }
      return Math.round(h * 360);
    }

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      if (!canvas) return beam;
      const column = index % 3;
      const spacing = canvas.width / (3 * (window.devicePixelRatio || 1));
      beam.y = window.innerHeight + 100;
      beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 80 + Math.random() * 100;
      beam.speed = (0.5 + Math.random() * 0.5) * speedRef.current;
      beam.hue = hexToHsl(accentRef.current) + (index * 20) / totalBeams - 10;
      beam.opacity = 0.12 + Math.random() * 0.10;
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam, hue: number) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);
      const pulsingOpacity = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2);
      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0)`);
      gradient.addColorStop(0.1, `hsla(${hue}, 80%, 60%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(0.4, `hsla(${hue}, 80%, 60%, ${pulsingOpacity})`);
      gradient.addColorStop(0.6, `hsla(${hue}, 80%, 60%, ${pulsingOpacity})`);
      gradient.addColorStop(0.9, `hsla(${hue}, 80%, 60%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(30px)";
      // Compute accent hue once per frame from the ref so color changes are instant
      const baseHue = hexToHsl(accentRef.current);
      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed * speedRef.current;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }
        // Per-beam hue offset for subtle variety; base always follows accent
        const beamHue = baseHue + (index * 20) / totalBeams - 10;
        drawBeam(ctx, beam, beamHue);
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ filter: "blur(10px)" }}
    />
  );
}
