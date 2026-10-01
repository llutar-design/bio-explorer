// 생물 카드: 생물을 잡을 때마다 한 장씩 받아요.
// 등급 이름·확률·수식어는 이 파일에서 바꿀 수 있습니다.
// 수식어는 성격·분위기만 나타내고, 생물의 실제 특징을 잘못 알려 주는 말은 쓰지 않아요.
import type { Rand } from './logic.ts';
import type { Grade } from './challenges.ts';

export interface CardGrade {
  name: string;
  stars: number;
  /** 뽑힐 비율 (전체 합에 대한 비율) */
  weight: number;
  modifiers: string[];
}

export const CARD_GRADES: CardGrade[] = [
  {
    name: '일반',
    stars: 1,
    weight: 55,
    modifiers: ['씩씩한', '느긋한', '부지런한', '호기심 많은', '수줍은', '꼬마', '졸린', '신나는', '깔끔한', '다정한'],
  },
  {
    name: '희귀',
    stars: 2,
    weight: 28,
    modifiers: ['용감한', '똑똑한', '멋쟁이', '행복한', '꿈꾸는', '명랑한', '든든한', '반가운'],
  },
  {
    name: '영웅',
    stars: 3,
    weight: 12,
    modifiers: ['햇살 가득한', '이슬 빛나는', '숲속 대장', '용기 백배', '꽃향기 나는', '초록 영웅'],
  },
  {
    name: '전설',
    stars: 4,
    weight: 4,
    modifiers: ['황금빛', '무지갯빛', '달빛 머금은', '숲의 수호자', '보석 같은'],
  },
  {
    name: '신화',
    stars: 5,
    weight: 1,
    modifiers: ['별을 품은', '무지개 왕관을 쓴', '천년 숲의 주인', '전설 속'],
  },
];

/** 영웅 이상은 화면 가운데에서 크게 보여 줘요. */
export const BIG_REVEAL_FROM = 2;

export interface Card {
  /** 카드 고유 번호 */
  id: string;
  /** 생물 id */
  c: string;
  /** 등급 (0 일반 ~ 4 신화) */
  g: number;
  /** 수식어 번호 */
  m: number;
  /** 받은 시각 */
  t: number;
}

function rollGrade(rand: Rand): number {
  const total = CARD_GRADES.reduce((a, g) => a + g.weight, 0);
  let r = rand() * total;
  for (let i = 0; i < CARD_GRADES.length; i++) {
    r -= CARD_GRADES[i].weight;
    if (r < 0) return i;
  }
  return 0;
}

let cardSeq = 0;

/**
 * 카드 한 장 뽑기
 * - 미니게임 “완벽해요!” → 두 번 뽑아 더 좋은 등급 (행운 보너스)
 * - 반짝 생물 → 영웅 이상 보장
 */
export function drawCard(creatureId: string, opts: { grade: Grade; shiny: boolean }, rand: Rand = Math.random): Card {
  let g = rollGrade(rand);
  if (opts.grade === 'perfect') g = Math.max(g, rollGrade(rand));
  if (opts.shiny) g = Math.max(g, 2);
  const m = Math.floor(rand() * CARD_GRADES[g].modifiers.length);
  cardSeq += 1;
  const t = Date.now();
  return { id: `${t.toString(36)}${cardSeq}${Math.floor(rand() * 1e4)}`, c: creatureId, g, m, t };
}

export function cardTitle(card: Card, creatureName: string): string {
  const mods = CARD_GRADES[card.g]?.modifiers ?? [];
  const mod = mods[card.m] ?? mods[0] ?? '';
  return `${mod} ${creatureName}`;
}

export function isValidCard(v: unknown): v is Card {
  if (!v || typeof v !== 'object') return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.c === 'string' &&
    typeof c.g === 'number' &&
    Number.isInteger(c.g) &&
    c.g >= 0 &&
    c.g < CARD_GRADES.length &&
    typeof c.m === 'number' &&
    Number.isInteger(c.m) &&
    c.m >= 0 &&
    c.m < CARD_GRADES[c.g as number].modifiers.length &&
    typeof c.t === 'number'
  );
}
