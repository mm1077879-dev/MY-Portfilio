import React, { useEffect, useState, useRef } from 'react';

// Module-level guard: ensures animation only plays ONCE per full browser page load/refresh,
// never re-triggering during internal React Router client-side navigation.
let hasSessionInitialLoadCompleted = false;

interface StarParticle {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedY: number;
  alpha: number;
  pulseSpeed: number;
}

export const BrandedReloadOverlay: React.FC = () => {
  const [mounted, setMounted] = useState<boolean>(() => !hasSessionInitialLoadCompleted);
  const [progress, setProgress] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (hasSessionInitialLoadCompleted) {
      setMounted(false);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const TARGET_DURATION_MS = prefersReducedMotion ? 1200 : 3000;
    const startTime = performance.now();
    let animationFrameId: number;

    // 1. Progress interpolation loop
    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const linearT = Math.min(1, elapsed / TARGET_DURATION_MS);
      // Smooth cubic-out easing
      const easedT = 1 - Math.pow(1 - linearT, 2.5);
      const currentPct = Math.min(100, Math.floor(easedT * 100));
      setProgress(currentPct);

      if (linearT < 1) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        // Target reached: begin graceful exit
        setIsFadingOut(true);
        setTimeout(() => {
          hasSessionInitialLoadCompleted = true;
          setMounted(false);
        }, 400);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    // 2. Subtle ambient cosmic starfield on background canvas
    let canvasAnimationId: number;
    const canvas = canvasRef.current;
    if (canvas && !prefersReducedMotion) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
          if (!canvas) return;
          width = canvas.width = window.innerWidth;
          height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const palette = ['#8B19FF', '#00D9FF', '#087BFF', '#D000FF', '#FFFFFF'];
        const stars: StarParticle[] = Array.from({ length: 45 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.8 + Math.random() * 1.8,
          color: palette[Math.floor(Math.random() * palette.length)],
          speedY: 0.15 + Math.random() * 0.35,
          alpha: 0.2 + Math.random() * 0.7,
          pulseSpeed: 0.02 + Math.random() * 0.03,
        }));

        const drawCanvas = () => {
          ctx.clearRect(0, 0, width, height);

          // Subtle radial glow in center
          const glowGrad = ctx.createRadialGradient(
            width / 2,
            height / 2,
            0,
            width / 2,
            height / 2,
            width * 0.4
          );
          glowGrad.addColorStop(0, 'rgba(139, 25, 255, 0.12)');
          glowGrad.addColorStop(0.6, 'rgba(8, 123, 255, 0.06)');
          glowGrad.addColorStop(1, 'rgba(3, 5, 20, 0)');
          ctx.fillStyle = glowGrad;
          ctx.fillRect(0, 0, width, height);

          // Particles
          for (const star of stars) {
            star.y -= star.speedY;
            if (star.y < -10) star.y = height + 10;
            star.alpha += Math.sin(performance.now() * star.pulseSpeed) * 0.01;
            const clampedAlpha = Math.max(0.1, Math.min(0.9, star.alpha));

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = clampedAlpha;
            ctx.shadowBlur = 6;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          }

          canvasAnimationId = requestAnimationFrame(drawCanvas);
        };

        canvasAnimationId = requestAnimationFrame(drawCanvas);

        return () => {
          cancelAnimationFrame(animationFrameId);
          cancelAnimationFrame(canvasAnimationId);
          window.removeEventListener('resize', handleResize);
        };
      }
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  const getStatusText = (pct: number): string => {
    if (pct < 32) return 'Initializing application environment...';
    if (pct < 70) return 'Loading portfolio & service architecture...';
    if (pct < 95) return 'Finalizing cosmic interface...';
    return 'Ready';
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Mahim Dev Portfolio"
      className={`fixed inset-0 z-[9999] bg-[#030514] flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-400 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Background ambient canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Decorative ambient radial blurs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#8B19FF]/20 via-[#087BFF]/15 to-[#00D9FF]/10 blur-[100px]"
      />

      {/* Center Branded Animation Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full space-y-6">
        {/* Animated Brand Monogram Badge */}
        <div className="relative flex items-center justify-center">
          {/* Outer rotating neon conic ring */}
          <div
            aria-hidden="true"
            className="absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-[#8B19FF] via-[#00D9FF] to-[#8B19FF] opacity-75 blur-md animate-pulse"
          />

          {/* Inner badge container */}
          <div className="relative w-20 h-20 rounded-2xl bg-[#070B24] border border-white/20 flex items-center justify-center shadow-[0_12px_40px_-10px_rgba(139,25,255,0.6)]">
            <span className="font-display font-extrabold text-3xl text-gradient-purple select-none tracking-tight">
              M
            </span>
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00D9FF] shadow-[0_0_10px_#00D9FF]"
            />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-1.5">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
            Mahim <span className="text-gradient-purple">Dev</span>
          </h1>
          <p className="text-xs font-semibold text-[#00D9FF] tracking-wider uppercase font-mono">
            Full-Stack Software Architect
          </p>
        </div>

        {/* Progress Bar & Percentage Counter */}
        <div className="w-full space-y-2 pt-2">
          {/* Progress bar container */}
          <div className="w-full h-2 rounded-full bg-[#070B24] border border-white/10 overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8B19FF] via-[#087BFF] to-[#00D9FF] transition-all duration-75 ease-linear shadow-[0_0_12px_rgba(0,217,255,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Numeric tabular counter & phase description */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#B5BCD9]">
            <span className="truncate pr-2">{getStatusText(progress)}</span>
            <span className="font-bold text-white tabular-nums shrink-0">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
