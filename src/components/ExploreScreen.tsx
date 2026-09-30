import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  CREATURES,
  HABITATS,
  SPOT_NAMES,
  TOTAL,
  countDiscovered,
  getHabitat,
  type Creature,
  type HabitatId,
} from '../data/creatures.ts';
import {
  creaturePosition,
  makeLayout,
  pickCreature,
  withIGa,
  type PlacedSpot,
} from '../game/logic.ts';
import { SHINY_CHANCE, missionText, type FindEvents } from '../game/progress.ts';
import type { SaveData } from '../game/storage.ts';
import { sfx } from '../game/sound.ts';
import { CreatureArt } from '../art/CreatureArt.tsx';
import { BookIcon, HabitatIcon, Logo, Mascot, SceneDecor, SpotArt, ToolArt } from '../art/SceneArt.tsx';
import { usePrefersReducedMotion } from '../hooks.ts';
import { CHALLENGE_INFO, GRADE_TEXT, isActionKey, type Grade } from '../game/challenges.ts';
import { Challenge } from './Challenge.tsx';
import { MissionList, RankCard } from './ProgressBits.tsx';

interface Props {
  habitat: HabitatId;
  onHabitat: (h: HabitatId) => void;
  save: SaveData;
  onRecord: (id: string, shiny: boolean, grade: Grade) => FindEvents;
  onToggleSound: () => void;
  onOpenDex: () => void;
  onCelebrate: () => void;
  onHome: () => void;
}

type Phase = 'idle' | 'appear' | 'catch' | 'caught' | 'release';

interface Encounter {
  key: number;
  spotKey: string;
  creature: Creature;
  shiny: boolean;
  x: number;
  y: number;
  grade?: Grade;
}

interface ResultToast {
  key: number;
  creature: Creature;
  events: FindEvents;
  /** 생물이 위쪽에 있으면 안내를 아래에 띄워 가리지 않게 */
  atBottom: boolean;
}

const CHEERS = ['멋져요!', '대단해요!', '최고의 탐험가!', '와, 찾았다!', '잘했어요!'];

export function ExploreScreen({ habitat, onHabitat, save, onRecord, onToggleSound, onOpenDex, onCelebrate, onHome }: Props) {
  const reduced = usePrefersReducedMotion();
  const [layout, setLayout] = useState<PlacedSpot[]>(() => makeLayout(habitat));
  const [phase, setPhase] = useState<Phase>('idle');
  const [enc, setEnc] = useState<Encounter | null>(null);
  const [toast, setToast] = useState<ResultToast | null>(null);
  const [cheer, setCheer] = useState(CHEERS[0]);

  // 빠르게 여러 번 눌러도 한 번만 처리되도록, 화면 갱신을 기다리지 않는 잠금 값
  const phaseRef = useRef<Phase>('idle');
  const encRef = useRef<Encounter | null>(null);
  const timers = useRef<number[]>([]);
  const toastTimer = useRef<number | undefined>(undefined);
  const seq = useRef(0);

  const counts = save.counts;

  const go = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  // 장소를 바꾸면 같은 순간에 새로 배치 (이전 장소의 탐색 요소가 잠깐 남지 않도록)
  const changeHabitat = (h: HabitatId) => {
    if (h === habitat) return;
    clearTimers();
    window.clearTimeout(toastTimer.current);
    encRef.current = null;
    setEnc(null);
    setToast(null);
    go('idle');
    setLayout(makeLayout(h));
    onHabitat(h);
  };

  useEffect(
    () => () => {
      clearTimers();
      window.clearTimeout(toastTimer.current);
    },
    [],
  );

  // 탐험 화면 키보드: 1~4 장소 바꾸기 · ← → 탐색할 곳 고르기 · 스페이스/엔터 살펴보기
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  keyRef.current = (e: KeyboardEvent) => {
    if (phaseRef.current !== 'idle' || e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
    if (document.querySelector('.overlay')) return; // 시작 안내·축하 창이 떠 있으면 무시
    const n = Number(e.key);
    if (n >= 1 && n <= HABITATS.length) {
      e.preventDefault();
      changeHabitat(HABITATS[n - 1].id);
      return;
    }
    const spots = Array.from(document.querySelectorAll<HTMLButtonElement>('.scene .spot:not([disabled])')).sort(
      (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left,
    );
    if (spots.length === 0) return;
    const at = spots.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const step = e.key === 'ArrowRight' ? 1 : -1;
      const next = at < 0 ? (step > 0 ? 0 : spots.length - 1) : (at + step + spots.length) % spots.length;
      spots[next].focus();
      return;
    }
    // 아무것도 고르지 않은 채 스페이스/엔터 → 첫 번째 탐색할 곳을 골라 줌
    if (isActionKey(e.key) && !(document.activeElement instanceof HTMLButtonElement)) {
      e.preventDefault();
      spots[0].focus();
    }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onSpot = (spot: PlacedSpot) => {
    if (phaseRef.current !== 'idle') return;
    const creature = pickCreature(habitat, spot.kind, counts);
    if (!creature) return;
    const shiny = Math.random() < SHINY_CHANCE;
    seq.current += 1;
    const next: Encounter = { key: seq.current, spotKey: spot.key, creature, shiny, ...creaturePosition(spot, creature) };
    encRef.current = next;
    setEnc(next);
    // 앞의 결과 안내가 미니게임을 가리지 않도록 바로 닫기
    window.clearTimeout(toastTimer.current);
    setToast(null);
    go('appear');
    sfx.search();
    if (shiny) sfx.appearShiny();
    else sfx.appear();
  };

  // 미니게임 성공 → 채집 연출
  const onCatch = (grade: Grade, x: number, y: number) => {
    const prev = encRef.current;
    if (phaseRef.current !== 'appear' || !prev) return;
    go('catch'); // 잠금: 이후 누르기는 무시
    const current: Encounter = { ...prev, x, y, grade };
    encRef.current = current;
    setEnc(current);
    sfx.catch();
    if (grade === 'perfect') sfx.perfect();
    const ev = onRecord(current.creature.id, current.shiny, grade); // 도감에 바로 기록
    const extras = ev.missionsCompleted.length + ev.newBadges.length + (ev.rankUp ? 1 : 0);
    const t = reduced ? { caught: 250, release: 1000, done: 1400 } : { caught: 700, release: 1700, done: 2600 };
    later(t.caught, () => {
      go('caught');
      setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
      window.clearTimeout(toastTimer.current);
      setToast({ key: current.key, creature: current.creature, events: ev, atBottom: current.y < 55 });
      toastTimer.current = window.setTimeout(() => setToast(null), (reduced ? 3200 : 4000) + extras * 1300);
      if (ev.isNew) sfx.newFind();
      else sfx.again();
    });
    if (ev.missionsCompleted.length || ev.newBadges.length) later(t.caught + 600, () => sfx.reward());
    if (ev.rankUp) later(t.caught + 1100, () => sfx.rankUp());
    later(t.release, () => go('release'));
    later(t.done, () => {
      encRef.current = null;
      setEnc(null);
      setLayout(makeLayout(habitat));
      go('idle');
      if (ev.completedNow) onCelebrate();
    });
  };

  const found = countDiscovered(counts);
  const here = CREATURES.filter((c) => c.habitat === habitat);
  const hereFound = here.filter((c) => (counts[c.id] ?? 0) > 0).length;

  let hint: string;
  let mood: 'idle' | 'wow' | 'happy' = 'idle';
  if (phase === 'appear' && enc) {
    mood = 'wow';
    const how = CHALLENGE_INFO[enc.creature.challenge].hint;
    hint = enc.shiny
      ? `우와! 반짝이는 ${withIGa(enc.creature.name)} 나타났어요! ${how}`
      : `${withIGa(enc.creature.name)} 나타났어요! ${how}`;
  } else if (phase !== 'idle') {
    mood = 'happy';
    hint = `${cheer} 도감에 기록하고 자연으로 돌려보내요.`;
  } else if (hereFound === here.length) {
    hint = '이곳 생물을 모두 찾았어요! 다른 장소도 가 볼까요?';
  } else {
    hint = getHabitat(habitat).guide;
  }

  return (
    <div className="screen explore">
      <header className="topbar">
        <div className="brand">
          <button type="button" className="btn btn-light home-btn" onClick={onHome} aria-label="홈으로 가기">
            <span aria-hidden="true">🏠</span>
            <span className="home-label">홈</span>
          </button>
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

      <nav className="habitat-tabs" aria-label="탐험 장소">
        {HABITATS.map((h) => {
          const list = CREATURES.filter((c) => c.habitat === h.id);
          const got = list.filter((c) => (counts[c.id] ?? 0) > 0).length;
          return (
            <button
              key={h.id}
              type="button"
              className={`habitat-tab${h.id === habitat ? ' is-active' : ''}`}
              aria-pressed={h.id === habitat}
              onClick={() => changeHabitat(h.id)}
            >
              <HabitatIcon id={h.id} />
              <kbd className="key-hint" aria-hidden="true">
                {HABITATS.indexOf(h) + 1}
              </kbd>
              <span className="habitat-name">{h.name}</span>
              <span className="habitat-count">
                {got}/{list.length}
              </span>
            </button>
          );
        })}
      </nav>

      <section className="mission-bar" aria-label="나의 등급과 탐험 미션">
        <RankCard stars={save.stars} />
        <MissionList missions={save.missions} />
      </section>

      <main className={`scene scene--${habitat}${phase === 'appear' ? ' is-playing' : ''}`} aria-label={`${getHabitat(habitat).name} 탐험`}>
        <SceneDecor habitat={habitat} />

        {layout.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`spot spot--${s.kind}${enc?.spotKey === s.key ? ' is-open' : ''}`}
            style={{ '--x': s.x, '--y': s.y, '--delay': `${s.delay}s` } as CSSProperties}
            onClick={() => onSpot(s)}
            disabled={phase !== 'idle'}
            aria-label={`${SPOT_NAMES[s.kind]} 살펴보기`}
          >
            <span className="spot-inner">
              <SpotArt kind={s.kind} variant={s.variant} />
            </span>
          </button>
        ))}

        {enc && phase === 'appear' && (
          <div key={`ch-${enc.key}`} className={`challenge-wrap${enc.shiny ? ' is-shiny' : ''}`}>
            <Challenge creature={enc.creature} x={enc.x} y={enc.y} reduced={reduced} onSuccess={onCatch} />
          </div>
        )}

        {enc && phase !== 'appear' && (
          <div
            key={`enc-${enc.key}`}
            className={`encounter is-${phase} motion-${enc.creature.motion}${enc.shiny ? ' is-shiny' : ''}`}
            style={{ '--x': enc.x, '--y': enc.y } as CSSProperties}
          >
            <span className="creature-btn">
              <span className="creature-body">
                <CreatureArt id={enc.creature.id} />
              </span>
            </span>
            <div className={`tool tool--${enc.creature.tool}`} aria-hidden="true">
              <ToolArt tool={enc.creature.tool} />
            </div>
            {enc.grade && enc.grade !== 'ok' && (
              <div className={`grade-pop grade-${enc.grade}`} aria-hidden="true">
                {GRADE_TEXT[enc.grade]}
              </div>
            )}
            {(phase === 'caught' || phase === 'release') && (
              <div className="sparkles" aria-hidden="true">
                {Array.from({ length: 8 }, (_, i) => (
                  <span key={i} style={{ '--i': i } as CSSProperties} />
                ))}
              </div>
            )}
          </div>
        )}

        {toast && <ResultCard key={`toast-${toast.key}`} toast={toast} />}
        {toast?.events.rankUp && (
          <div key={`party-${toast.key}`} className="confetti scene-confetti" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} style={{ '--i': i } as CSSProperties} />
            ))}
          </div>
        )}
      </main>

      <footer className="hint-bar">
        <div className={`mascot mood-${mood}`} key={`mascot-${mood}-${enc?.key ?? 0}`}>
          <Mascot mood={mood} />
        </div>
        <div className="bubble">
          <p className="hint" aria-live="polite">
            {hint}
          </p>
          <p className="hint-sub">게임에서는 수집하고, 자연에서는 눈으로 관찰해요!</p>
          <p className="hint-keys">⌨️ 키보드: 숫자 1~4 장소 · ← → 고르기 · 스페이스 살펴보기</p>
        </div>
      </footer>
    </div>
  );
}

function ResultCard({ toast }: { toast: ResultToast }) {
  const { creature, events: ev } = toast;
  return (
    <div
      className={`result-toast${ev.isNew ? ' is-new' : ''}${ev.shiny ? ' is-shiny' : ''}${toast.atBottom ? ' at-bottom' : ''}`}
      role="status"
    >
      <div className="result-main">
        <div className="result-art">
          <CreatureArt id={creature.id} />
        </div>
        <div className="result-text">
          {ev.shiny && <p className="result-shiny">✨ 반짝반짝 생물!</p>}
          <p className="result-title">
            {ev.isNew ? '새로운 생물 발견!' : '또 만났어요!'}
            {ev.gradeBonus > 0 && (
              <span className={`grade-pill grade-${ev.grade}`}>
                {GRADE_TEXT[ev.grade]} +{ev.gradeBonus}
              </span>
            )}
          </p>
          <p className="result-name">{creature.name}</p>
          <p className="result-sub">
            {ev.isNew ? '도감에 새로 기록했어요' : `발견 ${ev.count}번째 · 도감에 기록했어요`}
          </p>
        </div>
        <p className="result-stars" aria-label={`별 ${ev.starsGained}개`}>
          ⭐+{ev.starsGained}
        </p>
      </div>
      {(ev.missionsCompleted.length > 0 || ev.newBadges.length > 0 || ev.rankUp) && (
        <ul className="result-rewards">
          {ev.missionsCompleted.map((m) => (
            <li key={m.id}>🎯 미션 성공! {missionText(m)}</li>
          ))}
          {ev.newBadges.map((b) => (
            <li key={b.id}>
              {b.icon} 새 배지: {b.name}
            </li>
          ))}
          {ev.rankUp && (
            <li className="reward-rank">
              {ev.rankUp.icon} 등급이 올랐어요! <b>{ev.rankUp.name}</b>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
