import React, { useEffect, useRef, useState } from 'react';
import {
  BRAND_INFO,
  MARQUEE_PRIMARY,
  MARQUEE_SECONDARY,
  MENU_CATEGORIES,
  PROMO_CARDS,
  SIGNATURE_DISHES,
  SPACE_GALLERY,
} from './data/helloCentralData';
import { HelloRibbonShader } from './shaders/HelloRibbonShader';
import { ThreeEmberPathway } from './shaders/ThreeEmberPathway';
import { BeerCondensationCanvas } from './shaders/BeerCondensationCanvas';
import { TiltCard3D } from './components/TiltCard3D';
import { IntroCheers } from './components/IntroCheers';
import { LiveEffects } from './components/LiveEffects';
import { GsapEffects } from './components/GsapEffects';

/** Biểu tượng loa đơn giản: có sóng âm khi bật, gạch chéo khi tắt */
const SoundIcon: React.FC<{ muted: boolean; size?: number }> = ({
  muted,
  size = 20,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
    {muted ? (
      <>
        <line x1="16" y1="9" x2="22" y2="15" />
        <line x1="22" y1="9" x2="16" y2="15" />
      </>
    ) : (
      <>
        <path className="sound-wave sound-wave-1" d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path className="sound-wave sound-wave-2" d="M18.5 5.5a9 9 0 0 1 0 13" />
      </>
    )}
  </svg>
);

/** Icon ghim bản đồ nhỏ */
const PinIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </svg>
);

export const App: React.FC = () => {
  // Màn chào cụng ly khi mới vào trang
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const handleIntroDone = React.useCallback(() => setShowIntro(false), []);

  // Hero Video & Original Audio State
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.9);
  const [needsUserGestureForAudio, setNeedsUserGestureForAudio] = useState<boolean>(false);
  const [isCinemaModalOpen, setIsCinemaModalOpen] = useState<boolean>(false);

  // Navigation & UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeSpaceFilter, setActiveSpaceFilter] = useState<
    'all' | 'khong-gian' | 'khoanh-khac' | 'am-thuc'
  >('all');
  const [activeMenuCategory, setActiveMenuCategory] = useState<string>(
    MENU_CATEGORIES[0].id
  );
  const [menuSheetModal, setMenuSheetModal] = useState<number | null>(null);

  // Booking Form State
  const [bookingName, setBookingName] = useState<string>('');
  const [bookingPhone, setBookingPhone] = useState<string>('');
  const [bookingGuests, setBookingGuests] = useState<string>('4 - 6 khách');
  const [bookingTime, setBookingTime] = useState<string>('19:30 Hôm nay');
  const [bookingZone, setBookingZone] = useState<string>(
    'Sân vườn thoáng mát dưới tường Say Hello'
  );
  const [bookingPromo, setBookingPromo] = useState<string>(
    'Tặng Canh Cá Tứ Xuyên (Đặt bàn trước)'
  );
  const [bookingCopied, setBookingCopied] = useState<boolean>(false);

  // Attempt immediate unmuted playback on mount + fallback to unlock audio on first gesture
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    let unmounted = false;

    const startWithOriginalSound = async () => {
      try {
        video.muted = false;
        video.volume = volume;
        await video.play();
        if (!unmounted) {
          setIsMuted(false);
          setNeedsUserGestureForAudio(false);
        }
      } catch {
        // Browser policy blocked immediate unmuted autoplay; start video and arm instant unmute on first touch/scroll/click
        try {
          video.muted = true;
          await video.play();
        } catch {
          // ignore
        }
        if (!unmounted) {
          setIsMuted(true);
          setNeedsUserGestureForAudio(true);
        }
      }
    };

    startWithOriginalSound();

    const unlockAudioOnFirstInteraction = () => {
      const v = heroVideoRef.current;
      if (!v) return;
      v.muted = false;
      v.volume = volume;
      v.play()
        .then(() => {
          setIsMuted(false);
          setNeedsUserGestureForAudio(false);
          // chỉ gỡ listener khi đã phát tiếng thành công
          window.removeEventListener('pointerdown', unlockAudioOnFirstInteraction);
          window.removeEventListener('keydown', unlockAudioOnFirstInteraction);
          window.removeEventListener('touchstart', unlockAudioOnFirstInteraction);
          window.removeEventListener('scroll', unlockAudioOnFirstInteraction);
        })
        .catch(() => {
          v.muted = true;
        });
    };

    window.addEventListener('pointerdown', unlockAudioOnFirstInteraction, {
      passive: true,
    });
    window.addEventListener('keydown', unlockAudioOnFirstInteraction, {
      passive: true,
    });
    window.addEventListener('touchstart', unlockAudioOnFirstInteraction, {
      passive: true,
    });

    return () => {
      unmounted = true;
      window.removeEventListener('pointerdown', unlockAudioOnFirstInteraction);
      window.removeEventListener('keydown', unlockAudioOnFirstInteraction);
      window.removeEventListener('touchstart', unlockAudioOnFirstInteraction);
    };
  }, []);

  const toggleSound = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (video.muted || isMuted) {
      video.muted = false;
      video.volume = volume > 0 ? volume : 0.9;
      video.play().catch(() => {});
      setIsMuted(false);
      setNeedsUserGestureForAudio(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    const video = heroVideoRef.current;
    if (video) {
      video.volume = newVol;
      if (newVol > 0 && video.muted) {
        video.muted = false;
        setIsMuted(false);
        setNeedsUserGestureForAudio(false);
      } else if (newVol === 0) {
        video.muted = true;
        setIsMuted(true);
      }
    }
  };

  const filteredSpaceGallery =
    activeSpaceFilter === 'all'
      ? SPACE_GALLERY
      : SPACE_GALLERY.filter((item) => item.category === activeSpaceFilter);

  const currentMenuCategory =
    MENU_CATEGORIES.find((cat) => cat.id === activeMenuCategory) ||
    MENU_CATEGORIES[0];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const summary = `Xin chào HELLO CENTRAL Dĩ An! Mình muốn đặt bàn:\n- Tên: ${
      bookingName || 'Khách hàng'
    }\n- SĐT: ${bookingPhone || 'Liên hệ trực tiếp'}\n- Số lượng: ${bookingGuests}\n- Giờ đến: ${bookingTime}\n- Khu vực: ${bookingZone}\n- Ưu đãi nhận kèm: ${bookingPromo}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).catch(() => {});
    }
    setBookingCopied(true);
    setTimeout(() => setBookingCopied(false), 5000);
    window.open(BRAND_INFO.zaloUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Màn chào: bọt bia + cụng ly */}
      {showIntro && <IntroCheers onDone={handleIntroDone} />}

      {/* LAYER 0: ThreeUI WebGL Ribbon Shader Background */}
      <HelloRibbonShader opacity={0.42} />

      {/* Hiệu ứng sống động toàn trang */}
      <LiveEffects enabled={!showIntro} />
      <GsapEffects enabled={!showIntro} />

      {/* ====================================================================
          HEADER: FLOATING GLASS PILL NAVBAR (REA Pattern)
          ==================================================================== */}
      <header className="floating-header-wrap">
        <div className="floating-header-pill">
          {/* Brand Logo + Live Open Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <a href="#top" aria-label="Về đầu trang" className="logo-spin-hc">
            <img
              src="/assets/logo.jpg"
              alt="Hello Central Logo"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '999px',
                objectFit: 'cover',
                border: '2px solid #FFB800',
                boxShadow: '0 0 16px rgba(255, 69, 30, 0.65)',
                display: 'block',
              }}
            />
            </a>
            <div>
              <a
                href="#top"
                className="font-display"
                style={{
                  fontSize: '0.98rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  color: '#FBF3E4',
                  lineHeight: 1.1,
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                HELLO CENTRAL
              </a>
              <a
                href={BRAND_INFO.mapsUrl}
                target="_blank"
                rel="noreferrer"
                title="Mở Google Maps chỉ đường"
                className="map-link-hc"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.72rem',
                  color: '#FFB800',
                  fontWeight: 600,
                  marginTop: '2px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '999px',
                    background: '#22c55e',
                    boxShadow: '0 0 10px #22c55e',
                    display: 'inline-block',
                  }}
                  className="live-dot-hc"
                />
                <span>99GS1 Đông Hòa • 17:00 – 23:59</span>
              </a>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: ' flex',
              alignItems: 'center',
              gap: '4px',
            }}
            className="desktop-nav-hc"
          >
            <a href="#khong-gian" className="nav-link-hc">
              Không Gian
            </a>
            <a href="#uu-dai" className="nav-link-hc">
              DJ & Ưu Đãi
            </a>
            <a href="#mon-dinh" className="nav-link-hc">
              Món Đinh
            </a>
            <a href="#thuc-don" className="nav-link-hc">
              Thực Đơn
            </a>
            <a href="#dat-ban" className="nav-link-hc">
              Đặt Bàn
            </a>
          </nav>

          {/* Header Right Controls: Sound Toggle + CTA + Menu Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={toggleSound}
              aria-label={isMuted ? 'Bật tiếng video' : 'Tắt tiếng video'}
              title={isMuted ? 'Bật tiếng video' : 'Tắt tiếng video'}
              className={`sound-icon-btn ${isMuted ? 'is-muted' : 'is-on'}`}
            >
              <SoundIcon muted={isMuted} />
            </button>

            <a
              href="#dat-ban"
              className="btn-hello-primary header-cta-hc"
              style={{ padding: '10px 20px', fontSize: '0.76rem' }}
            >
              <span>ĐẶT BÀN NGAY</span>
            </a>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mở menu toàn màn hình"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '999px',
                background: 'rgba(255, 184, 0, 0.14)',
                border: '1px solid rgba(255, 184, 0, 0.4)',
                color: '#FFB800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '1.1rem',
              }}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          FULLSCREEN STAGGER MENU OVERLAY (REA Pattern)
          ==================================================================== */}
      {isMobileMenuOpen && (
        <div className="menu-overlay-hc" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="menu-panel-hc" onClick={(e) => e.stopPropagation()}>
            <nav className="menu-list-hc">
              {[
                { n: '01', label: 'Trang chủ', sub: 'Video giới thiệu quán', href: '#top' },
                { n: '02', label: 'Không gian', sub: 'Sân vườn & lối đi đèn neon', href: '#khong-gian' },
                { n: '03', label: 'DJ & Ưu đãi', sub: '3 món tặng khi đặt bàn trước', href: '#uu-dai' },
                { n: '04', label: 'Món đinh', sub: '4 món signature của quán', href: '#mon-dinh' },
                { n: '05', label: 'Thực đơn', sub: '6 nhóm món • giá niêm yết', href: '#thuc-don' },
                { n: '06', label: 'Đặt bàn', sub: 'Giữ chỗ & nhận quà tặng', href: '#dat-ban' },
              ].map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="menu-item-hc"
                  style={{ animationDelay: `${0.05 + i * 0.06}s` }}
                >
                  <span className="menu-item-num">{item.n}</span>
                  <span className="menu-item-text">
                    <span className="menu-item-label font-display">{item.label}</span>
                    <span className="menu-item-sub">{item.sub}</span>
                  </span>
                  <span className="menu-item-arrow" aria-hidden="true">→</span>
                </a>
              ))}
            </nav>

            <aside className="menu-info-hc">
              <img src="/assets/space-neon-pathway.jpg" alt="" className="menu-info-img" />
              <div className="menu-info-body">
                <div className="neon-sign-script" style={{ fontSize: '1.6rem' }}>
                  Say hello?
                </div>
                <a
                  href={BRAND_INFO.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="menu-info-row"
                >
                  <PinIcon size={16} />
                  <span>{BRAND_INFO.address}</span>
                </a>
                <div className="menu-info-row">
                  <span>🕔</span>
                  <span>Mở cửa mỗi ngày 17:00 – 23:59</span>
                </div>
                <div className="menu-info-actions">
                  <a href={`tel:${BRAND_INFO.hotline1Raw}`} className="btn-hello-primary">
                    📞 {BRAND_INFO.hotline1}
                  </a>
                  <a href={BRAND_INFO.zaloUrl} target="_blank" rel="noreferrer" className="btn-hello-secondary">
                    Zalo
                  </a>
                  <a href={BRAND_INFO.mapsUrl} target="_blank" rel="noreferrer" className="btn-hello-secondary">
                    Chỉ đường
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ====================================================================
          HERO SECTION: ORIGINAL PROMO VIDEO WITH SOUND + THREE.JS 3D PATHWAY
          ==================================================================== */}
      <section
        id="top"
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '112px',
          paddingBottom: '72px',
          overflow: 'hidden',
        }}
      >
        {/* Background Video Layer (/assets/hello-hero.mp4 with original sound) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
          <video
            ref={heroVideoRef}
            src="/assets/hello-hero.mp4"
            autoPlay
            loop
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: ' saturate(1.12) contrast(1.06) brightness(0.72)',
              transform: 'scale(1.02)',
            }}
          />
          {/* Cinematic Warm Vignette Overlays so Vietnamese Typography pops */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 65% 42%, rgba(17, 11, 8, 0.22) 0%, rgba(17, 11, 8, 0.78) 72%, rgba(17, 11, 8, 0.94) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(17,11,8,0.65) 0%, rgba(17,11,8,0.18) 38%, rgba(17,11,8,0.68) 82%, #110b08 100%)',
            }}
          />
        </div>

        {/* Three.js 3D Interactive LED Pathway & Floating Bokeh Embers */}
        <ThreeEmberPathway />

        {/* Biểu tượng bay lơ lửng */}
        <div className="hero-floaters" aria-hidden="true">
          {['🍺', '🍻', '🌶️', '✨', '🍺', '🎶', '🔥', '🥂'].map((e, i) => (
            <span key={i} className={`hero-floater hero-floater-${i}`}>
              {e}
            </span>
          ))}
        </div>

        {/* Hero Foreground Content */}
        <div
          className={`container-hc hero-content-hc ${showIntro ? '' : 'is-ready'}`}
          style={{ position: 'relative', zIndex: 5 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Brand Story, Neon Headline & Audio/Booking Controls */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                }}
              >
                <a
                  href={BRAND_INFO.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Mở Google Maps chỉ đường"
                  className="sticker-badge sticker-starburst"
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  ✦ TỌA ĐỘ CHILL SỐ 1 ĐÔNG HÒA – DĨ AN ↗
                </a>
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: 'rgba(15, 56, 40, 0.85)',
                    border: '1px solid #22c55e',
                    color: '#a7f3d0',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                  }}
                >
                  ● MỞ CỬA MỖI NGÀY: 17:00 – 23:59
                </span>
              </div>

              {/* Script Neon Sign */}
              <div
                className="neon-sign-script"
                style={{
                  fontSize: 'clamp(2rem, 4.2vw, 3.2rem)',
                  marginBottom: '6px',
                  lineHeight: 1.1,
                }}
              >
                Say hello? ◡·◡
              </div>

              {/* Main Display Title */}
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(2.35rem, 5.6vw, 4.6rem)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                }}
              >
                <span style={{ display: 'block', color: '#FBF3E4' }}>
                  HELLO CENTRAL
                </span>
                <span className="text-gradient-hello">
                  DON’T WORRY, BEER HAPPY!
                </span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1rem, 1.35vw, 1.16rem)',
                  color: '#E7D8C9',
                  maxWidth: '620px',
                  marginBottom: '28px',
                  fontWeight: 500,
                }}
              >
                {BRAND_INFO.description}
              </p>

              {/* Điều khiển âm thanh tối giản: icon loa + thanh âm lượng + xem full */}
              <div className="hero-sound-row">
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-label={isMuted ? 'Bật tiếng video' : 'Tắt tiếng video'}
                  title={isMuted ? 'Bật tiếng video' : 'Tắt tiếng video'}
                  className={`sound-icon-btn sound-icon-btn-lg ${
                    isMuted ? 'is-muted' : 'is-on'
                  } ${needsUserGestureForAudio ? 'is-hinting' : ''}`}
                >
                  <SoundIcon muted={isMuted} size={22} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Điều chỉnh âm lượng video"
                  className="volume-slider-hc"
                  style={
                    {
                      '--vol': `${(isMuted ? 0 : volume) * 100}%`,
                    } as React.CSSProperties
                  }
                />
                <button
                  type="button"
                  onClick={() => setIsCinemaModalOpen(true)}
                  aria-label="Xem full video"
                  title="Xem full video"
                  className="sound-icon-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>

              {/* Primary CTA Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '14px',
                  marginBottom: '32px',
                }}
              >
                <a href="#dat-ban" className="btn-hello-primary">
                  <span>🍻 ĐẶT BÀN NHẬN CANH CÁ TỨ XUYÊN</span>
                </a>
                <a href="#thuc-don" className="btn-hello-secondary">
                  <span>📖 KHÁM PHÁ THỰC ĐƠN MỒI BÉN</span>
                </a>
              </div>

              {/* Venue Quick Facts Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: '12px',
                  maxWidth: '580px',
                }}
              >
                {[
                  {
                    value: '99GS1',
                    label: 'Đông Hòa, Dĩ An (Sát GO! Dĩ An)',
                    href: BRAND_INFO.mapsUrl,
                  },
                  {
                    value: '60+ MÓN',
                    label: 'Mồi Nhắm • Lẩu Mala • Nướng Tây Bắc',
                  },
                  {
                    value: 'LIVE DJ',
                    label: 'DJ Xập Xình Mỗi Đêm',
                  },
                ].map((stat: { value: string; label: string; href?: string }) => {
                  const Tag = (stat.href ? 'a' : 'div') as React.ElementType;
                  return (
                  <Tag
                    key={stat.value}
                    className={`neon-sweep-card stat-card-hc ${stat.href ? 'is-link' : ''}`}
                    {...(stat.href
                      ? {
                          href: stat.href,
                          target: '_blank',
                          rel: 'noreferrer',
                          title: 'Mở Google Maps chỉ đường',
                        }
                      : {})}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '18px',
                      background: 'rgba(27, 18, 13, 0.78)',
                      border: '1px solid rgba(255, 184, 0, 0.25)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <div
                      className="font-display"
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 900,
                        color: '#FFB800',
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: '#C9B8A6',
                        marginTop: '2px',
                      }}
                    >
                      {stat.label}
                      {stat.href && (
                        <span className="stat-map-hint"> · Chỉ đường ↗</span>
                      )}
                    </div>
                  </Tag>
                  );
                })}
              </div>
            </div>

            {/* Right Column: 3D Tilt Showcase Card with Framed Video Preview & Neon Pathway Photo */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <TiltCard3D
                maxTilt={11}
                glareColor="rgba(255, 184, 0, 0.32)"
                style={{
                  width: '100%',
                  maxWidth: '470px',
                  borderRadius: '28px',
                  padding: '16px',
                  background:
                    'linear-gradient(145deg, rgba(39,26,19,0.92), rgba(17,11,8,0.95))',
                  border: '2px solid rgba(255, 184, 0, 0.45)',
                  boxShadow:
                    '0 28px 70px rgba(0, 0, 0, 0.75), 0 0 40px rgba(255, 69, 30, 0.28)',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    aspectRatio: '4 / 5',
                    border: '1.5px solid rgba(255, 69, 30, 0.4)',
                  }}
                >
                  <img
                    src="/assets/space-neon-pathway.jpg"
                    alt="Cung đường gạch LED vàng ấm và biển neon hello?"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(17,11,8,0.95) 0%, rgba(17,11,8,0.15) 55%, transparent 100%)',
                    }}
                  />

                  {/* Top Floating Pop-Art Sticker */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      right: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span className="sticker-badge">DZÔ!!! RIGHT WAY</span>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: 'rgba(17, 11, 8, 0.82)',
                        border: '1px solid #FF451E',
                        color: '#FFB800',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                      }}
                    >
                      3D TILT INTERACTIVE
                    </span>
                  </div>

                  {/* Bottom Card Caption */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px',
                    }}
                  >
                    <div
                      className="neon-sign-script"
                      style={{ fontSize: '1.75rem', marginBottom: '2px' }}
                    >
                      hello? Don’t Worry Beer Happy
                    </div>
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: '#E7D8C9',
                        marginBottom: '12px',
                      }}
                    >
                      Check-in cung đường gạch uốn lượn rực sáng đèn LED vàng ấm
                      độc nhất tại Đông Hòa, Dĩ An.
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255, 184, 0, 0.25)',
                        fontSize: '0.78rem',
                        color: '#FFB800',
                        fontWeight: 700,
                      }}
                    >
                      <a
                        href={BRAND_INFO.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="map-link-hc"
                        title="Mở Google Maps chỉ đường"
                      >
                        <PinIcon /> 99GS1 Đông Hòa (Gần GO! Dĩ An)
                      </a>
                      <a
                        href={`tel:${BRAND_INFO.hotline1Raw}`}
                        className="map-link-hc"
                      >
                        📞 {BRAND_INFO.hotline1}
                      </a>
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          CROSSED DUAL MARQUEE (REA Blueprint Pattern)
          ==================================================================== */}
      <div className="crossed-marquee-stage" aria-label="Thông tin nổi bật">
        <div className="marquee-ribbon marquee-ribbon-green">
          <div className="marquee-track-reverse">
            {[
              ...MARQUEE_SECONDARY,
              ...MARQUEE_SECONDARY,
              ...MARQUEE_SECONDARY,
              ...MARQUEE_SECONDARY,
            ].map((text, idx) => (
              <span key={idx} className="marquee-item">
                <span>{text}</span>
                <span className="marquee-star" style={{ color: '#FF451E' }}>★</span>
              </span>
            ))}
          </div>
        </div>

        <div className="marquee-ribbon marquee-ribbon-orange">
          <div className="marquee-track">
            {[
              ...MARQUEE_PRIMARY,
              ...MARQUEE_PRIMARY,
              ...MARQUEE_PRIMARY,
              ...MARQUEE_PRIMARY,
            ].map((text, idx) => {
              const isAddress = text.includes('99GS1');
              return (
                <span key={idx} className="marquee-item">
                  {isAddress ? (
                    <a
                      href={BRAND_INFO.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="marquee-map-link"
                      title="Mở Google Maps chỉ đường"
                    >
                      <PinIcon size={15} /> {text}
                    </a>
                  ) : (
                    <span>{text}</span>
                  )}
                  <span className="marquee-star" style={{ color: '#FFB800' }}>✦</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Huy hiệu tại giao điểm chữ X */}
        <div className="marquee-cross-badge" aria-hidden="true">
          <span>🍻</span>
        </div>
      </div>

      {/* ====================================================================
          SECTION 2: KHÔNG GIAN & PHÓNG SỰ TRẢI NGHIỆM (3D Tilt Gallery)
          ==================================================================== */}
      <section
        id="khong-gian"
        style={{ position: 'relative', zIndex: 5, padding: '88px 0' }}
      >
        <div className="container-hc">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '24px',
              marginBottom: '44px',
            }}
          >
            <div>
              <div className="sticker-badge" style={{ marginBottom: '14px' }}>
                KHÔNG GIAN & KHOẢNH KHẮC THỰC TẾ
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(1.85rem, 3.8vw, 3rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  lineHeight: 1.12,
                }}
              >
                VƯỜN NHIỆT ĐỚI MỞ &{' '}
                <span className="text-gradient-hello">ÁNH ĐÈN NEON RỰC RỠ</span>
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[
                { id: 'all', label: 'Tất Cả Góc Chill (04)' },
                { id: 'khong-gian', label: 'Kiến Trúc & Đèn Neon' },
                { id: 'khoanh-khac', label: 'Nhịp Đập Sân Vườn' },
                { id: 'am-thuc', label: 'Bàn Tiệc & Chạm Ly' },
              ].map((tab) => {
                const active = activeSpaceFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveSpaceFilter(
                        tab.id as
                          | 'all'
                          | 'khong-gian'
                          | 'khoanh-khac'
                          | 'am-thuc'
                      )
                    }
                    style={{
                      padding: '10px 18px',
                      borderRadius: '999px',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: active
                        ? 'linear-gradient(135deg, #ff451e, #ff1e27)'
                        : 'rgba(27, 18, 13, 0.85)',
                      color: active ? '#fff' : '#C9B8A6',
                      border: active
                        ? '1.5px solid #FFB800'
                        : '1px solid rgba(255, 184, 0, 0.25)',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4-Card Staggered 3D Gallery Grid */}
          <div className="grid-signature-4">
            {filteredSpaceGallery.map((item, idx) => (
              <TiltCard3D
                key={item.id}
                maxTilt={10}
                style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'rgba(27, 18, 13, 0.9)',
                  border: '1.5px solid rgba(255, 184, 0, 0.28)',
                  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)',
                  marginTop: idx % 2 === 1 ? '18px' : '0px',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '4 / 5',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(17,11,8,0.96) 0%, rgba(17,11,8,0.2) 55%, transparent 100%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                    }}
                  >
                    <span className="sticker-badge">{item.badge}</span>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: '#FFB800',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '4px',
                      }}
                    >
                      {item.categoryLabel}
                    </div>
                    <h3
                      className="font-display"
                      style={{
                        fontSize: '1.08rem',
                        fontWeight: 800,
                        color: '#FBF3E4',
                        marginBottom: '8px',
                        lineHeight: 1.25,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#C9B8A6' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: DJ XẬP XÌNH • STREET-POP ART BANNER & 3 ƯU ĐÃI ĐẶT BÀN
          ==================================================================== */}
      <section
        id="uu-dai"
        style={{
          position: 'relative',
          zIndex: 5,
          padding: '88px 0',
          background:
            'linear-gradient(180deg, rgba(27,18,13,0.4) 0%, rgba(15,56,40,0.22) 50%, rgba(17,11,8,0.8) 100%)',
        }}
      >
        <div className="container-hc">
          {/* Street-Pop Art Banner Showcase (banner-art.jpg) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px',
              alignItems: 'center',
              padding: '28px',
              borderRadius: '32px',
              background:
                'linear-gradient(135deg, rgba(39,26,19,0.95) 0%, rgba(15,56,40,0.85) 100%)',
              border: '2px solid rgba(255, 184, 0, 0.45)',
              boxShadow: '0 28px 64px rgba(0, 0, 0, 0.65)',
              marginBottom: '56px',
            }}
            className="banner-showcase-hc glow-border-hc"
          >
            <div>
              <div className="sticker-badge" style={{ marginBottom: '14px' }}>
                🔥 DJ XẬP XÌNH • DÂN CHƠI DĨ AN
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  lineHeight: 1.12,
                  marginBottom: '16px',
                }}
              >
                TÍN HIỆU ĐÈN XANH:{' '}
                <span className="text-gradient-hello">DZÔ!!! RIGHT WAY</span>
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#E7D8C9',
                  marginBottom: '22px',
                }}
              >
                Mỗi tối tại <strong>Hello Central</strong> là một bữa tiệc thị
                giác & âm nhạc chuẩn chất Street-Pop Art: DJ lên nhạc cực căng,
                tháp bia 3L lạnh buốt, lẩu Mala nghi ngút khói và hàng loạt quà
                tặng độc quyền khi bạn đặt bàn trước!
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCinemaModalOpen(true)}
                  className="btn-hello-primary"
                >
                  🎬 XEM VIDEO QUẢNG CÁO CÓ ÂM THANH
                </button>
                <a href="#dat-ban" className="btn-hello-secondary">
                  🎁 NHẬN NGAY ƯU ĐÃI ĐẶT BÀN
                </a>
              </div>
            </div>

            <TiltCard3D
              maxTilt={8}
              style={{
                borderRadius: '22px',
                overflow: 'hidden',
                border: '3px solid #FFB800',
                boxShadow: '8px 8px 0px #FF451E',
              }}
            >
              <img
                src="/assets/banner-art.jpg"
                alt="Hello Central Street-Pop Art Banner - DJ Xập Xình Dân Chơi Dĩ An"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </TiltCard3D>
          </div>

          {/* 3 Official Promo Cards */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div className="sticker-badge" style={{ marginBottom: '12px' }}>
              ĐẶT BÀN TRƯỚC – NHẬN MÓN TẶNG MIỄN PHÍ
            </div>
            <h3
              className="font-display"
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 900,
                textTransform: 'uppercase',
              }}
            >
              BỘ 3 ĐẶC QUYỀN DÀNH RIÊNG CHO KHÁCH{' '}
              <span style={{ color: '#FFB800' }}>HELLO CENTRAL</span>
            </h3>
          </div>

          <div className="grid-promo-3">
            {PROMO_CARDS.map((promo) => (
              <TiltCard3D
                key={promo.id}
                maxTilt={9}
                style={{
                  borderRadius: '26px',
                  overflow: 'hidden',
                  background: 'rgba(27, 18, 13, 0.94)',
                  border: '2px solid rgba(255, 184, 0, 0.36)',
                  boxShadow: '0 22px 50px rgba(0, 0, 0, 0.55)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={promo.image}
                    alt={promo.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                    }}
                  >
                    <span className="sticker-badge">{promo.highlight}</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: '#FFB800',
                      letterSpacing: '0.06em',
                      marginBottom: '6px',
                    }}
                  >
                    {promo.badge}
                  </div>
                  <h4
                    className="font-display"
                    style={{
                      fontSize: '1.18rem',
                      fontWeight: 900,
                      color: '#FBF3E4',
                      marginBottom: '8px',
                    }}
                  >
                    {promo.title}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: '#C9B8A6',
                      marginBottom: '18px',
                      flexGrow: 1,
                    }}
                  >
                    {promo.description}
                  </p>
                  <a
                    href="#dat-ban"
                    onClick={() => setBookingPromo(promo.title)}
                    className="btn-hello-primary"
                    style={{ width: '100%', padding: '11px 18px' }}
                  >
                    🎁 CHỌN ƯU ĐÃI NÀY & ĐẶT BÀN
                  </a>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4: TOP 4 MÓN ĐINH SIGNATURE (F&B Art Posters + 3D Tilt)
          ==================================================================== */}
      <section
        id="mon-dinh"
        style={{ position: 'relative', zIndex: 5, padding: '88px 0' }}
      >
        <div className="container-hc">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="sticker-badge" style={{ marginBottom: '14px' }}>
              SIGNATURE F&B ART COLLECTION
            </div>
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(1.85rem, 3.8vw, 3.1rem)',
                fontWeight: 900,
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              TỨ ĐẠI <span className="text-gradient-hello">MỒI BÉN</span> TẠI
              HELLO CENTRAL
            </h2>
            <p
              style={{
                color: '#C9B8A6',
                maxWidth: '680px',
                margin: '0 auto',
                fontSize: '1rem',
              }}
            >
              Chế biến nóng sốt tại bếp, trình bày đậm chất nghệ thuật và bắt
              bia tuyệt đối cho mọi cuộc vui của dân chơi Dĩ An.
            </p>
          </div>

          <div className="grid-signature-4">
            {SIGNATURE_DISHES.map((dish) => (
              <TiltCard3D
                key={dish.id}
                maxTilt={11}
                style={{
                  borderRadius: '26px',
                  overflow: 'hidden',
                  background: 'rgba(27, 18, 13, 0.94)',
                  border: '2px solid rgba(255, 184, 0, 0.35)',
                  boxShadow: '0 22px 48px rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '4 / 5',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={dish.image}
                    alt={dish.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                    }}
                  >
                    <span className="sticker-badge">{dish.stickerText}</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#FFB800',
                      letterSpacing: '0.06em',
                      marginBottom: '4px',
                    }}
                  >
                    {dish.tag}
                  </div>
                  <h3
                    className="font-display"
                    style={{
                      fontSize: '1.16rem',
                      fontWeight: 900,
                      color: '#FBF3E4',
                      marginBottom: '4px',
                    }}
                  >
                    {dish.title}
                  </h3>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#FF451E',
                      marginBottom: '10px',
                    }}
                  >
                    {dish.subtitle}
                  </div>
                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: '#C9B8A6',
                      flexGrow: 1,
                    }}
                  >
                    {dish.description}
                  </p>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 5: BẢNG THỰC ĐƠN NGHỆ THUẬT 6 NHÓM MÓN + HIỆU ỨNG BỌT BIA THREEUI
          ==================================================================== */}
      <section
        id="thuc-don"
        style={{ position: 'relative', zIndex: 5, padding: '88px 0' }}
      >
        <div className="container-hc">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            <div>
              <div className="sticker-badge" style={{ marginBottom: '12px' }}>
                OFFICIAL MENU • GIÁ NIÊM YẾT MINH BẠCH (CHỈ TỪ 49K)
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(1.8rem, 3.6vw, 2.9rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                }}
              >
                THỰC ĐƠN{' '}
                <span className="text-gradient-hello">HELLO CENTRAL</span>
              </h2>
            </div>

            {/* Buttons to view Original Graphic Menu Sheets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setMenuSheetModal(1)}
                className="btn-hello-secondary"
                style={{ padding: '10px 18px', fontSize: '0.76rem' }}
              >
                🔍 XEM ẢNH MENU GỐC (TRANG 1)
              </button>
              <button
                type="button"
                onClick={() => setMenuSheetModal(2)}
                className="btn-hello-secondary"
                style={{ padding: '10px 18px', fontSize: '0.76rem' }}
              >
                🔍 XEM ẢNH MENU GỐC (TRANG 2)
              </button>
            </div>
          </div>

          {/* 6 Category Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '28px',
            }}
          >
            {MENU_CATEGORIES.map((cat) => {
              const isSelected = cat.id === activeMenuCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveMenuCategory(cat.id)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '999px',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    background: isSelected
                      ? '#FFB800'
                      : 'rgba(27, 18, 13, 0.9)',
                    color: isSelected ? '#110b08' : '#FBF3E4',
                    border: isSelected
                      ? '2px solid #FF451E'
                      : '1.5px solid rgba(255, 184, 0, 0.3)',
                    boxShadow: isSelected ? '4px 4px 0px #FF451E' : 'none',
                    transition: 'all 0.22s ease',
                  }}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>

          {/* Art Menu Board Paper (Inspired by menu-page-1.jpg & menu-page-2.jpg) */}
          <div className="art-menu-paper" style={{ padding: '36px 28px' }}>
            {/* ThreeUI Beer Condensation Droplets Overlay on the Menu Board */}
            <BeerCondensationCanvas height={520} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px',
                  paddingBottom: '20px',
                  marginBottom: '24px',
                  borderBottom: '3px solid #16110d',
                }}
              >
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      background: '#1A7F37',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      marginBottom: '6px',
                    }}
                  >
                    {currentMenuCategory.badge}
                  </span>
                  <h3
                    className="font-display"
                    style={{
                      fontSize: 'clamp(1.45rem, 2.8vw, 2.1rem)',
                      fontWeight: 900,
                      color: '#FF451E',
                      textTransform: 'uppercase',
                    }}
                  >
                    {currentMenuCategory.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.92rem',
                      color: '#3c2e25',
                      fontWeight: 600,
                    }}
                  >
                    {currentMenuCategory.subtitle}
                  </p>
                </div>

                {/* Legend Badges */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#16110d',
                  }}
                >
                  <span>🔥 Vị Cay Tê</span>
                  <span>🌿 Món Rau / Chay</span>
                  <span>⭐ Best Seller</span>
                </div>
              </div>

              {/* Menu Items 2-Column List */}
              <div className="grid-menu-2">
                {currentMenuCategory.items.map((item) => (
                  <div key={item.name} className="art-menu-row">
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: '#16110d',
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        <span>{item.name}</span>
                        {item.bestSeller && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '999px',
                              background: '#FF451E',
                              color: '#fff',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                            }}
                          >
                            ⭐ ĐINH
                          </span>
                        )}
                        {item.spicy && <span title="Món cay">🌶️</span>}
                        {item.veg && <span title="Món rau / thanh đạm">🌿</span>}
                      </div>
                      {item.note && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: '#1A7F37',
                            fontWeight: 700,
                          }}
                        >
                          ✦ {item.note}
                        </div>
                      )}
                    </div>

                    <div
                      className="font-display"
                      style={{
                        fontWeight: 900,
                        fontSize: '0.98rem',
                        color: '#FF1E27',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.price}
                      {item.price !== 'Signature' ? 'đ' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 6: ĐẶT BÀN NHANH & NHẬN QUÀ TẶNG (ZALO / HOTLINE)
          ==================================================================== */}
      <section
        id="dat-ban"
        style={{ position: 'relative', zIndex: 5, padding: '88px 0' }}
      >
        <div className="container-hc">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '36px',
              padding: '36px 28px',
              borderRadius: '32px',
              background:
                'linear-gradient(145deg, rgba(27,18,13,0.96) 0%, rgba(39,26,19,0.92) 100%)',
              border: '2px solid rgba(255, 184, 0, 0.45)',
              boxShadow: '0 28px 70px rgba(0, 0, 0, 0.65)',
            }}
            className="glow-border-hc"
          >
            {/* Left Info */}
            <div>
              <div className="sticker-badge" style={{ marginBottom: '14px' }}>
                BOOKING NOW • GIỮ VỊ TRÍ ĐẸP NHẤT
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(1.75rem, 3.4vw, 2.7rem)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  lineHeight: 1.12,
                  marginBottom: '14px',
                }}
              >
                ĐẶT BÀN TRƯỚC –{' '}
                <span className="text-gradient-hello">TẶNG MỒI BÉN LIỀN TAY</span>
              </h2>
              <p
                style={{
                  color: '#E7D8C9',
                  marginBottom: '24px',
                  fontSize: '0.98rem',
                }}
              >
                Điền thông tin bên cạnh để hệ thống tự động soạn tin nhắn đặt
                bàn kèm mã quà tặng và kết nối trực tiếp tới Zalo / Hotline của{' '}
                <strong>Hello Central Dĩ An</strong>.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginBottom: '24px',
                }}
              >
                <a
                  href={BRAND_INFO.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Mở Google Maps chỉ đường"
                  className="info-tile-hc is-link"
                >
                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: '#FFB800',
                      fontWeight: 800,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <span>📍 ĐỊA CHỈ QUÁN</span>
                    <span className="info-tile-cta">CHỈ ĐƯỜNG ↗</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#FBF3E4' }}>
                    {BRAND_INFO.address}
                  </div>
                </a>

                <div className="info-tile-hc">
                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: '#FFB800',
                      fontWeight: 800,
                    }}
                  >
                    📞 HOTLINE / ZALO ĐẶT BÀN NHANH
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: '#FF451E',
                    }}
                  >
                    {BRAND_INFO.hotline1} • {BRAND_INFO.hotline2}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <a
                  href={`tel:${BRAND_INFO.hotline1Raw}`}
                  className="btn-hello-primary"
                >
                  📞 GỌI NGAY {BRAND_INFO.hotline1}
                </a>
                <a
                  href={BRAND_INFO.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-hello-secondary"
                >
                  🗺️ MỞ GOOGLE MAPS CHỈ ĐƯỜNG
                </a>
              </div>
            </div>

            {/* Right Interactive Form */}
            <form
              onSubmit={handleBookingSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: 'rgba(17, 11, 8, 0.78)',
                padding: '24px',
                borderRadius: '24px',
                border: '1.5px solid rgba(255, 69, 30, 0.35)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#FFB800',
                      marginBottom: '6px',
                    }}
                  >
                    Tên của bạn *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Minh Quân"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#1b120d',
                      border: '1px solid rgba(255, 184, 0, 0.35)',
                      color: '#FBF3E4',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#FFB800',
                      marginBottom: '6px',
                    }}
                  >
                    Số điện thoại / Zalo *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0909 xxx xxx"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#1b120d',
                      border: '1px solid rgba(255, 184, 0, 0.35)',
                      color: '#FBF3E4',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#FFB800',
                      marginBottom: '6px',
                    }}
                  >
                    Số lượng khách
                  </label>
                  <select
                    value={bookingGuests}
                    onChange={(e) => setBookingGuests(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#1b120d',
                      border: '1px solid rgba(255, 184, 0, 0.35)',
                      color: '#FBF3E4',
                      fontSize: '0.92rem',
                    }}
                  >
                    <option>2 - 4 khách</option>
                    <option>4 - 6 khách</option>
                    <option>Nhóm 6 nữ (Tặng Tháp Soju)</option>
                    <option>8 - 15 khách (Tiệc hội bạn)</option>
                    <option>Trên 15 khách (Sinh nhật / Công ty)</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#FFB800',
                      marginBottom: '6px',
                    }}
                  >
                    Khung giờ dự kiến
                  </label>
                  <input
                    type="text"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#1b120d',
                      border: '1px solid rgba(255, 184, 0, 0.35)',
                      color: '#FBF3E4',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#FFB800',
                    marginBottom: '6px',
                  }}
                >
                  Vị trí ngồi yêu thích
                </label>
                <select
                  value={bookingZone}
                  onChange={(e) => setBookingZone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: '#1b120d',
                    border: '1px solid rgba(255, 184, 0, 0.35)',
                    color: '#FBF3E4',
                    fontSize: '0.92rem',
                  }}
                >
                  <option>Sân vườn thoáng mát dưới tường Say Hello</option>
                  <option>Cạnh cung đường gạch LED & Biển Neon hello?</option>
                  <option>Khu vực trung tâm gần DJ xập xình</option>
                  <option>Góc riêng tư cho tiệc sinh nhật / hội nhóm</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#FFB800',
                    marginBottom: '6px',
                  }}
                >
                  Chọn quà tặng đặt bàn trước
                </label>
                <select
                  value={bookingPromo}
                  onChange={(e) => setBookingPromo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: '#1b120d',
                    border: '1px solid #FF451E',
                    color: '#FFB800',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                  }}
                >
                  <option>Tặng Canh Cá Tứ Xuyên (Đặt bàn trước)</option>
                  <option>Tặng 01 Tháp Soju (Nhóm từ 6 khách nữ)</option>
                  <option>Tặng Trứng Lòng Đào Tắm Me (Đặt bàn trước)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-hello-primary"
                style={{ width: '100%', marginTop: '6px', padding: '15px' }}
              >
                🚀 GỬI YÊU CẦU ĐẶT BÀN QUA ZALO NGAY
              </button>

              {bookingCopied && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(26, 127, 55, 0.35)',
                    border: '1px solid #22c55e',
                    color: '#a7f3d0',
                    fontSize: '0.82rem',
                    textAlign: 'center',
                  }}
                >
                  ✓ Đã sao chép nội dung đặt bàn & mở Zalo Hello Central!
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer
        style={{
          position: 'relative',
          zIndex: 5,
          padding: '56px 0 40px',
          borderTop: '1px solid rgba(255, 184, 0, 0.2)',
          background: 'rgba(12, 8, 6, 0.95)',
        }}
      >
        <div className="container-hc">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src="/assets/logo.jpg"
                alt="Hello Central"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '999px',
                  border: '2px solid #FFB800',
                }}
              />
              <div>
                <div
                  className="font-display"
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: '#FBF3E4',
                  }}
                >
                  HELLO CENTRAL • DĨ AN
                </div>
                <div style={{ fontSize: '0.86rem', color: '#C9B8A6' }}>
                  <a
                    href={BRAND_INFO.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="map-link-hc map-link-underline"
                    title="Mở Google Maps chỉ đường"
                  >
                    <PinIcon /> {BRAND_INFO.address}
                  </a>{' '}
                  • Mở cửa {BRAND_INFO.openHours}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <a
                href={BRAND_INFO.fanpageUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-hello-secondary"
                style={{ padding: '10px 18px', fontSize: '0.76rem' }}
              >
                🌐 FACEBOOK FANPAGE HELLO CENTRAL
              </a>
              <a
                href={BRAND_INFO.zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-hello-primary"
                style={{ padding: '10px 18px', fontSize: '0.76rem' }}
              >
                💬 ZALO: {BRAND_INFO.hotline1}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          FLOATING QUICK CONTACT DOCK (REA Ring + Shake Animation)
          ==================================================================== */}
      <div className="quick-contact-dock">
        <a
          href={BRAND_INFO.zaloUrl}
          target="_blank"
          rel="noreferrer"
          className="quick-contact-btn quick-contact-zalo"
          title={`Chat Zalo đặt bàn: ${BRAND_INFO.hotline1}`}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 900 }}>ZALO</span>
        </a>
        <a
          href={`tel:${BRAND_INFO.hotline1Raw}`}
          className="quick-contact-btn quick-contact-phone"
          title={`Gọi Hotline: ${BRAND_INFO.hotline1}`}
        >
          <span style={{ fontSize: '1.35rem' }}>📞</span>
        </a>
      </div>

      {/* ====================================================================
          MODAL 1: FULL CINEMA PROMO VIDEO WITH SOUND
          ==================================================================== */}
      {isCinemaModalOpen && (
        <div
          onClick={() => setIsCinemaModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(10, 6, 4, 0.92)',
            backdropFilter: 'blur(18px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '960px',
              width: '100%',
              background: '#1b120d',
              borderRadius: '24px',
              border: '2px solid #FFB800',
              overflow: 'hidden',
              boxShadow: '0 30px 90px rgba(0,0,0,0.85)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,184,0,0.25)',
              }}
            >
              <span
                className="font-display"
                style={{ fontWeight: 800, color: '#FFB800', fontSize: '0.9rem' }}
              >
                🎬 VIDEO QUẢNG CÁO CHÍNH THỨC • HELLO CENTRAL DĨ AN (ÂM THANH GỐC)
              </span>
              <button
                type="button"
                onClick={() => setIsCinemaModalOpen(false)}
                style={{
                  background: '#FF451E',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Đóng ✕
              </button>
            </div>
            <video
              src="/assets/hello-hero.mp4"
              controls
              autoPlay
              playsInline
              style={{ width: '100%', maxHeight: '78vh', display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: ORIGINAL MENU GRAPHIC SHEETS (TRANG 1 & TRANG 2)
          ==================================================================== */}
      {menuSheetModal !== null && (
        <div
          onClick={() => setMenuSheetModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(10, 6, 4, 0.92)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '920px',
              width: '100%',
              maxHeight: '90vh',
              background: '#1b120d',
              borderRadius: '24px',
              border: '2px solid #FFB800',
              overflow: 'auto',
              padding: '18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMenuSheetModal(1)}
                  className={
                    menuSheetModal === 1
                      ? 'btn-hello-primary'
                      : 'btn-hello-secondary'
                  }
                  style={{ padding: '8px 16px', fontSize: '0.76rem' }}
                >
                  Menu Trang 1 (Mồi, Nướng, Gỏi, Lẩu)
                </button>
                <button
                  type="button"
                  onClick={() => setMenuSheetModal(2)}
                  className={
                    menuSheetModal === 2
                      ? 'btn-hello-primary'
                      : 'btn-hello-secondary'
                  }
                  style={{ padding: '8px 16px', fontSize: '0.76rem' }}
                >
                  Menu Trang 2 (Ăn Chắc, Bia, Tháp Soju)
                </button>
              </div>
              <button
                type="button"
                onClick={() => setMenuSheetModal(null)}
                style={{
                  background: '#FF451E',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '8px 16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Đóng ✕
              </button>
            </div>
            <img
              src={
                menuSheetModal === 1
                  ? '/assets/menu-page-1.jpg'
                  : '/assets/menu-page-2.jpg'
              }
              alt={`Thực đơn Hello Central trang ${menuSheetModal}`}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '16px',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
