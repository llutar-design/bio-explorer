// 잡기 미니게임 규칙 (시간 단위: 밀리초)
// 너무 어렵거나 쉬우면 여기 숫자만 바꾸면 됩니다.
// 원칙: 실패해도 생물이 도망가지 않고 벌점이 없으며, 몇 번 놓치면 자동으로 쉬워집니다(assist).
import type { ChallengeKind } from '../data/creatures.ts';

export type Grade = 'perfect' | 'good' | 'ok';
export type Zone = Grade | 'miss';

export const GRADE_BONUS: Record<Grade, number> = { perfect: 2, good: 1, ok: 0 };
export const GRADE_TEXT: Record<Grade, string> = { perfect: '완벽해요!', good: '좋아요!', ok: '잘했어요!' };

export const CHALLENGE_INFO: Record<ChallengeKind, { name: string; icon: string; hint: string }> = {
  ring: { name: '링 맞추기', icon: '🎯', hint: '줄어드는 링이 초록색이 될 때 눌러요!' },
  gauge: { name: '점프 타이밍', icon: '📏', hint: '막대가 초록색에 오면 “잡기!”를 눌러요!' },
  chase: { name: '날쌘 곤충 잡기', icon: '🦋', hint: '날아다니는 곤충을 눌러요! 멈출 때가 기회예요.' },
  sneak: { name: '살금살금', icon: '👣', hint: '딴 곳을 볼 때만 “살금살금”을 눌러 다가가요!' },
  hide: { name: '숨바꼭질', icon: '🕳️', hint: '빼꼼 나온 곳을 눌러요! 흔들리는 곳을 잘 봐요.' },
  swim: { name: '물속 그림자', icon: '💧', hint: '그림자가 물 위로 떠오르면 눌러요!' },
};

/** 이만큼 놓치면 쉬운 모드로 바뀝니다. */
export const ASSIST_AFTER: Record<ChallengeKind, number> = { ring: 2, gauge: 2, chase: 3, sneak: 2, hide: 3, swim: 3 };

const frac = (n: number) => n - Math.floor(n);
/** 같은 n 에는 늘 같은 0~1 값을 주는 간단한 난수 */
const noise = (n: number) => frac(Math.sin(n * 12.9898 + 4.1) * 43758.5453);

// ── 링 맞추기: 링이 2.2배에서 0.55배로 줄어듦. 1배(생물 크기)에 가까울수록 좋아요 ──
export const RING = { period: 1700, assistPeriod: 2500, from: 2.2, to: 0.55 };

export function ringScale(t: number, assist: boolean): number {
  const p = assist ? RING.assistPeriod : RING.period;
  return RING.from - (RING.from - RING.to) * ((t % p) / p);
}

export function ringZone(scale: number, assist: boolean): Zone {
  const d = Math.abs(scale - 1);
  if (d < (assist ? 0.16 : 0.12)) return 'perfect';
  if (d < (assist ? 0.5 : 0.3)) return 'good';
  return 'miss';
}

// ── 점프 타이밍: 막대가 왔다 갔다. 가운데(0.5)에 가까울수록 좋아요 ──
export const GAUGE = { period: 2400, assistPeriod: 3400, good: 0.14, perfect: 0.045, assistGood: 0.26, assistPerfect: 0.07 };

export function gaugePos(t: number, assist: boolean): number {
  const p = assist ? GAUGE.assistPeriod : GAUGE.period;
  const u = (t % p) / p;
  return u < 0.5 ? u * 2 : 2 - u * 2;
}

export function gaugeZone(pos: number, assist: boolean): Zone {
  const d = Math.abs(pos - 0.5);
  if (d < (assist ? GAUGE.assistPerfect : GAUGE.perfect)) return 'perfect';
  if (d < (assist ? GAUGE.assistGood : GAUGE.good)) return 'good';
  return 'miss';
}

// ── 날쌘 곤충 잡기: 날아다니다 잠깐 쉬어요 ──
export function chaseState(t: number, assist: boolean) {
  const move = assist ? 2000 : 2600;
  const rest = assist ? 2400 : 1100;
  const cycle = move + rest;
  const n = Math.floor(t / cycle);
  const ph = t % cycle;
  const resting = ph >= move;
  const tau = ((n * move + Math.min(ph, move)) * (assist ? 0.55 : 1)) / 1000;
  const x = 50 + 30 * Math.sin(tau * 0.9 + 0.5);
  const y = 44 + 20 * Math.sin(tau * 1.37 + 1.2);
  return { x, y, resting, facingLeft: Math.cos(tau * 0.9 + 0.5) < 0 };
}

// ── 물속 그림자: 물속을 헤엄치다 물 위로 떠올라요 ──
export type SwimStage = 'under' | 'rise' | 'up' | 'dive';

export function swimState(t: number, assist: boolean) {
  const under = 2000;
  const rise = 450;
  const up = assist ? 2600 : 1500;
  const dive = 350;
  const cycle = under + rise + up + dive;
  const n = Math.floor(t / cycle);
  const ph = t % cycle;
  let stage: SwimStage = 'under';
  if (ph >= under + rise + up) stage = 'dive';
  else if (ph >= under + rise) stage = 'up';
  else if (ph >= under) stage = 'rise';
  const tau = (n * under + Math.min(ph, under)) / 1000;
  const upFrac = stage === 'up' ? (ph - under - rise) / up : 0;
  return {
    x: 50 + 22 * Math.sin(tau * 1.1),
    y: 74 + 8 * Math.sin(tau * 1.7 + 0.8),
    stage,
    upFrac,
    facingLeft: Math.cos(tau * 1.1) < 0,
  };
}

// ── 살금살금: 딴 곳 봄(away) → 곧 돌아봄(warn) → 이쪽을 봄(look) ──
export type SneakLook = 'away' | 'warn' | 'look';
export const SNEAK_STEPS = 3;

export function sneakState(t: number, assist: boolean): SneakLook {
  const warn = 450;
  let acc = 0;
  for (let n = 0; n < 500; n++) {
    const away = (assist ? 2600 : 1500) + noise(n) * 900;
    const look = assist ? 900 : 1100 + noise(n + 99) * 500;
    if (t < acc + away) return 'away';
    if (t < acc + away + warn) return 'warn';
    if (t < acc + away + warn + look) return 'look';
    acc += away + warn + look;
  }
  return 'away';
}

// ── 숨바꼭질: 세 곳 중 한 곳이 흔들리고(wiggle) → 빼꼼(peek) → 숨음(gap) ──
export type HideStage = 'wiggle' | 'peek' | 'gap';
export const HIDE_HOLES = 3;

export function hideState(t: number, assist: boolean): { hole: number; stage: HideStage } {
  const wiggle = 500;
  const peek = assist ? 2200 : 1300;
  const gap = 450;
  const cycle = wiggle + peek + gap;
  const n = Math.floor(t / cycle);
  const ph = t % cycle;
  // 매번 다른 곳에서 나오도록 (같은 곳 연속 없음)
  let hole = 1;
  for (let i = 1; i <= n; i++) hole = (hole + 1 + Math.floor(noise(i) * 2)) % HIDE_HOLES;
  const stage: HideStage = ph < wiggle ? 'wiggle' : ph < wiggle + peek ? 'peek' : 'gap';
  return { hole, stage };
}
