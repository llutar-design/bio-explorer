// 생물 데이터 점검: node scripts/check-data.ts
// 1) 20가지가 모두 등장할 수 있는 장소·탐색 요소가 있는지
// 2) 분류가 맞는지  3) 무작위로 놀았을 때 모두 모으는 데 몇 번 누르는지
import { CREATURES, HABITATS, TOTAL, getHabitat } from '../src/data/creatures.ts';
import { makeLayout, pickCreature } from '../src/game/logic.ts';
import {
  BADGES,
  MISSION_SLOTS,
  RANKS,
  SHINY_CHANCE,
  applyFind,
  missionHabitat,
  missionText,
  rankOf,
  refreshMissions,
  type GameState,
} from '../src/game/progress.ts';
import {
  CHALLENGE_INFO,
  chaseState,
  gaugePos,
  gaugeZone,
  hideState,
  ringScale,
  ringZone,
  sneakState,
  swimState,
  type Grade,
} from '../src/game/challenges.ts';
import { CARD_GRADES, drawCard, isValidCard } from '../src/game/cards.ts';
import { QUIZ_LENGTH, makeQuiz } from '../src/game/quiz.ts';

let ok = true;
const fail = (msg: string) => {
  ok = false;
  console.log('  ✗ ' + msg);
};

console.log(`수집할 생물: ${TOTAL}가지`);
if (new Set(CREATURES.map((c) => c.id)).size !== TOTAL) fail('id 중복');

// 곤충이 아닌 동물 (거미는 다리 8개 거미류, 새는 조류)
const others = ['달팽이', '공벌레', '지렁이', '청개구리', '올챙이', '송사리', '거미', '민달팽이', '참새', '까치'];
const birds = ['참새', '까치'];
const water = ['올챙이', '송사리', '소금쟁이', '물방개'];
// 같은 화면에 그림 없는 생물이 없는지 (그림 파일과 데이터 연결)
const artSrc = (await import('node:fs')).readFileSync(new URL('../src/art/CreatureArt.tsx', import.meta.url), 'utf8');
for (const c of CREATURES) {
  if (others.includes(c.name) && c.group !== 'other') fail(`${c.name}은(는) 곤충이 아님`);
  if (!others.includes(c.name) && c.group !== 'insect') fail(`${c.name}은(는) 곤충이어야 함`);
  const h = HABITATS.find((x) => x.id === c.habitat);
  if (!h) { fail(`${c.name}: 장소 없음`); continue; }
  const kinds = new Set(h.spots.map((s) => s.kind));
  const reachable = c.spots.filter((k) => kinds.has(k));
  if (reachable.length === 0) fail(`${c.name}: ${h.name}에 맞는 탐색 요소 없음`);
  // 매번 배치할 때 그 탐색 요소가 반드시 나오는지
  for (let i = 0; i < 200; i++) {
    const layout = makeLayout(c.habitat);
    if (!layout.some((s) => c.spots.includes(s.kind))) { fail(`${c.name}: 배치에서 빠짐`); break; }
  }
  const tool = water.includes(c.name) ? 'scoop' : birds.includes(c.name) ? 'binoculars' : c.group === 'insect' ? 'net' : 'loupe';
  if (c.tool !== tool) fail(`${c.name}: 도구가 ${tool} 이어야 함`);
  if (!new RegExp(`['\\s]${c.id.includes('-') ? `'${c.id}'` : c.id}:`).test(artSrc)) fail(`${c.name}: 그림이 연결되지 않음`);
}
console.log(`곤충 ${CREATURES.filter((c) => c.group === 'insect').length}가지, 다른 동물 ${CREATURES.filter((c) => c.group === 'other').length}가지`);
for (const h of HABITATS) {
  console.log(`  ${h.name}: ${CREATURES.filter((c) => c.habitat === h.id).map((c) => c.name).join(', ')}`);
}

// 무작위 놀이 흉내: 장소를 고르고 탐색 요소를 무작위로 누름
const runs = 2000;
const taps: number[] = [];
for (let r = 0; r < runs; r++) {
  const counts: Record<string, number> = {};
  let n = 0;
  while (Object.keys(counts).length < TOTAL && n < 5000) {
    const h = HABITATS[Math.floor(Math.random() * HABITATS.length)];
    const layout = makeLayout(h.id);
    const spot = layout[Math.floor(Math.random() * layout.length)];
    const c = pickCreature(h.id, spot.kind, counts);
    n++;
    if (c) counts[c.id] = (counts[c.id] ?? 0) + 1;
  }
  taps.push(n);
}
taps.sort((a, b) => a - b);
const avg = taps.reduce((a, b) => a + b, 0) / runs;
console.log(`무작위로 눌렀을 때 모두 모으기까지 발견 횟수: 평균 ${avg.toFixed(1)}번, 90%는 ${taps[Math.floor(runs * 0.9)]}번 이내, 가장 오래 ${taps[runs - 1]}번`);

// 재미 요소 점검: 별·등급·미션·배지가 모두 얻을 수 있는지 (무작위 놀이 흉내)
{
  const base: GameState = { counts: {}, shiny: {}, celebrated: false, stars: 0, totalFinds: 0, missionsDone: 0, perfects: 0, cards: [], quizCorrect: 0, playDays: [], missions: [], badges: [] };
  let s: GameState = { ...base, missions: refreshMissions(base) };
  let celebrations = 0;
  let findsToComplete = 0;
  for (let n = 1; n <= 600; n++) {
    // 아이처럼: 미션에 나온 장소를 가끔 따라가고, 아니면 아무 곳이나
    const m = s.missions.find((x) => !x.done);
    const h = m && Math.random() < 0.5 && missionHabitat(m) ? getHabitat(missionHabitat(m)!) : HABITATS[Math.floor(Math.random() * HABITATS.length)];
    const layout = makeLayout(h.id);
    const spot = layout[Math.floor(Math.random() * layout.length)];
    const c = pickCreature(h.id, spot.kind, s.counts)!;
    const g: Grade = (['perfect', 'good', 'good', 'ok'] as Grade[])[Math.floor(Math.random() * 4)];
    const r = applyFind(s, c, Math.random() < SHINY_CHANCE, g);
    s = r.next;
    if (r.events.completedNow) { celebrations++; findsToComplete = n; }
    if (n === 60 || n === 180 || n === 300) {
      console.log(`  ${n}번 발견 후: 별 ${s.stars}개 ${rankOf(s.stars).rank.name}, 미션 ${s.missionsDone}개, 배지 ${s.badges.length}개`);
    }
    const open = s.missions.filter((x) => !x.done).length;
    if (s.missions.length !== MISSION_SLOTS || open < MISSION_SLOTS - 3) fail('미션 수가 이상함');
    for (const x of s.missions) if (!missionText(x) || x.have > x.need) fail('미션 내용 이상: ' + JSON.stringify(x));
  }
  if (celebrations !== 1) fail(`모두 모은 축하가 ${celebrations}번 나옴`);
  const missing = BADGES.filter((b) => !s.badges.includes(b.id)).map((b) => b.name);
  console.log(`재미 요소(600번 발견 흉내): 도감 완성 ${findsToComplete}번째, 별 ${s.stars}개(${rankOf(s.stars).rank.name}), 미션 ${s.missionsDone}개, 배지 ${s.badges.length}/${BADGES.length}${missing.length ? ' (못 받은 배지: ' + missing.join(', ') + ')' : ''}`);
  console.log(`등급 기준: ${RANKS.map((r) => `${r.icon}${r.name} ${r.min}`).join(' → ')}`);
}

// 미니게임 점검: 모든 생물에 미니게임이 있고, 각 미니게임에 성공할 수 있는 순간이 충분히 있는지
{
  const kinds = new Set(CREATURES.map((c) => c.challenge));
  for (const c of CREATURES) if (!(c.challenge in CHALLENGE_INFO)) fail(`${c.name}: 미니게임 없음`);
  const share = (fn: (t: number) => boolean, span: number) => {
    let hit = 0;
    for (let t = 0; t < span; t += 10) if (fn(t)) hit++;
    return hit / (span / 10);
  };
  const report: string[] = [];
  for (const assist of [false, true]) {
    const r = {
      ring: share((t) => ringZone(ringScale(t, assist), assist) !== 'miss', 20000),
      gauge: share((t) => gaugeZone(gaugePos(t, assist), assist) !== 'miss', 20000),
      chase: share((t) => chaseState(t, assist).resting, 20000),
      sneak: share((t) => sneakState(t, assist) !== 'look', 20000),
      hide: share((t) => hideState(t, assist).stage === 'peek', 20000),
      swim: share((t) => swimState(t, assist).stage === 'up', 20000),
    };
    for (const [k, v] of Object.entries(r)) if (v < 0.15) fail(`${k}: 성공할 수 있는 시간이 너무 짧음 (${Math.round(v * 100)}%)`);
    if (assist) for (const k of Object.keys(r) as Array<keyof typeof r>) if (r[k] < 0.3 && k !== 'hide') fail(`${k}: 쉬운 모드가 충분히 쉽지 않음`);
    report.push(`${assist ? '쉬운 모드' : '보통'}: ` + Object.entries(r).map(([k, v]) => `${CHALLENGE_INFO[k as keyof typeof r].name} ${Math.round(v * 100)}%`).join(', '));
  }
  // 숨바꼭질: 세 곳 모두에서 나오는지
  const holes = new Set<number>();
  for (let t = 0; t < 30000; t += 50) holes.add(hideState(t, false).hole);
  if (holes.size !== 3) fail('숨바꼭질: 세 곳에서 모두 나오지 않음');
  console.log(`미니게임 ${kinds.size}종류 · 성공할 수 있는 시간 비율`);
  report.forEach((l) => console.log('  ' + l));
}

// 카드 점검: 등급별로 실제로 나오는 비율, 수식어, 반짝 보장
{
  const N = 100000;
  const pct = (opts: { grade: Grade; shiny: boolean }) => {
    const n = CARD_GRADES.map(() => 0);
    for (let i = 0; i < N; i++) n[drawCard('ant', opts).g]++;
    return n.map((v) => ((v / N) * 100).toFixed(1) + '%');
  };
  const normal = pct({ grade: 'good', shiny: false });
  const perfect = pct({ grade: 'perfect', shiny: false });
  const shiny = pct({ grade: 'ok', shiny: true });
  console.log('카드 등급별 확률 (' + CARD_GRADES.map((g) => g.name).join(' / ') + ')');
  console.log('  보통: ' + normal.join(' / '));
  console.log('  “완벽해요!”: ' + perfect.join(' / '));
  console.log('  반짝 생물: ' + shiny.join(' / '));
  if (parseFloat(shiny[0]) + parseFloat(shiny[1]) > 0) fail('반짝 생물인데 영웅 미만 카드가 나옴');
  for (const g of CARD_GRADES) if (g.modifiers.length === 0) fail(`${g.name}: 수식어 없음`);
  for (let i = 0; i < 2000; i++) {
    const c = drawCard('snail', { grade: 'ok', shiny: false });
    if (!isValidCard(c)) fail('잘못된 카드: ' + JSON.stringify(c));
  }
}

// 생태 퀴즈 점검
{
  const kinds = { fact: 0, insect: 0, place: 0 };
  for (let i = 0; i < 500; i++) {
    const counts: Record<string, number> = {};
    CREATURES.forEach((c) => { if (Math.random() < 0.5) counts[c.id] = 1; });
    const qs = makeQuiz(counts);
    if (qs.length !== QUIZ_LENGTH) fail('퀴즈 문제 수가 이상함');
    if (new Set(qs.map((q) => q.creature.id)).size !== qs.length) fail('한 판에 같은 생물이 두 번 나옴');
    for (const q of qs) {
      kinds[q.kind]++;
      if (!q.choices.some((c) => c.key === q.answer)) fail(`정답이 보기에 없음: ${q.prompt}`);
      if (new Set(q.choices.map((c) => c.key)).size !== q.choices.length) fail('보기가 겹침');
      if (q.kind === 'fact' && q.clue!.includes(q.creature.name)) fail(`설명에 정답 이름이 보임: ${q.creature.name}`);
      if (!q.explain || q.explain.includes('undefined')) fail('설명이 비었음');
    }
  }
  const sample = makeQuiz({});
  console.log(`생태 퀴즈: 문제 종류 ${JSON.stringify(kinds)} · 예) ${sample.map((q) => q.prompt).slice(0, 2).join(' / ')}`);
  console.log('  설명 예) ' + sample.map((q) => q.explain).slice(0, 2).join(' | '));
}

console.log(ok ? '✓ 데이터 점검 통과' : '✗ 데이터 점검 실패');
process.exit(ok ? 0 : 1);
