/**
 * Âm thanh cho màn intro, tổng hợp bằng Web Audio (không cần file):
 * - clink(): tiếng 2 ly thuỷ tinh cụng nhau
 * - fizz():  tiếng bọt bia sủi xèo xèo
 * - kha():   tiếng "khàaa" sảng khoái sau khi nốc ngụm bia
 *
 * Nếu có file thu âm thật ở /assets/kha.mp3 thì kha() sẽ ưu tiên phát file đó.
 */

let ctx: AudioContext | null = null;

export const getAudioCtx = (): AudioContext | null => {
  if (ctx) return ctx;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
};

/** Thử mở khoá âm thanh; trả về true nếu trình duyệt cho phát tiếng */
export const tryUnlockAudio = async (): Promise<boolean> => {
  const c = getAudioCtx();
  if (!c) return false;
  try {
    if (c.state !== 'running') await Promise.race([
      c.resume(),
      new Promise((r) => setTimeout(r, 250)),
    ]);
  } catch {
    /* bị chặn */
  }
  return c.state === 'running';
};

const noiseBuffer = (c: AudioContext, seconds: number) => {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
};

/** Tiếng cụng ly: các hoạ âm cao tắt dần như thuỷ tinh */
export const clink = (when = 0) => {
  const c = getAudioCtx();
  if (!c) return;
  const t = c.currentTime + when;
  const master = c.createGain();
  master.gain.value = 0.32;
  master.connect(c.destination);

  [2093, 3136, 4186, 5274, 6645].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.01);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5 / (i + 1), t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9 - i * 0.12);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 1);
  });

  // tiếng "tách" lúc va chạm
  const n = c.createBufferSource();
  n.buffer = noiseBuffer(c, 0.05);
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 3000;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.5, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  n.connect(hp).connect(ng).connect(master);
  n.start(t);
};

/** Tiếng bọt bia sủi: nhiễu lọc dải cao với các "lốp bốp" li ti */
export const fizz = (when = 0, duration = 1.6) => {
  const c = getAudioCtx();
  if (!c) return;
  const t = c.currentTime + when;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, duration);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 5200;
  bp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.15);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  // điều biến biên độ ngẫu nhiên để nghe như bọt vỡ
  const lfo = c.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = 23;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain).connect(g.gain);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t);
  lfo.start(t);
  lfo.stop(t + duration);
};

/** Tiếng "khàaa": âm "kh" bật hơi + nguyên âm "a" khàn, cao độ hạ dần */
const synthKha = (when = 0) => {
  const c = getAudioCtx();
  if (!c) return;
  const t = c.currentTime + when;
  const dur = 1.25;

  const out = c.createGain();
  out.gain.value = 0.9;
  out.connect(c.destination);

  // 1) "kh": tiếng xát ở cổ họng
  const kh = c.createBufferSource();
  kh.buffer = noiseBuffer(c, 0.22);
  const khF = c.createBiquadFilter();
  khF.type = 'bandpass';
  khF.frequency.value = 1700;
  khF.Q.value = 1.2;
  const khG = c.createGain();
  khG.gain.setValueAtTime(0.0001, t);
  khG.gain.exponentialRampToValueAtTime(0.55, t + 0.03);
  khG.gain.exponentialRampToValueAtTime(0.08, t + 0.2);
  kh.connect(khF).connect(khG).connect(out);
  kh.start(t);

  // 2) "àaa": dây thanh (răng cưa) qua 3 formant của nguyên âm /a/
  const v0 = t + 0.1;
  const voice = c.createOscillator();
  voice.type = 'sawtooth';
  voice.frequency.setValueAtTime(185, v0);
  voice.frequency.exponentialRampToValueAtTime(150, v0 + 0.35);
  voice.frequency.exponentialRampToValueAtTime(105, v0 + dur);
  // rung giọng nhẹ cho tự nhiên
  const vib = c.createOscillator();
  vib.frequency.value = 5.5;
  const vibG = c.createGain();
  vibG.gain.value = 3;
  vib.connect(vibG).connect(voice.frequency);

  const voiceG = c.createGain();
  voiceG.gain.setValueAtTime(0.0001, v0);
  voiceG.gain.exponentialRampToValueAtTime(0.32, v0 + 0.08);
  voiceG.gain.setValueAtTime(0.3, v0 + 0.45);
  voiceG.gain.exponentialRampToValueAtTime(0.0001, v0 + dur);

  // hơi thở lẫn vào giọng (giọng khàn, sảng khoái)
  const breath = c.createBufferSource();
  breath.buffer = noiseBuffer(c, dur + 0.2);
  const breathG = c.createGain();
  breathG.gain.setValueAtTime(0.0001, v0);
  breathG.gain.exponentialRampToValueAtTime(0.22, v0 + 0.06);
  breathG.gain.exponentialRampToValueAtTime(0.0001, v0 + dur + 0.1);

  const mix = c.createGain();
  voice.connect(voiceG).connect(mix);
  breath.connect(breathG).connect(mix);

  [
    { f: 800, q: 7, g: 1 },
    { f: 1200, q: 9, g: 0.55 },
    { f: 2600, q: 11, g: 0.25 },
  ].forEach(({ f, q, g }) => {
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(f, v0);
    bp.frequency.linearRampToValueAtTime(f * 0.92, v0 + dur);
    bp.Q.value = q;
    const fg = c.createGain();
    fg.gain.value = g * 2.2;
    mix.connect(bp).connect(fg).connect(out);
  });

  voice.start(v0);
  vib.start(v0);
  breath.start(v0);
  voice.stop(v0 + dur + 0.1);
  vib.stop(v0 + dur + 0.1);
};

let realKha: HTMLAudioElement | null | undefined;

/** Nạp sẵn file khà thu âm thật (nếu có) để phát đúng lúc */
export const preloadKha = () => {
  if (realKha !== undefined) return;
  realKha = null;
  const a = new Audio('/assets/kha.mp3');
  a.preload = 'auto';
  a.addEventListener('canplaythrough', () => (realKha = a), { once: true });
  a.load();
};

/** Phát "khà": ưu tiên file /assets/kha.mp3, không có thì tổng hợp */
export const kha = (when = 0) => {
  preloadKha();
  window.setTimeout(() => {
    if (realKha) {
      realKha.currentTime = 0;
      realKha.play().catch(() => synthKha());
    } else {
      synthKha();
    }
  }, when * 1000);
};
