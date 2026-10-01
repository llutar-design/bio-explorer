import { CREATURES } from '../data/creatures.ts';
import { BADGES, STAR_AGAIN, STAR_NEW, refreshMissions, type GameState, type Mission } from './progress.ts';
import { isValidCard, type Card } from './cards.ts';

// 기록은 이 브라우저의 localStorage 에만 저장합니다. (서버·개인정보 없음)
const KEY = 'uri-ban-bio-explorer:v1';

export interface SaveData extends GameState {
  version: 2;
  /** 효과음 켜기/끄기 */
  sound: boolean;
}

export const emptySave = (sound = true): SaveData => {
  const base: SaveData = {
    version: 2,
    counts: {},
    shiny: {},
    celebrated: false,
    stars: 0,
    totalFinds: 0,
    missionsDone: 0,
    perfects: 0,
    cards: [],
    quizCorrect: 0,
    playDays: [],
    missions: [],
    badges: [],
    sound,
  };
  return { ...base, missions: refreshMissions(base) };
};

export function isStorageAvailable(): boolean {
  try {
    const k = '__bio_explorer_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

const ids = new Set(CREATURES.map((c) => c.id));

function cleanCounts(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!v || typeof v !== 'object') return out;
  for (const [id, n] of Object.entries(v as Record<string, unknown>)) {
    if (ids.has(id) && typeof n === 'number' && Number.isFinite(n) && n > 0) out[id] = Math.floor(n);
  }
  return out;
}

const num = (v: unknown, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;

function cleanMissions(v: unknown): Mission[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (m): m is Mission =>
      !!m &&
      typeof m === 'object' &&
      typeof m.id === 'string' &&
      ['habitat', 'group', 'new', 'tool', 'creature', 'perfect'].includes(m.kind) &&
      typeof m.target === 'string' &&
      typeof m.need === 'number' &&
      typeof m.have === 'number' &&
      typeof m.reward === 'number' &&
      !m.done &&
      (m.kind !== 'creature' || ids.has(m.target)),
  );
}

export function loadSave(): SaveData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptySave();
    const p = parsed as Record<string, unknown>;
    const counts = cleanCounts(p.counts);
    const finds = Object.values(counts).reduce((a, b) => a + b, 0);
    // 첫 버전 기록(별·미션 없음)은 발견 기록으로 별을 계산해서 이어 줍니다.
    const isOld = p.version !== 2;
    const stars = isOld
      ? Object.values(counts).reduce((a, n) => a + STAR_NEW + (n - 1) * STAR_AGAIN, 0)
      : num(p.stars, 0);
    const state: SaveData = {
      version: 2,
      counts,
      shiny: cleanCounts(p.shiny),
      celebrated: p.celebrated === true,
      stars,
      totalFinds: Math.max(finds, num(p.totalFinds, 0)),
      missionsDone: num(p.missionsDone, 0),
      perfects: num(p.perfects, 0),
      cards: Array.isArray(p.cards) ? p.cards.filter((c): c is Card => isValidCard(c) && ids.has(c.c)) : [],
      quizCorrect: num(p.quizCorrect, 0),
      playDays: Array.isArray(p.playDays)
        ? p.playDays.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-60)
        : [],
      missions: cleanMissions(p.missions),
      badges: Array.isArray(p.badges) ? p.badges.filter((b): b is string => typeof b === 'string') : [],
      sound: p.sound !== false,
    };
    // 조건을 이미 채운 배지는 바로 달아 줍니다.
    const earned = BADGES.filter((b) => !state.badges.includes(b.id) && b.earned(state)).map((b) => b.id);
    const withBadges = { ...state, badges: [...state.badges, ...earned] };
    return { ...withBadges, missions: refreshMissions(withBadges) };
  } catch {
    return emptySave();
  }
}

/** 저장에 성공하면 true */
export function writeSave(data: SaveData): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
