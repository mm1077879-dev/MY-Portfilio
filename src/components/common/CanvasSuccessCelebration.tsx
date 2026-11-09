import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface CanvasSuccessCelebrationProps {
  show: boolean;
  onComplete?: () => void;
  durationMs?: number;
  title?: string;
  subtitle?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'circle' | 'square' | 'sparkle';
  rotation: number;
  rotationSpeed: number;
}

interface RippleWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const BRAND_PALETTE = [
  '#8B19FF', // Electric purple
  '#00D9FF', // Electric cyan
  '#087BFF', // Deep neon blue
  '#00E69A', // Vibrant emerald
  '#D000FF', // Vivid magenta
  '#F5F5FF', // Crisp star white
];

export const CanvasSuccessCelebration: React.FC<CanvasSuccessCelebrationProps> = ({
  show,
  onComplete,
  durationMs = 3000,
  title = 'Message Sent Successfully!',
  subtitle = 'Thank you for contacting us. Your message has been received.',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);

  useEffect(() => {
    if (!show) {
      setIsFadingOut(false);
      setProgressWidth(100);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Smooth countdown progress bar
    const startTime = performance.now();
    const progressInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgressWidth(remaining);
    }, 40);

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(100, durationMs - 400));

    const completeTimer = setTimeout(() => {
      clearInterval(progressInterval);
      onComplete?.();
    }, durationMs);

    // Canvas Particle Animation
    let animationFrameId: number;
    const canvas = canvasRef.current;

    if (canvas && !prefersReducedMotion) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const originX = width / 2;
        const originY = height / 2;

        // Initialize burst particles
        const particleCount = 85;
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 6.5;
          const shapes: Particle['shape'][] = ['circle', 'square', 'sparkle'];
          particles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.2,
            radius: 2 + Math.random() * 4.5,
            color: BRAND_PALETTE[Math.floor(Math.random() * BRAND_PALETTE.length)],
            alpha: 1,
            decay: 0.008 + Math.random() * 0.012,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.15,
          });
        }

        // Initialize expanding ripple waves
        const waves: RippleWave[] = [
          {
            x: originX,
            y: originY,
            radius: 10,
            maxRadius: Math.min(width, height) * 0.45,
            alpha: 0.8,
            color: '#8B19FF',
          },
          {
            x: originX,
            y: originY,
            radius: 5,
            maxRadius: Math.min(width, height) * 0.4,
            alpha: 0.8,
            color: '#00D9FF',
          },
        ];

        const renderFrame = () => {
          ctx.clearRect(0, 0, width, height);

          // 1. Draw and expand ripple waves
          for (const wave of waves) {
            if (wave.radius < wave.maxRadius && wave.alpha > 0.01) {
              wave.radius += 3.2;
              wave.alpha *= 0.96;

              ctx.beginPath();
              ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
              ctx.strokeStyle = wave.color;
              ctx.globalAlpha = wave.alpha * 0.5;
              ctx.lineWidth = 2.5;
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }

          // 2. Draw and update burst particles
          for (const p of particles) {
            if (p.alpha > 0.01) {
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.08; // gentle gravity
              p.vx *= 0.985; // drag
              p.alpha = Math.max(0, p.alpha - p.decay);
              p.rotation += p.rotationSpeed;

              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.globalAlpha = p.alpha;
              ctx.fillStyle = p.color;

              if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                ctx.fill();
              } else if (p.shape === 'square') {
                ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
              } else {
                // 4-point sparkle star
                const r = p.radius * 1.5;
                ctx.beginPath();
                ctx.moveTo(0, -r);
                ctx.quadraticCurveTo(0, 0, r, 0);
                ctx.quadraticCurveTo(0, 0, 0, r);
                ctx.quadraticCurveTo(0, 0, -r, 0);
                ctx.quadraticCurveTo(0, 0, 0, -r);
                ctx.fill();
              }

              ctx.restore();
            }
          }

          animationFrameId = requestAnimationFrame(renderFrame);
        };

        animationFrameId = requestAnimationFrame(renderFrame);
      }
    }

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [show, durationMs, onComplete]);

  if (!show) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-400 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Interactive Celebration Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Center Branded Confirmation Card */}
      <div className="relative z-10 cosmic-card rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center space-y-6 border border-[#00E69A]/50 shadow-[0_20px_60px_-10px_rgba(0,230,154,0.35)] animate-in zoom-in-95 duration-300">
        {/* Animated Confirmation Symbol */}
        <div className="relative flex items-center justify-center mx-auto">
          {/* Pulsing emerald glow aura */}
          <div
            aria-hidden="true"
            className="absolute w-24 h-24 rounded-full bg-[#00E69A]/25 blur-xl animate-pulse"
          />

          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#070B24] border-2 border-[#00E69A] flex items-center justify-center text-[#00E69A] shadow-[0_0_30px_rgba(0,230,154,0.5)]">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 animate-in zoom-in-75 duration-300" />
          </div>
        </div>

        {/* Text Content required by prompt */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E69A]/15 border border-[#00E69A]/35 text-[#00E69A] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Database Commit Verified</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-[#B5BCD9] leading-relaxed max-w-md mx-auto">
            {subtitle}
          </p>
        </div>

        {/* 3-Second Countdown Indicator Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B19FF] via-[#00D9FF] to-[#00E69A] transition-all duration-75"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <div className="text-[11px] font-mono text-[#B5BCD9]/75 flex justify-between">
            <span>Logged in project inbox</span>
            <span>Returning to form...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
