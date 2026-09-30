import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  CREATURES,
  HABITATS,
  TOTAL,
  countDiscovered,
  type Creature,
  type HabitatId,
} from '../data/creatures.ts';
import { missionHabitat } from '../game/progress.ts';
import type { SaveData } from '../game/storage.ts';
import { sfx } from '../game/sound.ts';
import { CreatureArt } from '../art/CreatureArt.tsx';
import { BookIcon, HabitatIcon, Logo, Mascot } from '../art/SceneArt.tsx';
import { MissionList, RankCard } from './ProgressBits.tsx';

interface Props {
  save: SaveData;
  storageOk: boolean;
  onGo: (h: HabitatId) => void;
  onOpenDex: () => void;
  onToggleSound: () => void;
}

const PLACE_TEXT: Record<HabitatId, string> = {
  flower: '나비와 꿀벌이 날아다녀요',
  grass: '폴짝폴짝 풀벌레를 찾아요',
  tree: '나무줄기와 나무 밑을 살펴봐요',
  pond: '물속과 물가를 들여다봐요',
};

export function HomeScreen({ save, storageOk, onGo, onOpenDex, onToggleSound }: Props) {
  const counts = save.counts;
  const found = countDiscovered(counts);
  const friends = CREATURES.filter((c) => (counts[c.id] ?? 0) > 0);

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
      ? '안녕! 나는 길잡이 탐탐이야. 먼저 꽃밭에 가 볼까?'
      : found === TOTAL
        ? '우와, 모두 찾았구나! 반짝이는 생물도 찾아볼까?'
        : `생물 친구를 ${found}가지 찾았어! 오늘은 어디로 가 볼까?`;

  return (
    <div className="screen home">
      <header className="topbar">
        <div className="brand">
          <Logo />
          <h1 className="brand-name">초록 생물 도감</h1>
        </div>
        <div className="topbar-right">
          <div className="progress-chip" aria-label={`발견한 생물 ${found}/${TOTAL}`}>
            <span className="progress-label">발견한 생물</span>
            <strong>
              {found}/{TOTAL}
            </strong>
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
          <button type="button" className="btn btn-primary" onClick={onOpenDex}>
            <BookIcon />
            도감
          </button>
        </div>
      </header>

      <div className="home-body">
        <section className="home-hero">
          <div className="home-mascot">
            <Mascot mood="happy" />
          </div>
          <div className="home-bubble">
            <h2 className="start-line">장소를 골라 숨은 생물을 찾아보세요!</h2>
            <p>{greeting}</p>
          </div>
        </section>

        <section className="home-progress" aria-label="나의 등급과 오늘의 미션">
          <RankCard stars={save.stars} />
          <MissionList missions={save.missions} />
        </section>

        <div className="home-main">
          <nav className="place-grid" aria-label="탐험 장소 고르기">
            {HABITATS.map((h, i) => (
              <PlaceCard
                key={h.id}
                id={h.id}
                name={h.name}
                keyNum={i + 1}
                counts={counts}
                hasMission={save.missions.some((m) => !m.done && missionHabitat(m) === h.id)}
                onGo={() => onGo(h.id)}
              />
            ))}
          </nav>

          <section className="garden-wrap" aria-label="내가 찾은 생물 친구들">
            <h2 className="garden-title">
              🌼 내가 찾은 생물 친구들 <span>{friends.length}/{TOTAL}</span>
            </h2>
            <Garden friends={friends} save={save} />
          </section>
        </div>

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

function PlaceCard({
  id,
  name,
  keyNum,
  counts,
  hasMission,
  onGo,
}: {
  id: HabitatId;
  name: string;
  keyNum: number;
  counts: Record<string, number>;
  hasMission: boolean;
  onGo: () => void;
}) {
  const list = CREATURES.filter((c) => c.habitat === id);
  const got = list.filter((c) => (counts[c.id] ?? 0) > 0).length;
  const done = got === list.length;
  return (
    <button type="button" className={`place-card place--${id}`} onClick={onGo} aria-label={`${name} 탐험하기, ${list.length}가지 중 ${got}가지 발견`}>
      <span className="place-top">
        <span className="place-icon" aria-hidden="true">
          <HabitatIcon id={id} />
        </span>
        <span className="place-name">
          <kbd className="key-hint" aria-hidden="true">
            {keyNum}
          </kbd>
          {name}
        </span>
        {done ? (
          <span className="place-badge is-done">다 찾았어요!</span>
        ) : hasMission ? (
          <span className="place-badge">🎯 미션</span>
        ) : null}
      </span>
      <span className="place-text">{PLACE_TEXT[id]}</span>
      <span className="place-critters" aria-hidden="true">
        {list.map((c) => {
          const has = (counts[c.id] ?? 0) > 0;
          return (
            <span key={c.id} className={`place-critter${has ? '' : ' is-unknown'}`}>
              <CreatureArt id={c.id} hidden={!has} />
            </span>
          );
        })}
      </span>
      <span className="place-foot">
        <span className="place-count">
          발견 <b>{got}</b>/{list.length}
        </span>
        <span className="place-go">탐험하기 ▶</span>
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
};

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
    x = 76 + (index % 2) * 10 + r(1) * 3;
    y = 74 + (index % 2) * 8;
    dx = (r(3) > 0.5 ? 1 : -1) * (14 + r(4) * 12);
    dy = (r(5) - 0.5) * 10;
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
