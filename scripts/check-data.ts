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

let ok = true;
const fail = (msg: string) => {
  ok = false;
  console.log('  ✗ ' + msg);
};

console.log(`수집할 생물: ${TOTAL}가지`);
if (new Set(CREATURES.map((c) => c.id)).size !== TOTAL) fail('id 중복');

const others = ['달팽이', '공벌레', '지렁이', '청개구리', '올챙이', '송사리'];
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
  const tool = c.group === 'insect' ? 'net' : c.name === '올챙이' || c.name === '송사리' ? 'scoop' : 'loupe';
  if (c.tool !== tool) fail(`${c.name}: 도구가 ${tool} 이어야 함`);
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
  const base: GameState = { counts: {}, shiny: {}, celebrated: false, stars: 0, totalFinds: 0, missionsDone: 0, missions: [], badges: [] };
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
    const r = applyFind(s, c, Math.random() < SHINY_CHANCE);
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

console.log(ok ? '✓ 데이터 점검 통과' : '✗ 데이터 점검 실패');
process.exit(ok ? 0 : 1);
