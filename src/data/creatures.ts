// 생물·장소 데이터는 이 파일 한곳에서 관리합니다.
// 생물을 고치거나 추가할 때는 CREATURES 배열만 수정하면 됩니다.
// (그림은 src/art/CreatureArt.tsx 에서 같은 id 로 연결됩니다.)

export type HabitatId = 'flower' | 'grass' | 'tree' | 'pond';

export type SpotKind =
  | 'flower'
  | 'leaf'
  | 'grass'
  | 'stone'
  | 'wetLeaf'
  | 'soil'
  | 'trunk'
  | 'branch'
  | 'ground'
  | 'fallenLeaves'
  | 'reed'
  | 'shoreLeaf'
  | 'water';

export type Group = 'insect' | 'other';
/** net: 잠자리채(곤충), scoop: 뜰채(물속 생물), loupe: 돋보기(그 밖의 생물) */
export type Tool = 'net' | 'scoop' | 'loupe';
/** 자연으로 돌아갈 때의 움직임 */
export type Motion = 'fly' | 'hop' | 'crawl' | 'swim';
/**
 * 잡기 미니게임 종류
 * ring: 링 맞추기 · gauge: 점프 타이밍 게이지 · chase: 날쌘 곤충 잡기
 * sneak: 살금살금 다가가기 · hide: 숨바꼭질 · swim: 물속 그림자
 */
export type ChallengeKind = 'ring' | 'gauge' | 'chase' | 'sneak' | 'hide' | 'swim';

export interface Creature {
  id: string;
  name: string;
  group: Group;
  /** 도감에 작게 보이는 분류 이름 */
  kindLabel: string;
  habitat: HabitatId;
  /** 이 생물이 나올 수 있는 탐색 요소 */
  spots: SpotKind[];
  /** 게임 속 등장 장소(도감 표시용) */
  placeText: string;
  /** 쉬운 특징 한 문장 */
  fact: string;
  tool: Tool;
  motion: Motion;
  /** 잡을 때 하는 미니게임 */
  challenge: ChallengeKind;
  /** 안전 안내 (예: 꿀벌) */
  caution?: string;
  /** 덧붙이는 설명 (예: 올챙이) */
  note?: string;
}

export interface SpotDef {
  kind: SpotKind;
  /** 화면 속 후보 위치 [가로 %, 세로 %] — 탐험할 때마다 이 중에서 골라 배치합니다. */
  positions: Array<[number, number]>;
}

export interface Habitat {
  id: HabitatId;
  name: string;
  guide: string;
  spots: SpotDef[];
}

export const SPOT_NAMES: Record<SpotKind, string> = {
  flower: '꽃',
  leaf: '잎',
  grass: '풀',
  stone: '돌',
  wetLeaf: '축축한 잎',
  soil: '흙',
  trunk: '나무줄기',
  branch: '나뭇가지',
  ground: '나무 밑 땅',
  fallenLeaves: '낙엽',
  reed: '물가 풀',
  shoreLeaf: '물가 잎',
  water: '물속',
};

export const HABITATS: Habitat[] = [
  {
    id: 'flower',
    name: '꽃밭',
    guide: '흔들리는 꽃과 잎을 눌러 보세요!',
    spots: [
      { kind: 'flower', positions: [[16, 56], [40, 50], [64, 54], [86, 50]] },
      { kind: 'flower', positions: [[28, 80], [54, 78], [80, 82]] },
      { kind: 'flower', positions: [[12, 84], [46, 64], [88, 70]] },
      { kind: 'leaf', positions: [[30, 66], [68, 68], [62, 90], [14, 70]] },
    ],
  },
  {
    id: 'grass',
    name: '풀숲',
    guide: '움직이는 풀숲과 돌을 눌러 보세요!',
    spots: [
      { kind: 'grass', positions: [[14, 54], [40, 50], [66, 54], [88, 52]] },
      { kind: 'grass', positions: [[30, 72], [56, 70], [82, 74]] },
      { kind: 'grass', positions: [[12, 82], [46, 88], [72, 88]] },
      { kind: 'stone', positions: [[88, 88], [22, 90], [60, 60]] },
      { kind: 'wetLeaf', positions: [[42, 76], [86, 66], [14, 68]] },
      { kind: 'soil', positions: [[62, 86], [30, 88], [50, 62]] },
    ],
  },
  {
    id: 'tree',
    name: '나무',
    guide: '나무줄기, 가지, 나무 밑을 눌러 보세요!',
    spots: [
      { kind: 'trunk', positions: [[50, 46], [50, 64], [50, 80]] },
      { kind: 'trunk', positions: [[50, 64], [50, 46], [50, 80]] },
      { kind: 'branch', positions: [[28, 34], [72, 32], [24, 40], [76, 40]] },
      { kind: 'ground', positions: [[34, 90], [66, 90]] },
      { kind: 'fallenLeaves', positions: [[16, 84], [84, 82], [20, 70]] },
      { kind: 'stone', positions: [[84, 66], [14, 92], [86, 92]] },
    ],
  },
  {
    id: 'pond',
    name: '연못',
    guide: '연못 물속과 물가를 눌러 보세요!',
    spots: [
      { kind: 'water', positions: [[34, 72], [58, 84], [66, 64], [42, 90]] },
      { kind: 'water', positions: [[58, 84], [34, 72], [76, 80], [50, 66]] },
      { kind: 'reed', positions: [[9, 58], [91, 56], [9, 84], [91, 82]] },
      { kind: 'reed', positions: [[91, 82], [9, 84], [91, 56], [9, 58]] },
      { kind: 'shoreLeaf', positions: [[26, 44], [74, 44], [50, 42]] },
    ],
  },
];

export const CREATURES: Creature[] = [
  // ── 곤충 14가지 ──
  {
    id: 'ant', name: '개미', group: 'insect', kindLabel: '곤충',
    habitat: 'tree', spots: ['ground'], placeText: '나무 밑의 땅',
    fact: '여럿이 모여 함께 살고, 힘을 모아 먹이를 옮겨요.',
    tool: 'net', motion: 'crawl', challenge: 'hide',
  },
  {
    id: 'ladybug', name: '무당벌레', group: 'insect', kindLabel: '곤충',
    habitat: 'flower', spots: ['leaf'], placeText: '꽃밭의 잎',
    fact: '동그란 등에 점무늬가 있고, 진딧물을 먹는 무당벌레가 많아요.',
    tool: 'net', motion: 'fly', challenge: 'ring',
  },
  {
    id: 'cabbage-white', name: '배추흰나비', group: 'insect', kindLabel: '곤충',
    habitat: 'flower', spots: ['flower'], placeText: '꽃밭',
    fact: '하얀 날개에 검은 점이 있고, 애벌레는 배추 같은 채소 잎을 먹어요.',
    tool: 'net', motion: 'fly', challenge: 'chase',
  },
  {
    id: 'honeybee', name: '꿀벌', group: 'insect', kindLabel: '곤충',
    habitat: 'flower', spots: ['flower'], placeText: '꽃밭',
    fact: '꽃에서 꿀과 꽃가루를 모아 벌집으로 가져가요.',
    tool: 'net', motion: 'fly', challenge: 'chase',
    caution: '손으로 잡지 말고 멀리서 관찰해요.',
  },
  {
    id: 'grasshopper', name: '메뚜기', group: 'insect', kindLabel: '곤충',
    habitat: 'grass', spots: ['grass'], placeText: '풀숲',
    fact: '튼튼하고 긴 뒷다리로 폴짝 멀리 뛰어요.',
    tool: 'net', motion: 'hop', challenge: 'gauge',
  },
  {
    id: 'cricket', name: '귀뚜라미', group: 'insect', kindLabel: '곤충',
    habitat: 'grass', spots: ['stone'], placeText: '풀숲의 돌 주변',
    fact: '가을밤에 수컷이 날개를 비벼 “귀뚤귀뚤” 소리를 내요.',
    tool: 'net', motion: 'hop', challenge: 'gauge',
  },
  {
    id: 'cicada', name: '매미', group: 'insect', kindLabel: '곤충',
    habitat: 'tree', spots: ['trunk'], placeText: '나무줄기',
    fact: '여름에 수컷이 큰 소리로 울어요. 애벌레는 땅속에서 오래 지내요.',
    tool: 'net', motion: 'fly', challenge: 'ring',
  },
  {
    id: 'dragonfly', name: '잠자리', group: 'insect', kindLabel: '곤충',
    habitat: 'pond', spots: ['reed'], placeText: '연못 주변',
    fact: '큰 눈과 얇은 날개 네 장으로 빠르게 날아요. 애벌레는 물속에서 살아요.',
    tool: 'net', motion: 'fly', challenge: 'chase',
  },
  {
    id: 'rhino-beetle', name: '장수풍뎅이', group: 'insect', kindLabel: '곤충',
    habitat: 'tree', spots: ['trunk'], placeText: '나무',
    fact: '수컷 머리에 끝이 갈라진 긴 뿔이 있고, 나무 수액을 먹어요.',
    tool: 'net', motion: 'fly', challenge: 'ring',
  },
  {
    id: 'stag-beetle', name: '사슴벌레', group: 'insect', kindLabel: '곤충',
    habitat: 'tree', spots: ['trunk'], placeText: '나무',
    fact: '수컷은 사슴뿔처럼 생긴 커다란 턱을 가지고 있어요.',
    tool: 'net', motion: 'crawl', challenge: 'ring',
  },
  {
    id: 'mantis', name: '사마귀', group: 'insect', kindLabel: '곤충',
    habitat: 'grass', spots: ['grass'], placeText: '풀숲',
    fact: '낫처럼 생긴 앞다리로 다른 곤충을 잡아먹어요.',
    tool: 'net', motion: 'crawl', challenge: 'sneak',
  },
  {
    id: 'stick-insect', name: '대벌레', group: 'insect', kindLabel: '곤충',
    habitat: 'tree', spots: ['branch'], placeText: '나뭇가지',
    fact: '몸이 나뭇가지처럼 가늘고 길어서 잘 숨어요.',
    tool: 'net', motion: 'crawl', challenge: 'sneak',
  },
  {
    id: 'swallowtail', name: '호랑나비', group: 'insect', kindLabel: '곤충',
    habitat: 'flower', spots: ['flower'], placeText: '꽃밭',
    fact: '노란 날개에 검은 줄무늬가 있는 큰 나비예요.',
    tool: 'net', motion: 'fly', challenge: 'chase',
  },
  {
    id: 'long-headed-grasshopper', name: '방아깨비', group: 'insect', kindLabel: '곤충',
    habitat: 'grass', spots: ['grass'], placeText: '풀숲',
    fact: '머리가 뾰족하고 몸이 길쭉하며, 뒷다리가 아주 길어요.',
    tool: 'net', motion: 'hop', challenge: 'gauge',
  },

  // ── 다른 동물 6가지 ──
  {
    id: 'snail', name: '달팽이', group: 'other', kindLabel: '연체동물',
    habitat: 'grass', spots: ['wetLeaf', 'stone'], placeText: '풀숲의 축축한 잎과 돌 주변',
    fact: '축축한 곳을 좋아하고, 긴 더듬이 끝에 눈이 있어요.',
    tool: 'loupe', motion: 'crawl', challenge: 'hide',
  },
  {
    id: 'pill-bug', name: '공벌레', group: 'other', kindLabel: '갑각류',
    habitat: 'tree', spots: ['fallenLeaves', 'stone'], placeText: '나무 밑의 낙엽과 돌 아래',
    fact: '건드리면 몸을 공처럼 말아요. 곤충이 아니라 새우, 게와 가까운 동물이에요.',
    tool: 'loupe', motion: 'crawl', challenge: 'hide',
  },
  {
    id: 'earthworm', name: '지렁이', group: 'other', kindLabel: '환형동물',
    habitat: 'grass', spots: ['soil'], placeText: '풀숲의 흙',
    fact: '흙 속을 다니며 땅을 부드럽고 기름지게 만들어요.',
    tool: 'loupe', motion: 'crawl', challenge: 'hide',
  },
  {
    id: 'tree-frog', name: '청개구리', group: 'other', kindLabel: '양서류',
    habitat: 'pond', spots: ['reed', 'shoreLeaf'], placeText: '연못 주변의 풀과 잎',
    fact: '발가락 끝이 둥글넓적해서 나뭇잎에 잘 붙어요.',
    tool: 'loupe', motion: 'hop', challenge: 'sneak',
  },
  {
    id: 'tadpole', name: '올챙이', group: 'other', kindLabel: '양서류(개구리의 어린 시기)',
    habitat: 'pond', spots: ['water'], placeText: '연못 속',
    fact: '개구리가 어릴 때의 모습이에요. 꼬리로 헤엄치고, 자라면서 다리가 생겨요.',
    tool: 'scoop', motion: 'swim', challenge: 'swim',
    note: '‘올챙이’는 한 종류의 생물 이름이 아니라, 개구리가 어릴 때를 부르는 말이에요.',
  },
  {
    id: 'medaka', name: '송사리', group: 'other', kindLabel: '물고기',
    habitat: 'pond', spots: ['water'], placeText: '연못 속',
    fact: '몸이 작은 물고기로, 여럿이 무리 지어 물 위쪽에서 헤엄쳐요.',
    tool: 'scoop', motion: 'swim', challenge: 'swim',
  },
];

/** 수집할 생물 전체 수 — 데이터에서 자동으로 계산합니다. */
export const TOTAL = CREATURES.length;

export const GROUP_NAMES: Record<Group, string> = {
  insect: '곤충',
  other: '다른 동물',
};

export function getHabitat(id: HabitatId): Habitat {
  const h = HABITATS.find((x) => x.id === id);
  if (!h) throw new Error(`unknown habitat ${id}`);
  return h;
}

export function getCreature(id: string): Creature | undefined {
  return CREATURES.find((c) => c.id === id);
}

export function countDiscovered(counts: Record<string, number>): number {
  return CREATURES.filter((c) => (counts[c.id] ?? 0) > 0).length;
}
