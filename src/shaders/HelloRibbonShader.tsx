import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Adapted from ThreeUI's RibbonFieldBackground shader, tuned to Hello Central's
// Warm Neon Red (#FF1E27), Brand Orange (#FF451E), and Beer Amber LED (#FFB800) palette.
const FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform vec2 pointer;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float ribbon(vec2 uv, float offset, float width, float phase) {
    float y = 0.52 + 0.21 * sin((uv.x * 2.25) + phase) + 0.05 * sin((uv.x * 6.8) - phase * 0.75);
    float d = abs(uv.y - y - offset);
    return exp(-(d * d) / width);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float t = time * 0.28;
    float driftX = (pointer.x - 0.5) * 0.08;
    float driftY = (pointer.y - 0.5) * 0.04;

    float r1 = ribbon(vec2(uv.x + driftX, uv.y + driftY), 0.02, 0.0075, t + 0.8);
    float r2 = ribbon(vec2(uv.x - driftX * 0.7, uv.y - driftY * 0.5), -0.20, 0.0095, t + 3.1);
    float r3 = ribbon(vec2(uv.x + driftX * 0.4, uv.y + driftY * 0.3), 0.22, 0.015, t + 1.7);

    float glow = r1 * 1.2 + r2 * 1.05 + r3 * 0.55;

    // Hello Central Brand Colors in linear RGB
    vec3 helloOrange = vec3(1.0, 0.27, 0.118);   // #FF451E
    vec3 neonRed     = vec3(1.0, 0.118, 0.153);  // #FF1E27
    vec3 beerAmber   = vec3(1.0, 0.722, 0.0);    // #FFB800
    vec3 popGreen    = vec3(0.102, 0.498, 0.216);// #1A7F37

    vec3 col = vec3(0.0);
    col += helloOrange * r1 * 0.95;
    col += beerAmber * r1 * 0.58;
    col += neonRed * r2 * 0.82;
    col += beerAmber * r3 * 0.48;
    col += popGreen * (r2 * r3) * 0.35;

    float bloom = exp(-pow(distance(uv, vec2(0.75 + driftX * 0.5, 0.42 + 0.04 * sin(t))), 2.0) / 0.055);
    bloom += exp(-pow(distance(uv, vec2(0.25 - driftX * 0.4, 0.68 + 0.03 * cos(t))), 2.0) / 0.040);
    col += vec3(1.0, 0.58, 0.22) * bloom * 0.38;

    // ThreeUI halftone dot-matrix scanline texture
    vec2 grid = fract(gl_FragCoord.xy / 6.5) - 0.5;
    float dotShape = smoothstep(0.31, 0.10, length(grid));
    float noise = hash(floor(gl_FragCoord.xy / 6.5));
    float scan = 0.74 + 0.26 * sin((uv.x + uv.y) * 34.0 + time * 1.4);
    float dots = mix(0.65, 1.0, dotShape * (0.5 + 0.5 * noise) * scan);

    float alpha = clamp((glow * 1.45 + bloom * 0.48) * dots, 0.0, 1.0);
    vec3 base = vec3(0.067, 0.043, 0.031); // #110b08 Warm Espresso Night
    vec3 finalColor = mix(base, col + base, clamp(alpha * 1.35, 0.0, 1.0));

    gl_FragColor = vec4(finalColor, alpha * 0.88);
  }
`;

export const HelloRibbonShader: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 0.45 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, 'resolution');
    const timeLoc = gl.getUniformLocation(program, 'time');
    const ptrLoc = gl.getUniformLocation(program, 'pointer');

    let pointerX = 0.5;
    let pointerY = 0.5;
    let targetX = 0.5;
    let targetY = 0.5;
    let rafId = 0;
    const startTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, Math.floor(window.innerWidth * dpr));
      const h = Math.max(1, Math.floor(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX / Math.max(1, window.innerWidth);
      targetY = 1.0 - e.clientY / Math.max(1, window.innerHeight);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const render = (now: number) => {
      pointerX += (targetX - pointerX) * 0.06;
      pointerY += (targetY - pointerY) * 0.06;
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, (now - startTime) * 0.001);
      gl.uniform2f(ptrLoc, pointerX, pointerY);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
        display: 'block',
      }}
    />
  );
};
export default HelloRibbonShader;
