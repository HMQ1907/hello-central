import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hiệu ứng GSAP + ScrollTrigger cho toàn trang (chạy sau màn intro):
 * - Tiêu đề hero bật lên từng dòng kiểu 3D
 * - Tiêu đề các section "mở màn" theo cuộn
 * - 2 ruy băng chữ X xoay/kéo giãn theo cuộn, huy hiệu 🍻 xoay theo
 * - Parallax cho video hero, banner, ảnh không gian
 * - Bảng thực đơn nghiêng nhẹ rồi thẳng lại khi cuộn tới
 * - Nút chính "hút" theo con trỏ (magnetic)
 * - Số liệu đếm lên
 */
export const GsapEffects: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      /* 1. Tiêu đề hero: từng dòng lật 3D bật lên */
      const heroLines = gsap.utils.toArray<HTMLElement>('#top h1 > span');
      gsap.set('#top h1', { perspective: 800 });
      gsap.set(heroLines, { display: 'inline-block' });
      gsap.from(heroLines, {
        yPercent: 90,
        rotateX: -75,
        opacity: 0,
        transformOrigin: '50% 100%',
        duration: 1.1,
        ease: 'back.out(1.6)',
        stagger: 0.15,
        delay: 0.15,
      });

      /* Ảnh nổi bật hero: trôi lên chậm hơn khi cuộn (parallax) */
      gsap.to('#top video', {
        yPercent: 18,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-floaters', {
        yPercent: -35,
        ease: 'none',
        scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true },
      });

      /* 2. Tiêu đề section: mở màn bằng clip-path + trượt lên */
      gsap.utils
        .toArray<HTMLElement>('section:not(#top) h2')
        .forEach((h2) => {
          gsap.fromTo(
            h2,
            { clipPath: 'inset(0 0 100% 0)', y: 60, skewY: 4 },
            {
              clipPath: 'inset(0 0 -20% 0)',
              y: 0,
              skewY: 0,
              duration: 1.1,
              ease: 'expo.out',
              scrollTrigger: { trigger: h2, start: 'top 88%' },
            }
          );
        });

      /* 3. Ruy băng chữ X: góc xoay mở rộng + trượt ngang theo cuộn */
      const stage = document.querySelector('.crossed-marquee-stage');
      if (stage) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
        tl.fromTo(
          stage,
          { '--x-angle': '1.5deg', '--x-shift': '-5%' },
          { '--x-angle': '7deg', '--x-shift': '5%', ease: 'none' },
          0
        )
          .fromTo(
            '.marquee-cross-badge',
            { rotate: -180, scale: 0.4 },
            { rotate: 180, scale: 1.15, ease: 'none' },
            0
          );
      }

      /* 4. Parallax cho ảnh banner & ảnh trong thẻ không gian */
      gsap.utils.toArray<HTMLElement>('.banner-showcase-hc img').forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -6, scale: 1.12 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
      });

      /* 5. Bảng thực đơn: nghiêng như tờ giấy rồi thẳng lại */
      gsap.fromTo(
        '.art-menu-paper',
        { rotate: -3, y: 80, transformOrigin: '0% 100%' },
        {
          rotate: 0,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.art-menu-paper', start: 'top bottom', end: 'top 45%', scrub: 0.8 },
        }
      );

      /* 6. Thẻ món chính: xoè ra như bài khi cuộn tới */
      const dishCards = gsap.utils.toArray<HTMLElement>('#mon-dinh .grid-signature-4 > *');
      if (dishCards.length) {
        gsap.from(dishCards, {
          rotate: (i) => (i - (dishCards.length - 1) / 2) * 6,
          y: 120,
          ease: 'power3.out',
          duration: 1.1,
          stagger: 0.1,
          scrollTrigger: { trigger: '#mon-dinh .grid-signature-4', start: 'top 85%' },
          clearProps: 'rotate,y',
        });
      }

      /* 7. Số liệu đếm lên (60+ MÓN) */
      document.querySelectorAll<HTMLElement>('.stat-card-hc .font-display').forEach((el) => {
        const m = el.textContent?.match(/^(\d+)(\+.*)$/);
        if (!m) return;
        const target = parseInt(m[1], 10);
        const suffix = m[2];
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          delay: 0.6,
          onUpdate: () => {
            el.textContent = `${Math.round(obj.v)}${suffix}`;
          },
        });
      });
    });

    /* 8. Nút chính "hút" theo con trỏ (chỉ trên máy có chuột) */
    if (window.matchMedia?.('(hover: hover)').matches) {
      document.querySelectorAll<HTMLElement>('.btn-hello-primary, .sound-icon-btn').forEach((btn) => {
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
        const move = (e: PointerEvent) => {
          const r = btn.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        btn.addEventListener('pointermove', move);
        btn.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          btn.removeEventListener('pointermove', move);
          btn.removeEventListener('pointerleave', leave);
        });
      });
    }

    // Ảnh tải xong làm chiều cao trang đổi → tính lại vị trí trigger
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const t = window.setTimeout(refresh, 800);

    return () => {
      window.removeEventListener('load', refresh);
      window.clearTimeout(t);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [enabled]);

  return null;
};

export default GsapEffects;
