import React, { useEffect, useRef } from 'react';

// Adapted from ThreeUI's CondensationRenderer (`src/shaders/condensation/condensationRenderer.ts`)
// Renders realistic cold beer condensation droplets & splashes on surfaces.
export const BeerCondensationCanvas: React.FC<{
  className?: string;
  dropAmount?: number;
  height?: number;
}> = ({ className = '', dropAmount = 0.85 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    type Drop = {
      x: number;
      y: number;
      r: number;
      rMax: number;
      grow: number;
      running: boolean;
      vy: number;
    };

    type Splash = {
      x: number;
      y: number;
      r0: number;
      born: number;
    };

    let width = 1;
    let height = 1;
    let dpr = 1;
    let floorY = 1;
    let maxDrops = 95;
    let lastCascade = 0;
    let simulatedNow = 0;
    let lastFrame = 0;
    let rafId = 0;
    let drops: Drop[] = [];
    let splashes: Splash[] = [];
    const bubbleSprites = new Map<number, HTMLCanvasElement>();

    const getBubbleSprite = (radius: number) => {
      const spriteRadius = Math.max(0.5, Math.round(radius * 2) / 2);
      const cached = bubbleSprites.get(spriteRadius);
      if (cached) return cached;

      const padding = Math.ceil(2 * dpr);
      const size = Math.ceil(spriteRadius * 2 + padding * 2);
      const sprite = document.createElement('canvas');
      sprite.width = size;
      sprite.height = size;
      const sCtx = sprite.getContext('2d');
      if (!sCtx) return sprite;

      const center = size / 2;
      const lit = spriteRadius / (4.4 * dpr);
      sCtx.fillStyle = `rgba(255, 184, 0, ${0.14 + lit * 0.18})`;
      sCtx.beginPath();
      sCtx.arc(center, center, spriteRadius, 0, Math.PI * 2);
      sCtx.fill();

      sCtx.strokeStyle = `rgba(255, 110, 40, ${0.28 + lit * 0.28})`;
      sCtx.lineWidth = 0.85 * dpr;
      sCtx.stroke();

      sCtx.fillStyle = `rgba(255, 250, 235, ${0.38 + lit * 0.32})`;
      sCtx.beginPath();
      sCtx.arc(
        center - spriteRadius * 0.32,
        center - spriteRadius * 0.36,
        Math.max(0.45 * dpr, spriteRadius * 0.25),
        0,
        Math.PI * 2
      );
      sCtx.fill();

      bubbleSprites.set(spriteRadius, sprite);
      return sprite;
    };

    const seedDrop = (headStart = 0) => {
      const margin = 8 * dpr;
      const availW = Math.max(1, width - margin * 2);
      const availH = Math.max(1, floorY - margin * 2);
      drops.push({
        x: margin + Math.random() * availW,
        y: margin + Math.random() * availH,
        r: (0.5 + headStart * 0.7) * dpr,
        rMax: (2.0 + Math.random() * 2.2) * dpr,
        grow: (0.002 + Math.random() * 0.003) * dpr,
        running: false,
        vy: 0,
      });
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent
        ? parent.getBoundingClientRect()
        : canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const newW = Math.max(1, Math.floor(rect.width * dpr));
      const newH = Math.max(1, Math.floor(rect.height * dpr));
      if (width === newW && height === newH) return;
      width = canvas.width = newW;
      height = canvas.height = newH;
      floorY = Math.max(1, height - 2 * dpr);
      const baseMax = Math.max(
        60,
        Math.min(180, Math.round((rect.width * rect.height) / 5600))
      );
      maxDrops = Math.round(baseMax * dropAmount);
      drops = [];
      splashes = [];
      bubbleSprites.clear();
      const seedCount = Math.round(maxDrops * 0.6);
      for (let i = 0; i < seedCount; i++) seedDrop(Math.random() * 3);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const render = (now: number) => {
      const delta = lastFrame ? Math.min(50, now - lastFrame) : 16.67;
      lastFrame = now;
      simulatedNow += delta;

      if (drops.length < maxDrops && Math.random() < 0.32) seedDrop();
      if (simulatedNow - lastCascade > 5800) {
        lastCascade = simulatedNow;
        drops
          .filter((d) => !d.running)
          .sort((a, b) => b.r - a.r)
          .slice(0, 3)
          .forEach((d) => {
            d.running = true;
            d.vy = 0.35 * dpr;
          });
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];
        if (!drop.running) {
          drop.r += drop.grow;
          if (drop.r >= drop.rMax) {
            drop.running = true;
            drop.vy = 0.3 * dpr;
          }
          continue;
        }
        drop.vy = Math.min(drop.vy + 0.07 * dpr, 5.2 * dpr);
        drop.y += drop.vy;
        for (let j = drops.length - 1; j >= 0; j--) {
          const other = drops[j];
          if (other === drop || other.running) continue;
          const overlapsX =
            Math.abs(other.x - drop.x) < drop.r + other.r + 1.5 * dpr;
          const overlapsY =
            other.y > drop.y - drop.r && other.y < drop.y + drop.vy + drop.r;
          if (overlapsX && overlapsY) {
            drop.r = Math.sqrt(drop.r * drop.r + other.r * other.r);
            drops.splice(j, 1);
            if (j < i) i--;
          }
        }
        if (drop.y >= floorY) {
          splashes.push({
            x: drop.x,
            y: floorY,
            r0: drop.r,
            born: simulatedNow,
          });
          drops.splice(i, 1);
        }
      }
      splashes = splashes.filter((s) => simulatedNow - s.born < 760);

      context.clearRect(0, 0, width, height);
      drops.forEach((drop) => {
        const sprite = getBubbleSprite(drop.r);
        context.drawImage(
          sprite,
          drop.x - sprite.width / 2,
          drop.y - sprite.height / 2
        );
      });

      splashes.forEach((splash) => {
        const progress = (simulatedNow - splash.born) / 760;
        if (progress < 0 || progress > 1) return;
        const radius = splash.r0 + progress * 15 * dpr;
        context.strokeStyle = `rgba(255, 184, 0, ${(1 - progress) * 0.45})`;
        context.lineWidth = 1.1 * dpr;
        context.beginPath();
        context.ellipse(
          splash.x,
          splash.y,
          radius,
          radius * 0.34,
          0,
          0,
          Math.PI * 2
        );
        context.stroke();
      });

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      bubbleSprites.clear();
    };
  }, [dropAmount]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        display: 'block',
      }}
    />
  );
};
export default BeerCondensationCanvas;
