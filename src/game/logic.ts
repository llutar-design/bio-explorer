import {
  CREATURES,
  getHabitat,
  type Creature,
  type HabitatId,
  type SpotKind,
} from '../data/creatures.ts';

export type Rand = () => number;

/** 아직 발견하지 못한 생물은 이만큼 더 잘 나옵니다. (중복 발견도 가능) */
export const NEW_CREATURE_WEIGHT = 3;
const MIN_GAP = 16; // 탐색 요소끼리 겹치지 않게 하는 최소 거리(%)

export interface PlacedSpot {
  key: string;
  kind: SpotKind;
  x: number;
  y: number;
  variant: number;
  delay: number;
}

function shuffle<T>(list: T[], rand: Rand): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let layoutSeq = 0;

/** 탐험할 때마다 탐색 요소의 위치와 모양을 조금씩 바꿔 배치합니다. */
export function makeLayout(habitatId: HabitatId, rand: Rand = Math.random): PlacedSpot[] {
  const placed: PlacedSpot[] = [];
  layoutSeq += 1;
  getHabitat(habitatId).spots.forEach((def, i) => {
    const options = shuffle(def.positions, rand);
    const free = options.find((p) =>
      placed.every((q) => Math.hypot(p[0] - q.x, p[1] - q.y) >= MIN_GAP),
    );
    const [x, y] = free ?? options[0];
    const jitter = () => (rand() - 0.5) * 3;
    placed.push({
      key: `${habitatId}-${layoutSeq}-${i}`,
      kind: def.kind,
      x: x + (def.kind === 'trunk' ? 0 : jitter()),
      y: y + jitter(),
      variant: Math.floor(rand() * 3),
      delay: Math.round(rand() * 15) / 10,
    });
  });
  return placed;
}

export function candidatesFor(habitatId: HabitatId, kind: SpotKind): Creature[] {
  return CREATURES.filter((c) => c.habitat === habitatId && c.spots.includes(kind));
}

/** 탐색 요소를 눌렀을 때 나올 생물을 고릅니다. */
export function pickCreature(
  habitatId: HabitatId,
  kind: SpotKind,
  counts: Record<string, number>,
  rand: Rand = Math.random,
): Creature | null {
  const list = candidatesFor(habitatId, kind);
  if (list.length === 0) return null;
  const weights = list.map((c) => ((counts[c.id] ?? 0) > 0 ? 1 : NEW_CREATURE_WEIGHT));
  let r = rand() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) {
    r -= weights[i];
    if (r < 0) return list[i];
  }
  return list[list.length - 1];
}

/** 생물이 나타날 위치 (날아다니는 생물은 조금 위에) */
export function creaturePosition(spot: PlacedSpot, c: Creature): { x: number; y: number } {
  const lift = c.motion === 'fly' ? 11 : c.motion === 'swim' ? 0 : 6;
  return {
    x: Math.min(88, Math.max(12, spot.x)),
    y: Math.min(84, Math.max(20, spot.y - lift)),
  };
}

/** 받침이 있으면 '을', 없으면 '를' */
export function withEulReul(word: string): string {
  const code = word.charCodeAt(word.length - 1);
  const has = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return word + (has ? '을' : '를');
}

/** 받침이 있으면 '이', 없으면 '가' */
export function withIGa(word: string): string {
  const code = word.charCodeAt(word.length - 1);
  const has = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return word + (has ? '이' : '가');
}
