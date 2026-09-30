// 게임 재미 요소: 별, 탐험가 등급, 배지(스티커), 탐험 미션, 반짝 생물
// 숫자나 이름을 바꾸고 싶으면 이 파일만 고치면 됩니다.
import {
  CREATURES,
  HABITATS,
  TOTAL,
  countDiscovered,
  getCreature,
  getHabitat,
  type Creature,
  type Group,
  type HabitatId,
  type Tool,
} from '../data/creatures.ts';
import type { Rand } from './logic.ts';

// ── 별 ──
export const STAR_NEW = 3; // 새로운 생물 발견
export const STAR_AGAIN = 1; // 다시 발견
export const STAR_SHINY = 3; // 반짝 생물이면 더
/** 생물이 반짝반짝 빛나며 나올 확률 (도감 완성에는 필요 없는 보너스) */
export const SHINY_CHANCE = 1 / 12;

// ── 탐험가 등급 ──
export interface Rank {
  min: number;
  name: string;
  icon: string;
}

export const RANKS: Rank[] = [
  { min: 0, name: '새싹 탐험가', icon: '🌱' },
  { min: 20, name: '꼬마 탐험가', icon: '🐣' },
  { min: 60, name: '풀잎 탐험가', icon: '🍀' },
  { min: 130, name: '숲속 탐험가', icon: '🌳' },
  { min: 250, name: '척척 탐험가', icon: '🧭' },
  { min: 450, name: '으뜸 탐험가', icon: '🏅' },
  { min: 750, name: '생물 박사', icon: '🎓' },
];

export function rankOf(stars: number): { index: number; rank: Rank; next: Rank | null } {
  let index = 0;
  RANKS.forEach((r, i) => {
    if (stars >= r.min) index = i;
  });
  return { index, rank: RANKS[index], next: RANKS[index + 1] ?? null };
}

// ── 게임 상태 ──
export type MissionKind = 'habitat' | 'group' | 'new' | 'tool' | 'creature';

export interface Mission {
  id: string;
  kind: MissionKind;
  target: string;
  need: number;
  have: number;
  done: boolean;
  reward: number;
}

export interface GameState {
  counts: Record<string, number>;
  shiny: Record<string, number>;
  celebrated: boolean;
  stars: number;
  totalFinds: number;
  missionsDone: number;
  missions: Mission[];
  badges: string[];
}

// ── 배지(스티커) ──
export interface Badge {
  id: string;
  name: string;
  icon: string;
  /** 얻는 방법 (짧게) */
  desc: string;
  earned: (s: GameState) => boolean;
}

const foundAll = (s: GameState, list: Creature[]) => list.every((c) => (s.counts[c.id] ?? 0) > 0);
const inHabitat = (h: HabitatId) => CREATURES.filter((c) => c.habitat === h);
const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

export const BADGES: Badge[] = [
  { id: 'first-find', name: '첫 발견', icon: '🔍', desc: '생물을 처음 발견하기', earned: (s) => s.totalFinds >= 1 },
  { id: 'flower-master', name: '꽃밭 박사', icon: '🌼', desc: '꽃밭 생물 모두 찾기', earned: (s) => foundAll(s, inHabitat('flower')) },
  { id: 'grass-master', name: '풀숲 박사', icon: '🌿', desc: '풀숲 생물 모두 찾기', earned: (s) => foundAll(s, inHabitat('grass')) },
  { id: 'tree-master', name: '나무 박사', icon: '🌳', desc: '나무 생물 모두 찾기', earned: (s) => foundAll(s, inHabitat('tree')) },
  { id: 'pond-master', name: '연못 박사', icon: '💧', desc: '연못 생물 모두 찾기', earned: (s) => foundAll(s, inHabitat('pond')) },
  { id: 'insect-master', name: '곤충 박사', icon: '🦋', desc: '곤충 모두 찾기', earned: (s) => foundAll(s, CREATURES.filter((c) => c.group === 'insect')) },
  { id: 'animal-friend', name: '동물 친구', icon: '🐸', desc: '다른 동물 모두 찾기', earned: (s) => foundAll(s, CREATURES.filter((c) => c.group === 'other')) },
  { id: 'shiny-first', name: '반짝 발견', icon: '✨', desc: '반짝이는 생물 만나기', earned: (s) => sum(s.shiny) >= 1 },
  { id: 'shiny-five', name: '반짝 수집가', icon: '🌟', desc: '반짝이는 생물 5번 만나기', earned: (s) => sum(s.shiny) >= 5 },
  { id: 'mission-5', name: '미션 도전자', icon: '🎯', desc: '미션 5개 성공하기', earned: (s) => s.missionsDone >= 5 },
  { id: 'mission-30', name: '미션 달인', icon: '🏆', desc: '미션 30개 성공하기', earned: (s) => s.missionsDone >= 30 },
  { id: 'finds-100', name: '부지런한 탐험가', icon: '👣', desc: '생물 100번 발견하기', earned: (s) => s.totalFinds >= 100 },
  { id: 'dex-complete', name: '도감 완성', icon: '📖', desc: `${TOTAL}가지 모두 찾기`, earned: (s) => countDiscovered(s.counts) === TOTAL },
];

// ── 탐험 미션 ──
export const MISSION_SLOTS = 3;

const GROUP_WORD: Record<Group, string> = { insect: '곤충', other: '다른 동물' };
const TOOL_TEXT: Record<Tool, string> = { net: '잠자리채로', scoop: '뜰채로', loupe: '돋보기로' };
const TOOL_VERB: Record<Tool, string> = { net: '채집', scoop: '채집', loupe: '관찰' };

export function missionText(m: Mission): string {
  switch (m.kind) {
    case 'habitat':
      return `${getHabitat(m.target as HabitatId).name}에서 ${m.need}번 발견`;
    case 'group':
      return `${GROUP_WORD[m.target as Group]} ${m.need}번 발견`;
    case 'new':
      return '새로운 생물 찾기';
    case 'tool':
      return `${TOOL_TEXT[m.target as Tool]} ${m.need}번 ${TOOL_VERB[m.target as Tool]}`;
    case 'creature': {
      const c = getCreature(m.target);
      return c ? `${getHabitat(c.habitat).name}에서 ${c.name} 만나기` : '생물 만나기';
    }
  }
}

/** 미션 아이콘에 쓸 장소 (없으면 null) */
export function missionHabitat(m: Mission): HabitatId | null {
  if (m.kind === 'habitat') return m.target as HabitatId;
  if (m.kind === 'creature') return getCreature(m.target)?.habitat ?? null;
  if (m.kind === 'tool' && m.target === 'scoop') return 'pond';
  return null;
}

let missionSeq = 0;
const pickOne = <T,>(list: T[], rand: Rand): T => list[Math.floor(rand() * list.length)];

function makeMission(s: GameState, others: Mission[], rand: Rand): Mission {
  const usedKinds = new Set(others.map((m) => m.kind));
  const undiscovered = CREATURES.filter((c) => !(s.counts[c.id] > 0));
  let kinds: MissionKind[] = ['habitat', 'group', 'tool', 'creature'];
  if (undiscovered.length > 0) kinds.push('new', 'creature');
  const fresh = kinds.filter((k) => !usedKinds.has(k));
  if (fresh.length > 0) kinds = fresh;
  const kind = pickOne(kinds, rand);
  missionSeq += 1;
  const id = `m${Date.now().toString(36)}${missionSeq}${Math.floor(rand() * 1000)}`;
  const base = { id, kind, have: 0, done: false };

  if (kind === 'habitat') {
    const used = new Set(others.filter((m) => m.kind === 'habitat').map((m) => m.target));
    const h = pickOne(HABITATS.filter((x) => !used.has(x.id)), rand) ?? HABITATS[0];
    return { ...base, target: h.id, need: 3 + Math.floor(rand() * 2), reward: 4 };
  }
  if (kind === 'group') {
    const g: Group = rand() < 0.6 ? 'insect' : 'other';
    return { ...base, target: g, need: g === 'insect' ? 4 + Math.floor(rand() * 2) : 3, reward: 4 };
  }
  if (kind === 'tool') {
    const t = pickOne<Tool>(['net', 'net', 'scoop', 'loupe'], rand);
    return { ...base, target: t, need: t === 'net' ? 4 : 3, reward: 4 };
  }
  if (kind === 'new') {
    return { ...base, target: '', need: 1, reward: 5 };
  }
  // creature: 아직 못 찾은 생물을 더 자주 골라 도감 채우기를 도와요
  const pool = undiscovered.length > 0 && rand() < 0.7 ? undiscovered : CREATURES;
  const used = new Set(others.filter((m) => m.kind === 'creature').map((m) => m.target));
  const c = pickOne(pool.filter((x) => !used.has(x.id)), rand) ?? pickOne(CREATURES, rand);
  return { ...base, target: c.id, need: 1, reward: 5 };
}

/** 성공한 미션은 빼고, 빈자리를 새 미션으로 채웁니다. */
export function refreshMissions(s: GameState, rand: Rand = Math.random): Mission[] {
  const list = s.missions.filter((m) => !m.done);
  while (list.length < MISSION_SLOTS) list.push(makeMission(s, list, rand));
  return list;
}

function matches(m: Mission, c: Creature, isNew: boolean): boolean {
  switch (m.kind) {
    case 'habitat': return c.habitat === m.target;
    case 'group': return c.group === m.target;
    case 'new': return isNew;
    case 'tool': return c.tool === m.target;
    case 'creature': return c.id === m.target;
  }
}

// ── 발견 1번 처리 ──
export interface FindEvents {
  isNew: boolean;
  count: number;
  shiny: boolean;
  starsGained: number;
  missionsCompleted: Mission[];
  newBadges: Badge[];
  rankUp: Rank | null;
  completedNow: boolean;
}

export function applyFind<S extends GameState>(
  prev: S,
  creature: Creature,
  shiny: boolean,
  rand: Rand = Math.random,
): { next: S; events: FindEvents } {
  const before = prev.counts[creature.id] ?? 0;
  const isNew = before === 0;
  const counts = { ...prev.counts, [creature.id]: before + 1 };
  const shinyMap = shiny ? { ...prev.shiny, [creature.id]: (prev.shiny[creature.id] ?? 0) + 1 } : prev.shiny;
  let stars = prev.stars + (isNew ? STAR_NEW : STAR_AGAIN) + (shiny ? STAR_SHINY : 0);
  let missionsDone = prev.missionsDone;

  const missionsCompleted: Mission[] = [];
  const missions = refreshMissions(prev, rand).map((m) => {
    if (m.done || !matches(m, creature, isNew)) return m;
    const have = Math.min(m.need, m.have + 1);
    const done = have >= m.need;
    const updated = { ...m, have, done };
    if (done) {
      stars += m.reward;
      missionsDone += 1;
      missionsCompleted.push(updated);
    }
    return updated;
  });

  const draft: S = {
    ...prev,
    counts,
    shiny: shinyMap,
    stars,
    totalFinds: prev.totalFinds + 1,
    missionsDone,
    missions,
  };
  const newBadges = BADGES.filter((b) => !prev.badges.includes(b.id) && b.earned(draft));
  const completedNow = countDiscovered(counts) === TOTAL && !prev.celebrated;
  const next: S = {
    ...draft,
    badges: [...prev.badges, ...newBadges.map((b) => b.id)],
    celebrated: prev.celebrated || completedNow,
  };
  const r0 = rankOf(prev.stars).index;
  const r1 = rankOf(stars).index;

  return {
    next,
    events: {
      isNew,
      count: before + 1,
      shiny,
      starsGained: stars - prev.stars,
      missionsCompleted,
      newBadges,
      rankUp: r1 > r0 ? RANKS[r1] : null,
      completedNow,
    },
  };
}
