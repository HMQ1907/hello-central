import React, { useEffect, useMemo, useRef, useState } from 'react';
import { clink, fizz, kha, preloadKha, tryUnlockAudio } from './introSounds';

/**
 * Màn chào khi mới vào trang:
 * 2 ly bia trượt vào từ hai bên → cụng ly ở giữa → bọt bia bắn tung toé,
 * chữ "DZÔ!!!" bật lên → bia dâng đầy màn hình rồi rút lên để lộ website.
 * Chạm / bấm bất kỳ đâu để bỏ qua.
 */

const TOTAL_MS = 3600;

const BeerMug: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  const id = `mug-${side}`;
  return (
    <svg
      viewBox="0 0 160 200"
      className={`intro-mug intro-mug-${side}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-beer`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD54A" />
          <stop offset="55%" stopColor="#FFB800" />
          <stop offset="100%" stopColor="#E07B00" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="18%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="80%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="22" y="46" width="96" height="140" rx="12" />
        </clipPath>
      </defs>

      {/* Quai cầm */}
      <path
        d="M118 78 h14 a20 20 0 0 1 20 20 v34 a20 20 0 0 1 -20 20 h-14"
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* Bia + bọt khí */}
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="22" y="58" width="96" height="130" fill={`url(#${id}-beer)`} />
        {[30, 48, 66, 84, 102, 40, 76, 94, 58].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={180}
            r={1.6 + (i % 3)}
            fill="rgba(255,255,255,0.75)"
            className="intro-mug-bubble"
            style={{ animationDelay: `${(i * 0.17).toFixed(2)}s` }}
          />
        ))}
      </g>

      {/* Thân ly */}
      <rect
        x="22"
        y="46"
        width="96"
        height="140"
        rx="12"
        fill={`url(#${id}-glass)`}
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="4"
      />
      {/* Đường gân ly */}
      {[48, 70, 92].map((x) => (
        <line
          key={x}
          x1={x}
          y1="70"
          x2={x}
          y2="174"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      ))}

      {/* Bọt bia trào miệng ly */}
      <g className="intro-mug-foam">
        <circle cx="30" cy="48" r="16" fill="#FFF8EA" />
        <circle cx="54" cy="38" r="20" fill="#FFFDF7" />
        <circle cx="82" cy="36" r="21" fill="#FFF8EA" />
        <circle cx="108" cy="46" r="17" fill="#FFFDF7" />
        <rect x="18" y="44" width="104" height="18" rx="9" fill="#FFF8EA" />
        <path
          d="M40 60 q4 14 0 22 q-4 -8 0 -22z"
          fill="#FFF8EA"
          className="intro-foam-drip"
        />
        <path
          d="M96 60 q5 18 0 28 q-5 -10 0 -28z"
          fill="#FFFDF7"
          className="intro-foam-drip"
          style={{ animationDelay: '0.4s' }}
        />
      </g>
    </svg>
  );
};

export const IntroCheers: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [leaving, setLeaving] = useState(false);
  // probe: đang kiểm tra trình duyệt có cho phát tiếng không
  // gate:  bị chặn → hiện nút "Chạm để DZÔ"
  // play:  chạy hoạt cảnh cụng ly
  // Vào thẳng hoạt cảnh, không còn màn "Chạm để DZÔ"
  const phase = 'play' as 'probe' | 'gate' | 'play';
  const startRef = useRef(performance.now());

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Giọt bọt & giọt bia bắn ra lúc cụng ly
  const splash = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 46 + (Math.random() - 0.5) * 0.4;
        const dist = 90 + Math.random() * 230;
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - 60 - Math.random() * 80,
          size: 6 + Math.random() * 20,
          beer: i % 4 === 0,
          delay: Math.random() * 0.12,
        };
      }),
    []
  );

  // Bọt khí dâng lên trong lớp bia tràn màn hình
  const rising = useMemo(
    () =>
      Array.from({ length: 34 }, () => ({
        left: Math.random() * 100,
        size: 4 + Math.random() * 14,
        delay: 1.6 + Math.random() * 1.4,
        dur: 1.4 + Math.random() * 1.4,
      })),
    []
  );

  // Âm thanh: nếu trình duyệt cho phát thì chạy hiệu ứng, không thì intro chạy im lặng
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    preloadKha();
    let alive = true;
    if (!reduced) {
      tryUnlockAudio().then((ok) => {
        if (!alive || !ok) return;
        const elapsed = (performance.now() - startRef.current) / 1000;
        const at = (t: number) => Math.max(0, t - elapsed);
        if (elapsed < 1.02) clink(at(1.02)); // 2 ly chạm nhau
        if (elapsed < 1.1) fizz(at(1.1), 1.3); // bọt bia bắn tung
        if (elapsed < 1.55) kha(at(1.55)); // "khàaa" sảng khoái
        if (elapsed < 2.2) fizz(at(2.2), 1.4); // bia dâng đầy màn hình
      });
    }
    return () => {
      alive = false;
      document.documentElement.style.overflow = '';
    };
  }, [reduced]);

  // Hẹn giờ kết thúc intro
  useEffect(() => {
    const total = reduced ? 900 : TOTAL_MS;
    const t1 = window.setTimeout(() => setLeaving(true), total - 650);
    const t2 = window.setTimeout(onDone, total);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone, reduced]);

  const skip = () => {
    setLeaving(true);
    window.setTimeout(onDone, 450);
  };

  return (
    <div
      className={`intro-cheers ${leaving ? 'is-leaving' : ''} is-${phase}`}
      onClick={phase === 'play' ? skip : undefined}
      role="presentation"
    >
      {phase === 'play' && (
      <>
      <div className="intro-glow" />

      {/* Ly bia + cụng ly */}
      <div className="intro-stage">
        <div className="intro-mug-wrap intro-mug-wrap-left">
          <BeerMug side="left" />
        </div>
        <div className="intro-mug-wrap intro-mug-wrap-right">
          <BeerMug side="right" />
        </div>

        {/* Tia sáng va chạm */}
        <div className="intro-clink-flash" />
        <div className="intro-clink-ring" />
        <div className="intro-clink-ring intro-clink-ring-2" />

        {/* Bọt bia bắn tung toé */}
        <div className="intro-splash">
          {splash.map((p, i) => (
            <span
              key={i}
              className={`intro-splash-dot ${p.beer ? 'is-beer' : ''}`}
              style={
                {
                  '--dx': `${p.dx}px`,
                  '--dy': `${p.dy}px`,
                  width: p.size,
                  height: p.size,
                  animationDelay: `${(1.08 + p.delay).toFixed(2)}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="intro-dzo font-display">DZÔ!!!</div>
      </div>

      <div className="intro-brand">
        <div className="intro-brand-script">Say hello?</div>
        <div className="intro-brand-title font-display">HELLO CENTRAL</div>
        <div className="intro-brand-sub">Don’t worry, beer happy 🍻</div>
      </div>

      {/* Bia dâng đầy màn hình */}
      <div className="intro-flood">
        <svg
          className="intro-flood-wave"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 60 C 180 10 360 110 540 60 S 900 10 1080 60 S 1300 110 1440 50 V120 H0z"
            fill="#FFFDF7"
          />
        </svg>
        <div className="intro-flood-foam" />
        <div className="intro-flood-beer">
          {rising.map((b, i) => (
            <span
              key={i}
              className="intro-flood-bubble"
              style={{
                left: `${b.left}%`,
                width: b.size,
                height: b.size,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.dur}s`,
              }}
            />
          ))}
        </div>
      </div>

      </>
      )}

      <button type="button" className="intro-skip" onClick={(e) => { e.stopPropagation(); skip(); }}>
        Bỏ qua ›
      </button>
    </div>
  );
};

export default IntroCheers;
