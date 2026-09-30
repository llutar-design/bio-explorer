// 짧고 부드러운 효과음 — 소리 파일 없이 브라우저에서 직접 만듭니다.
type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, at: number, dur: number, type: Wave = 'sine', vol = 0.12, slideTo?: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function rustle(at = 0, dur = 0.25, vol = 0.08) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2500;
  const gain = a.createGain();
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(t);
}

const safe = (fn: () => void) => () => {
  try {
    fn();
  } catch {
    /* 소리가 안 나도 게임은 계속 */
  }
};

export const sfx = {
  /** 풀·꽃을 살펴볼 때 바스락 */
  search: safe(() => rustle()),
  /** 생물이 뿅 나타날 때 */
  appear: safe(() => tone(520, 0.05, 0.18, 'sine', 0.1, 880)),
  /** 반짝 생물이 나타날 때 */
  appearShiny: safe(() => {
    [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.05 + i * 0.07, 0.25, 'triangle', 0.07));
  }),
  /** 잠자리채·뜰채·돋보기 */
  catch: safe(() => {
    rustle(0, 0.18, 0.05);
    tone(300, 0, 0.25, 'sine', 0.06, 600);
  }),
  /** 새로운 생물 발견 */
  newFind: safe(() => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.28, 'triangle', 0.1));
  }),
  /** 다시 만났을 때 */
  again: safe(() => {
    tone(659, 0, 0.18, 'triangle', 0.09);
    tone(880, 0.1, 0.25, 'triangle', 0.09);
  }),
  /** 미션 성공, 배지 */
  reward: safe(() => {
    [784, 988, 1175].forEach((f, i) => tone(f, i * 0.08, 0.2, 'square', 0.035));
    tone(1568, 0.26, 0.4, 'triangle', 0.08);
  }),
  /** 등급 올라감 */
  rankUp: safe(() => {
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.1));
  }),
  /** 버튼 톡 */
  tap: safe(() => tone(700, 0, 0.07, 'sine', 0.05)),
};
