import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Three.js 3D Particle & Glowing Pathway Field inspired by Hello Central's
// curved warm LED brick pathway and glowing neon "hello?" sign.
export const ThreeEmberPathway: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const initW = Math.max(1, container.clientWidth || window.innerWidth);
    const initH = Math.max(1, container.clientHeight || window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, initW / initH, 0.1, 100);
    camera.position.set(0, 1.2, 8.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initW, initH);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // Create a soft radial glow sprite texture for 3D bokeh embers
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sCtx = spriteCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(255, 210, 140, 0.8)');
      grad.addColorStop(0.7, 'rgba(255, 69, 30, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(spriteCanvas);

    // 1. Floating Warm Bokeh & Beer Bubbles in 3D space
    const count = 240;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    const palette = [
      new THREE.Color('#FF451E'), // Hello Orange-Red
      new THREE.Color('#FF1E27'), // Neon Sign Red
      new THREE.Color('#FFB800'), // Warm LED Pathway Amber
      new THREE.Color('#FBF3E4'), // Warm Cream
      new THREE.Color('#26A641'), // Pop-Art Sticker Green accent
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 9;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      speeds[i] = 0.35 + Math.random() * 0.85;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.28,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 2. Winding 3D LED Pathway Ribbon (inspired by Hello Central's glowing walkway)
    const curvePoints: THREE.Vector3[] = [];
    const segments = 90;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const z = 5 - t * 14;
      const x = Math.sin(t * Math.PI * 2.2) * 2.4;
      const y = -2.6 + Math.cos(t * Math.PI * 1.5) * 0.35;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.035, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFB800'),
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const pathwayTube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(pathwayTube);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let rafId = 0;
    const clock = new THREE.Clock();

    const onPointerMove = (e: PointerEvent) => {
      targetMouseX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      targetMouseY = -(e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize, { passive: true });

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const posAttr = geometry.getAttribute(
        'position'
      ) as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i);
        let x = posAttr.getX(i);
        y += 0.008 * speeds[i];
        x += Math.sin(elapsed * 0.7 + i) * 0.0025;
        if (y > 5.5) y = -5.5;
        posAttr.setXY(i, x, y);
      }
      posAttr.needsUpdate = true;

      points.rotation.y = mouseX * 0.18 + Math.sin(elapsed * 0.15) * 0.06;
      points.rotation.x = mouseY * 0.1;

      pathwayTube.rotation.y = mouseX * 0.12;
      pathwayTube.position.x = Math.sin(elapsed * 0.6) * 0.18;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 2,
      }}
    />
  );
};
export default ThreeEmberPathway;
