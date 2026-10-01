// 생태 퀴즈: 도감에 적힌 설명(확인된 내용)만으로 문제를 만들어요.
// 틀려도 벌점 없이 정답과 설명을 보여 줘요.
import { CREATURES, HABITATS, getHabitat, type Creature, type HabitatId } from '../data/creatures.ts';
import { withEulReul, type Rand } from './logic.ts';

export const QUIZ_LENGTH = 5;
/** 한 문제 맞힐 때마다 받는 별 */
export const QUIZ_STAR = 2;

export type QuizKind = 'fact' | 'insect' | 'place';

export interface QuizChoice {
  key: string;
  label: string;
  /** 그림을 보여 줄 생물 id (있으면) */
  creatureId?: string;
  habitat?: HabitatId;
}

export interface QuizQuestion {
  kind: QuizKind;
  /** 문제의 주인공 생물 */
  creature: Creature;
  prompt: string;
  /** 설명 문장 (fact 문제) */
  clue?: string;
  choices: QuizChoice[];
  answer: string;
  /** 정답 뒤에 보여 줄 설명 */
  explain: string;
}

function shuffle<T>(list: T[], rand: Rand): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const INSECT_RULE = '곤충은 몸이 머리·가슴·배 세 부분으로 나뉘고, 다리가 6개예요.';

function factQuestion(c: Creature, rand: Rand): QuizQuestion {
  // 설명에 정답 이름이 그대로 들어 있으면 너무 쉬우니 가려요
  const clue = c.fact.split(c.name).join('○○');
  const others = shuffle(CREATURES.filter((x) => x.id !== c.id), rand).slice(0, 2);
  const choices = shuffle([c, ...others], rand).map((x) => ({ key: x.id, label: x.name, creatureId: x.id }));
  return {
    kind: 'fact',
    creature: c,
    prompt: '이 설명에 맞는 생물은 무엇일까요?',
    clue,
    choices,
    answer: c.id,
    explain: `정답은 ${c.name}! ${c.fact}`,
  };
}

/** 은/는 */
const topic = (w: string) => w + (hasBatchim(w) ? '은' : '는');
/** 이에요/예요 (괄호 안 설명은 빼고 판단) */
const copula = (w: string) => w + (hasBatchim(w.replace(/\(.*\)$/, '')) ? '이에요' : '예요');

function insectQuestion(c: Creature): QuizQuestion {
  const isInsect = c.group === 'insect';
  return {
    kind: 'insect',
    creature: c,
    prompt: `${topic(c.name)} 곤충일까요?`,
    choices: [
      { key: 'yes', label: '곤충이에요' },
      { key: 'no', label: '곤충이 아니에요' },
    ],
    answer: isInsect ? 'yes' : 'no',
    explain: isInsect
      ? `${topic(c.name)} 곤충이에요. ${INSECT_RULE}`
      : `${topic(c.name)} 곤충이 아니라 ${copula(c.kindLabel)} ${c.fact}`,
  };
}

function placeQuestion(c: Creature, rand: Rand): QuizQuestion {
  return {
    kind: 'place',
    creature: c,
    prompt: `게임 속에서 ${withEulReul(c.name)} 만날 수 있는 곳은 어디일까요?`,
    choices: shuffle(HABITATS, rand).map((h) => ({ key: h.id, label: h.name, habitat: h.id })),
    answer: c.habitat,
    explain: `게임에서는 ${getHabitat(c.habitat).name}(${c.placeText})에서 만날 수 있어요. 실제 자연에서는 다른 곳에서도 볼 수 있어요.`,
  };
}

function hasBatchim(word: string): boolean {
  const code = word.charCodeAt(word.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
}

/**
 * 퀴즈 한 판 만들기
 * - 발견한 생물이 더 자주 나와서 도감에서 본 내용을 다시 떠올려요
 * - 같은 생물이 한 판에 두 번 나오지 않아요
 */
export function makeQuiz(counts: Record<string, number>, rand: Rand = Math.random): QuizQuestion[] {
  const found = shuffle(CREATURES.filter((c) => (counts[c.id] ?? 0) > 0), rand);
  const rest = shuffle(CREATURES.filter((c) => !((counts[c.id] ?? 0) > 0)), rand);
  // 발견한 생물을 70% 정도, 아직 못 본 생물도 조금 섞어요
  const pool: Creature[] = [];
  while (pool.length < QUIZ_LENGTH && (found.length || rest.length)) {
    const fromFound = found.length > 0 && (rest.length === 0 || rand() < 0.7);
    pool.push((fromFound ? found : rest).shift()!);
  }
  const kinds: QuizKind[] = shuffle(['fact', 'fact', 'insect', 'place', 'insect'], rand);
  return pool.slice(0, QUIZ_LENGTH).map((c, i) => {
    const k = kinds[i % kinds.length];
    if (k === 'fact') return factQuestion(c, rand);
    if (k === 'insect') return insectQuestion(c);
    return placeQuestion(c, rand);
  });
}
