import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  CREATURES,
  HABITATS,
  TOTAL,
  countDiscovered,
  getCreature,
  getHabitat,
  type Creature,
  type HabitatId,
} from '../data/creatures.ts';
import { BADGES, missionHabitat, rankOf, streakDays } from '../game/progress.ts';
import { CARD_GRADES } from '../game/cards.ts';
import type { SaveData } from '../game/storage.ts';
import { sfx } from '../game/sound.ts';
import { CreatureArt } from '../art/CreatureArt.tsx';
import { BookIcon, HabitatIcon, Logo, Mascot } from '../art/SceneArt.tsx';
import { MapArt } from '../art/MapArt.tsx';
import { MissionList } from './ProgressBits.tsx';
import heroUrl from '../assets/hero.jpg';

interface Props {
  save: SaveData;
  storageOk: boolean;
  /** 마지막으로 탐험한 장소 (위쪽 메뉴 ‘탐험하기’) */
  lastHabitat: HabitatId;
  onGo: (h: HabitatId) => void;
  onOpenDex: () => void;
  onOpenCards: () => void;
  onOpenQuiz: () => void;
  onToggleSound: () => void;
}

/** 지도 위 장소 핀 자리 (%) — MapArt 그림과 맞춰 두었어요 */
const MAP_PINS: Record<HabitatId, { x: number; y: number }> = {
  grass: { x: 20, y: 30 },
  flower: { x: 24, y: 76 },
  tree: { x: 80, y: 24 },
  pond: { x: 70, y: 70 },
};

const PLACE_TEXT: Record<HabitatId, string> = {
  flower: '나비와 꿀벌이 날아다녀요',
  grass: '폴짝폴짝 풀벌레를 찾아요',
  tree: '나무줄기와 나무 밑을 살펴봐요',
  pond: '물속과 물가를 들여다봐요',
};

const fmtDate = (t: number) => {
  const d = new Date(t);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

export function HomeScreen({ save, storageOk, lastHabitat, onGo, onOpenDex, onOpenCards, onOpenQuiz, onToggleSound }: Props) {
  const counts = save.counts;
  const found = countDiscovered(counts);
  const friends = CREATURES.filter((c) => (counts[c.id] ?? 0) > 0);
  const { rank, next } = rankOf(save.stars);
  const rankPct = next ? Math.min(100, ((save.stars - rank.min) / (next.min - rank.min)) * 100) : 100;
  const streak = streakDays(save.playDays);
  const missionsDone = save.missions.filter((m) => m.done).length;
  const [suggestTab, setSuggestTab] = useState<'unknown' | 'mission'>('unknown');

  // 키보드: 숫자 1~4로 장소 고르기
  const goRef = useRef(onGo);
  goRef.current = onGo;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
      if (document.querySelector('.overlay')) return;
      const n = Number(e.key);
      if (n >= 1 && n <= HABITATS.length) {
        e.preventDefault();
        goRef.current(HABITATS[n - 1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const greeting =
    found === 0
      ? '안녕! 나는 길잡이 탐탐이야. 오늘은 어떤 생물을 만나러 갈까?'
      : found === TOTAL
        ? '우와, 모두 찾았구나! 반짝이는 생물과 멋진 카드도 모아 볼까?'
        : `생물 친구를 ${found}가지 찾았어! 오늘은 어디로 탐험을 떠나 볼까?`;

  // 최근 발견한 생물: 카드를 받은 시간 기준, 생물마다 가장 최근 1번
  const recent: Array<{ c: Creature; t: number }> = [];
  for (let i = save.cards.length - 1; i >= 0 && recent.length < 4; i--) {
    const card = save.cards[i];
    if (recent.some((r) => r.c.id === card.c)) continue;
    const c = getCreature(card.c);
    if (c) recent.push({ c, t: card.t });
  }
  if (recent.length === 0) friends.slice(-4).reverse().forEach((c) => recent.push({ c, t: 0 }));

  // 이런 생물을 찾아보세요: 아직 못 찾은 생물 / 미션에 나온 생물
  const unknown = CREATURES.filter((c) => !((counts[c.id] ?? 0) > 0));
  const missionCreatures = save.missions
    .filter((m) => !m.done && m.kind === 'creature')
    .map((m) => getCreature(m.target))
    .filter((c): c is Creature => !!c);
  const suggest = suggestTab === 'unknown' ? unknown.slice(0, 8) : missionCreatures;

  const scrollToMissions = () => document.getElementById('home-missions')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div className="screen home">
      {/* ── 위쪽 메뉴 ── */}
      <header className="home-nav">
        <div className="brand">
          <Logo />
          <h1 className="brand-name">초록 생물 도감</h1>
        </div>
        <nav className="home-tabs" aria-label="메뉴">
          <button type="button" className="home-tab is-active" aria-current="page">
            <span aria-hidden="true">🏠</span> 홈
          </button>
          <button type="button" className="home-tab" onClick={() => onGo(lastHabitat)}>
            <span aria-hidden="true">🧭</span> 탐험하기
          </button>
          <button type="button" className="home-tab" onClick={onOpenDex}>
            <BookIcon /> 내 도감
          </button>
          <button type="button" className="home-tab cards-btn" onClick={onOpenCards} aria-label={`카드첩, 카드 ${save.cards.length}장`}>
            <span aria-hidden="true">🃏</span> <span className="cards-btn-label">카드첩</span>
            <span className="cards-btn-count" aria-hidden="true">
              {save.cards.length}
            </span>
          </button>
          <button type="button" className="home-tab" onClick={onOpenQuiz}>
            <span aria-hidden="true">💡</span> 퀴즈
          </button>
        </nav>
        <div className="home-nav-right">
          <div className="nav-rank" aria-label={`${rank.name}, 별 ${save.stars}개`}>
            <span className="nav-rank-icon" aria-hidden="true">
              {rank.icon}
            </span>
            <span className="nav-rank-info">
              <b>{rank.name}</b>
              <span className="mini-bar" aria-hidden="true">
                <span style={{ width: `${rankPct}%` }} />
              </span>
            </span>
            <span className="nav-stars">⭐ {save.stars}</span>
          </div>
          <button
            type="button"
            className="btn btn-icon-only sound-btn"
            onClick={onToggleSound}
            aria-label={save.sound ? '소리 끄기' : '소리 켜기'}
            aria-pressed={save.sound}
          >
            <span aria-hidden="true">{save.sound ? '🔊' : '🔇'}</span>
          </button>
        </div>
      </header>

      {/* ── 대문 그림 (선생님이 만든 그림) ── */}
      <section className="home-hero-banner" aria-label="초록 생물 도감 — 찾고! 기록하고! 배우는!">
        <img className="hero-img" src={heroUrl} alt="쌍안경을 든 어린이 탐험대원과 숲, 하천, 나비, 잠자리, 새가 있는 자연 그림" />
      </section>

      <div className="home-body">
        {/* ── 바로가기 카드 ── */}
        <nav className="quick-row" aria-label="바로가기">
          <QuickCard icon="🔭" tone="green" title="생물 탐험하기" text="장소를 골라 숨은 생물을 찾아요!" onClick={() => onGo(lastHabitat)} />
          <QuickCard icon="📖" tone="red" title="내 도감" text={`발견한 생물 ${found}/${TOTAL}가지`} onClick={onOpenDex} />
          <QuickCard icon="🃏" tone="purple" title="카드첩" text={`모은 카드 ${save.cards.length}장`} onClick={onOpenCards} />
          <QuickCard icon="🚩" tone="orange" title="탐험 미션" text="미션을 해내고 별을 모아요!" onClick={scrollToMissions} />
          <QuickCard icon="💡" tone="yellow" title="생태 퀴즈" text="퀴즈로 생물 지식을 키워요!" onClick={onOpenQuiz} />
        </nav>

        <div className="home-grid">
          {/* ── 왼쪽: 인사 + 미션 ── */}
          <div className="home-col home-col--left">
            <section className="panel greet-panel">
              <div className="home-mascot">
                <Mascot mood="happy" />
              </div>
              <div>
                <h2 className="start-line">장소를 골라 숨은 생물을 찾아보세요!</h2>
                <p>{greeting}</p>
              </div>
            </section>
            <section className="panel" id="home-missions" aria-label="탐험 미션">
              <h2 className="panel-title">
                🌱 탐험 미션 <span>{save.missions.length}개 중 {missionsDone}개 완료</span>
              </h2>
              <MissionList missions={save.missions} />
              <p className="panel-tip">미션을 해내면 별을 받고, 새 미션이 생겨요!</p>
            </section>
            <section className="panel quiz-cta">
              <div>
                <h2>생태 퀴즈 도전!</h2>
                <p>도감 속 생물 이야기로 퀴즈를 풀고 별을 모아 보세요!</p>
                <button type="button" className="btn btn-quiz" onClick={onOpenQuiz}>
                  퀴즈 풀러 가기 ›
                </button>
              </div>
              <div className="quiz-cta-mascot" aria-hidden="true">
                <Mascot mood="wow" />
                <span className="quiz-cta-bulb">💡</span>
              </div>
            </section>
          </div>

          {/* ── 가운데: 지도 + 이런 생물을 찾아보세요 ── */}
          <div className="home-col home-col--center">
          <section className="panel map-panel" aria-label="오늘의 생태 탐험 지도">
            <h2 className="map-title">오늘의 생태 탐험</h2>
            <p className="map-sub">지도에서 장소를 골라 새로운 생물을 찾아보세요!</p>
            <div className="map-box">
              <MapArt />
              {HABITATS.map((h, i) => {
                const list = CREATURES.filter((c) => c.habitat === h.id);
                const got = list.filter((c) => (counts[c.id] ?? 0) > 0).length;
                const hasMission = save.missions.some((m) => !m.done && missionHabitat(m) === h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    className={`map-pin place--${h.id}${got === list.length ? ' is-done' : ''}`}
                    style={{ '--x': MAP_PINS[h.id].x, '--y': MAP_PINS[h.id].y } as CSSProperties}
                    onClick={() => onGo(h.id)}
                    aria-label={`${h.name} 탐험하기, ${list.length}가지 중 ${got}가지 발견${hasMission ? ', 미션 있음' : ''}`}
                  >
                    <span className="pin-head" aria-hidden="true">
                      <HabitatIcon id={h.id} />
                    </span>
                    <span className="pin-label" aria-hidden="true">
                      <kbd className="key-hint">{i + 1}</kbd>
                      <b>{h.name}</b>
                      <span className="place-count">
                        <b>{got}</b>/{list.length}
                      </span>
                      {hasMission && <span className="pin-mission">🎯</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            <ul className="place-legend">
              {HABITATS.map((h) => (
                <li key={h.id}>
                  <HabitatIcon id={h.id} /> <b>{h.name}</b> {PLACE_TEXT[h.id]}
                </li>
              ))}
            </ul>
          </section>
            <section className="panel suggest-panel" aria-label="이런 생물을 찾아보세요">
              <div className="suggest-head">
                <h2 className="panel-title">이런 생물을 찾아보세요!</h2>
                <div className="suggest-tabs" role="group" aria-label="추천 종류">
                  <button type="button" className={`sort-btn${suggestTab === 'unknown' ? ' is-active' : ''}`} aria-pressed={suggestTab === 'unknown'} onClick={() => setSuggestTab('unknown')}>
                    아직 못 찾은 생물
                  </button>
                  <button type="button" className={`sort-btn${suggestTab === 'mission' ? ' is-active' : ''}`} aria-pressed={suggestTab === 'mission'} onClick={() => setSuggestTab('mission')}>
                    미션 생물
                  </button>
                </div>
              </div>
              {suggest.length === 0 ? (
                <p className="panel-empty">
                  {suggestTab === 'unknown' ? '🎉 모든 생물을 찾았어요! 반짝이는 생물을 찾아볼까요?' : '지금은 “○○ 만나기” 미션이 없어요.'}
                </p>
              ) : (
                <ul className="suggest-row">
                  {suggest.map((c) => {
                    const known = (counts[c.id] ?? 0) > 0;
                    return (
                      <li key={c.id}>
                        <button type="button" className="suggest-card" onClick={() => onGo(c.habitat)} aria-label={`${known ? c.name : '아직 못 찾은 생물'} 찾으러 ${getHabitat(c.habitat).name}에 가기`}>
                          <span className="suggest-art">
                            <CreatureArt id={c.id} hidden={!known} />
                            {!known && <span className="question">?</span>}
                          </span>
                          <b>{known ? c.name : '???'}</b>
                          <span className="suggest-go">
                            <HabitatIcon id={c.habitat} /> {getHabitat(c.habitat).name}에서 찾기 ›
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* ── 오른쪽: 최근 발견 + 탐험 기록 ── */}
          <div className="home-col home-col--right">
            <section className="panel" aria-label="최근 발견한 생물">
              <h2 className="panel-title">
                🌿 최근 발견한 생물
                <button type="button" className="link-btn" onClick={onOpenDex}>
                  도감 보기 ›
                </button>
              </h2>
              {recent.length === 0 ? (
                <p className="panel-empty">아직 발견한 생물이 없어요. 지도에서 장소를 골라 보세요!</p>
              ) : (
                <ul className="recent-grid">
                  {recent.map(({ c, t }) => (
                    <li key={c.id} className="recent-item">
                      <span className="recent-art">
                        <CreatureArt id={c.id} />
                        <span className={`recent-tag tag-${c.group}`}>{c.group === 'insect' ? '곤충' : c.kindLabel.replace(/\(.*\)/, '')}</span>
                      </span>
                      <b>{c.name}</b>
                      <span className="recent-meta">
                        {t ? fmtDate(t) : getHabitat(c.habitat).name} · 발견 {counts[c.id]}번
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel" aria-label="나의 탐험 기록">
              <h2 className="panel-title">📒 나의 탐험 기록</h2>
              <div className="record-rank">
                <span aria-hidden="true">{rank.icon}</span>
                <b>{rank.name}</b>
                <span className="record-stars">⭐ {save.stars}{next ? ` / ${next.min}` : ''}</span>
              </div>
              <p className="record-label">
                도감 완성도 <b>{Math.round((found / TOTAL) * 100)}%</b>
              </p>
              <div className="bar" aria-hidden="true">
                <span style={{ width: `${(found / TOTAL) * 100}%` }} />
              </div>
              <ul className="record-stats">
                <li>
                  <span aria-hidden="true">🌿</span>발견한 생물<b>{found}가지</b>
                </li>
                <li>
                  <span aria-hidden="true">📅</span>연속 탐험<b>{streak}일</b>
                </li>
                <li>
                  <span aria-hidden="true">🏅</span>받은 배지<b>{save.badges.length}/{BADGES.length}</b>
                </li>
                <li>
                  <span aria-hidden="true">🃏</span>모은 카드<b>{save.cards.length}장</b>
                </li>
              </ul>
              {save.cards.some((c) => c.g >= 2) && (
                <p className="record-best">
                  가장 멋진 카드: <b>{CARD_GRADES[Math.max(...save.cards.map((c) => c.g))].name}</b> 등급
                </p>
              )}
            </section>
          </div>
        </div>

        {/* ── 정원 ── */}
        <section className="garden-wrap" aria-label="내가 찾은 생물 친구들">
          <h2 className="garden-title">
            🌼 내가 찾은 생물 친구들 <span>{friends.length}/{TOTAL}</span>
          </h2>
          <Garden friends={friends} save={save} />
        </section>

        <aside className="home-notes">
          <p>🔍 게임에서는 수집하고, 자연에서는 눈으로 관찰해요!</p>
          <p>
            {storageOk
              ? '💾 이 브라우저에 탐험 기록이 저장돼요. 같은 기기·같은 브라우저를 쓰면 기록도 함께 써요.'
              : '⚠️ 지금은 기록이 저장되지 않아요. 창을 닫으면 기록이 사라져요.'}
          </p>
          <p className="hint-keys">⌨️ 키보드: 숫자 1~4로 장소 고르기</p>
        </aside>
      </div>
    </div>
  );
}

function QuickCard({ icon, tone, title, text, onClick }: { icon: string; tone: string; title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" className={`quick-card tone-${tone}`} onClick={onClick}>
      <span className="quick-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="quick-text">
        <b>{title}</b>
        <small>{text}</small>
      </span>
      <span className="quick-arrow" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

// ── 정원: 찾은 생물들이 돌아다녀요 ──

/** 같은 생물은 늘 같은 자리에 오도록 하는 간단한 해시 (0~1) */
function seeded(id: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

/** 옆모습 그림의 원래 방향 (돌아다닐 때 가는 쪽을 보도록) */
const FACING: Record<string, 1 | -1> = {
  grasshopper: 1,
  cricket: 1,
  mantis: 1,
  'long-headed-grasshopper': 1,
  snail: 1,
  'stick-insect': 1,
  tadpole: -1,
  medaka: -1,
  slug: 1,
  sparrow: 1,
  magpie: 1,
};

/** 연못 안 자리 (헤엄치는 친구들이 겹치지 않게) */
const POND_SLOTS: Array<[number, number]> = [[75, 74], [89, 77], [78, 87], [91, 88], [84, 70]];

/** 무리 안에서 index 번째 친구의 자리: 많으면 두 줄로 고르게 나눠 서로 겹치지 않게 */
function slot(index: number, total: number, xMin: number, xMax: number, rowsY: [number, number]) {
  const rows = total > 5 ? 2 : 1;
  const perRow = Math.ceil(total / rows);
  const row = index % rows;
  const col = Math.floor(index / rows);
  const x = xMin + ((col + (row ? 0.75 : 0.25) + 0.25) / perRow) * (xMax - xMin);
  const y = rows === 1 ? (rowsY[0] + rowsY[1]) / 2 : rowsY[row];
  return { x, y };
}

function petStyle(c: Creature, index: number, total: number): CSSProperties {
  const r = (k: number) => seeded(c.id, k);
  let x: number;
  let y: number;
  let dx: number;
  let dy: number;
  if (c.motion === 'swim') {
    // 물고기·올챙이는 오른쪽 아래 작은 연못 안에서
    [x, y] = POND_SLOTS[index % POND_SLOTS.length];
    x += (r(1) - 0.5) * 2;
    dx = (r(3) > 0.5 ? 1 : -1) * (8 + r(4) * 8);
    dy = (r(5) - 0.5) * 6;
  } else if (c.motion === 'fly') {
    // 날개 달린 친구들은 하늘 쪽에 고르게
    ({ x, y } = slot(index, total, 4, 72, [17, 36]));
    x += (r(1) - 0.5) * 3;
    y += (r(2) - 0.5) * 6;
    dx = (r(3) > 0.5 ? 1 : -1) * (30 + r(4) * 35);
    dy = (r(5) - 0.5) * 30;
  } else {
    // 걷는 친구들은 땅 위에, 연못과 겹치지 않게
    ({ x, y } = slot(index, total, 3, 64, [62, 84]));
    x += (r(1) - 0.5) * 3;
    y += (r(2) - 0.5) * 4;
    dx = (r(3) > 0.5 ? 1 : -1) * (14 + r(4) * 22);
    dy = (r(5) - 0.5) * 8;
  }
  const face = FACING[c.id] ?? 0;
  const first = dx > 0 ? face : -face; // 처음 가는 방향을 보도록
  return {
    '--x': x.toFixed(1),
    '--y': y.toFixed(1),
    '--dx': `${dx.toFixed(0)}px`,
    '--dy': `${dy.toFixed(0)}px`,
    '--dur': `${(6 + r(6) * 6).toFixed(1)}s`,
    '--delay': `${(-r(7) * 6).toFixed(1)}s`,
    '--f1': face ? first : 1,
    '--f2': face ? -first : 1,
  } as CSSProperties;
}

function Garden({ friends, save }: { friends: Creature[]; save: SaveData }) {
  const [picked, setPicked] = useState<{ id: string; key: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pick = (id: string) => {
    sfx.tap();
    window.clearTimeout(timer.current);
    setPicked({ id, key: performance.now() });
    timer.current = window.setTimeout(() => setPicked(null), 2800);
  };

  const fliers = friends.filter((c) => c.motion === 'fly');
  const walkers = friends.filter((c) => c.motion !== 'fly' && c.motion !== 'swim');

  return (
    <div className="garden">
      <svg className="garden-bg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 46 C25 40 55 44 100 40 L100 100 L0 100 Z" fill="#a3d86a" />
        <path d="M0 60 C30 56 70 60 100 57 L100 100 L0 100 Z" fill="#94cf5c" />
        <ellipse cx="82" cy="80" rx="16" ry="13" fill="#8a7a55" opacity="0.45" />
        <ellipse cx="82" cy="80" rx="15" ry="12" fill="#5bb5e8" />
        <ellipse cx="81" cy="78" rx="10" ry="6.5" fill="#79c6ef" />
        {[[10, 52], [26, 49], [44, 52], [60, 48], [18, 94], [52, 95]].map(([fx, fy], i) => (
          <g key={i}>
            <ellipse cx={fx} cy={fy} rx="1.6" ry="1.2" fill={i % 2 ? '#ffb3c8' : '#fff4a8'} />
            <ellipse cx={fx} cy={fy} rx="0.6" ry="0.5" fill="#ffd35a" />
          </g>
        ))}
      </svg>
      <span className="garden-sun" aria-hidden="true" />

      {friends.length === 0 ? (
        <div className="garden-empty">
          <div className="garden-empty-mascot">
            <Mascot mood="idle" />
          </div>
          <p>아직 친구가 없어요. 탐험을 떠나 생물을 찾아보세요!</p>
        </div>
      ) : (
        friends.map((c) => {
          const group = c.motion === 'fly' ? fliers : c.motion === 'swim' ? friends.filter((f) => f.motion === 'swim') : walkers;
          const shiny = (save.shiny[c.id] ?? 0) > 0;
          const isPicked = picked?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={`pet pet--${c.motion}${shiny ? ' is-shiny' : ''}${isPicked ? ' is-picked' : ''}`}
              style={petStyle(c, group.indexOf(c), group.length)}
              onClick={() => pick(c.id)}
              aria-label={`${c.name}, 발견 ${save.counts[c.id]}번`}
            >
              <span className="pet-move">
                <span className="pet-body" key={isPicked ? picked?.key : 'idle'}>
                  <span className={`pet-art${FACING[c.id] ? ' has-face' : ''}`}>
                    <CreatureArt id={c.id} />
                  </span>
                </span>
                {isPicked && (
                  <span className="pet-bubble">
                    {shiny && '✨ '}
                    <b>{c.name}</b> · 발견 {save.counts[c.id]}번
                  </span>
                )}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}
