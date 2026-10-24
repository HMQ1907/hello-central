import React, { useEffect, useMemo, useRef } from 'react';

/**
 * Lớp hiệu ứng "sống" cho toàn trang:
 * - Thanh tiến trình cuộn dạng cột bia ở đỉnh màn hình
 * - Bọt bia li ti bay lên khắp nền
 * - Click / chạm ở đâu nổ bọt bia ở đó
 * - Các khối nội dung trượt + mờ dần vào khi cuộn tới (scroll reveal)
 */

const REVEAL_SELECTORS = [
  'section h2',
  'section h3.font-display',
  'section .sticker-badge',
  '.grid-signature-4 > *',
  '.grid-promo-3 > *',
  '.art-menu-paper',
  '.art-menu-row',
  '#dat-ban form',
  '#dat-ban .info-tile-hc',
  '#uu-dai .banner-showcase-hc',
  'footer .container-hc > div',
].join(',');

export const LiveEffects: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const progressRef = useRef<HTMLDivElement | null>(null);

  const ambient = useMemo(
    () =>
      Array.from({ length: 26 }, () => ({
        left: Math.random() * 100,
        size: 3 + Math.random() * 9,
        dur: 9 + Math.random() * 14,
        delay: -Math.random() * 20,
        sway: (Math.random() - 0.5) * 80,
      })),
    []
  );

  // Thanh tiến trình cuộn
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max =
          document.documentElement.scrollHeight - window.innerHeight || 1;
        const p = Math.min(1, Math.max(0, window.scrollY / max));
        if (progressRef.current)
          progressRef.current.style.transform = `scaleX(${p})`;
        document.documentElement.classList.toggle(
          'is-scrolled',
          window.scrollY > 40
        );
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Scroll reveal (tự gắn class cho các khối, kể cả khối render lại sau khi lọc)
  useEffect(() => {
    if (!enabled) return;
    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    const tag = () => {
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS).forEach((el) => {
        if (el.dataset.revealTagged) return;
        el.dataset.revealTagged = '1';
        if (reduced) return;
        const siblings = el.parentElement
          ? Array.from(el.parentElement.children)
          : [];
        const idx = Math.max(0, siblings.indexOf(el));
        el.style.setProperty('--reveal-delay', `${Math.min(idx, 8) * 90}ms`);
        el.classList.add('reveal');
        io.observe(el);
      });
    };

    tag();
    const mo = new MutationObserver(() => tag());
    mo.observe(document.getElementById('root') || document.body, {
      childList: true,
      subtree: true,
    });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [enabled]);

  // Click nổ bọt bia
  useEffect(() => {
    if (!enabled) return;
    const onDown = (e: PointerEvent) => {
      const burst = document.createElement('div');
      burst.className = 'foam-burst';
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;
      for (let i = 0; i < 12; i++) {
        const dot = document.createElement('span');
        const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
        const d = 26 + Math.random() * 46;
        dot.style.setProperty('--dx', `${Math.cos(a) * d}px`);
        dot.style.setProperty('--dy', `${Math.sin(a) * d - 18}px`);
        const s = 5 + Math.random() * 9;
        dot.style.width = `${s}px`;
        dot.style.height = `${s}px`;
        if (i % 3 === 0) dot.classList.add('is-beer');
        burst.appendChild(dot);
      }
      document.body.appendChild(burst);
      window.setTimeout(() => burst.remove(), 900);
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => window.removeEventListener('pointerdown', onDown);
  }, [enabled]);

  return (
    <>
      <div className="scroll-progress-hc" aria-hidden="true">
        <div ref={progressRef} className="scroll-progress-fill" />
      </div>

      <div className="ambient-bubbles" aria-hidden="true">
        {ambient.map((b, i) => (
          <span
            key={i}
            style={
              {
                left: `${b.left}%`,
                width: b.size,
                height: b.size,
                animationDuration: `${b.dur}s`,
                animationDelay: `${b.delay}s`,
                '--sway': `${b.sway}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
};

export default LiveEffects;
