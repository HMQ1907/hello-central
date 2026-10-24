import React, { useRef, useState } from 'react';

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  glareColor?: string;
  onClick?: () => void;
}

export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  style: externalStyle,
  maxTilt = 9,
  glareColor = 'rgba(255, 184, 0, 0.22)',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({
    transform:
      'perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
  });
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(1, rect.width);
    const y = (e.clientY - rect.top) / Math.max(1, rect.height);

    const rotateY = (x - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - y) * maxTilt * 2;

    setTransformStyle({
      transform: `perspective(1400px) rotateX(${rotateX.toFixed(
        2
      )}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });

    setGlareStyle({
      opacity: 1,
      background: `radial-gradient(circle at ${(x * 100).toFixed(1)}% ${(
        y * 100
      ).toFixed(1)}%, ${glareColor}, transparent 62%)`,
    });
  };

  const handlePointerLeave = () => {
    setTransformStyle({
      transform:
        'perspective(1400px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
    });
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        position: 'relative',
        willChange: 'transform',
        ...externalStyle,
        ...transformStyle,
      }}
      className={`tilt-card-hc ${className}`.trim()}
    >
      {children}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
          ...glareStyle,
        }}
      />
    </div>
  );
};
export default TiltCard3D;
