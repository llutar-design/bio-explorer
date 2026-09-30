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
  type Tool,
} from '../data/creatures.ts';
import {
  creaturePosition,
  makeLayout,
  pickCreature,
  withIGa,
  type PlacedSpot,
} from '../game/logic.ts';
import {
  SHINY_CHANCE,
  missionHabitat,
  missionText,
  rankOf,
  type FindEvents,
  type Mission,
} from '../game/progress.ts';
import type { SaveData } from '../game/storage.ts';
import { sfx } from '../game/sound.ts';
import { CreatureArt } from '../art/CreatureArt.tsx';
import { BookIcon, HabitatIcon, Logo, Mascot, SceneDecor, SpotArt, ToolArt } from '../art/SceneArt.tsx';
import { usePrefersReducedMotion } from '../hooks.ts';

interface Props {
  habitat: HabitatId;
  onHabitat: (h: HabitatId) => void;
  save: SaveData;
  onRecord: (id: string, shiny: boolean) => FindEvents;
  onToggleSound: () => void;
  onOpenDex: () => void;
  onCelebrate: () => void;
}

type Phase = 'idle' | 'appear' | 'catch' | 'caught' | 'release';

interface Encounter {
  key: number;
  spotKey: string;
  creature: Creature;
  shiny: boolean;
  x: number;
  y: number;
}

interface ResultToast {
  key: number;
  creature: Creature;
  events: FindEvents;
  /** 생물이 위쪽에 있으면 안내를 아래에 띄워 가리지 않게 */
  atBottom: boolean;
}

const TOOL_HINT: Record<Tool, string> = {
  net: '눌러서 잠자리채로 잡아 보세요!',
  scoop: '눌러서 뜰채로 떠 보세요!',
  loupe: '눌러서 돋보기로 살펴보세요!',
};

const CHEERS = ['멋져요!', '대단해요!', '최고의 탐험가!', '와, 찾았다!', '잘했어요!'];

export function ExploreScreen({ habitat, onHabitat, save, onRecord, onToggleSound, onOpenDex, onCelebrate }: Props) {
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

  const onSpot = (spot: PlacedSpot) => {
    if (phaseRef.current !== 'idle') return;
    const creature = pickCreature(habitat, spot.kind, counts);
    if (!creature) return;
    const shiny = Math.random() < SHINY_CHANCE;
    seq.current += 1;
    const next: Encounter = { key: seq.current, spotKey: spot.key, creature, shiny, ...creaturePosition(spot, creature) };
    encRef.current = next;
    setEnc(next);
    go('appear');
    sfx.search();
    if (shiny) sfx.appearShiny();
    else sfx.appear();
  };

  const onCatch = () => {
    const current = encRef.current;
    if (phaseRef.current !== 'appear' || !current) return;
    go('catch'); // 잠금: 이후 누르기는 무시
    sfx.catch();
    const ev = onRecord(current.creature.id, current.shiny); // 도감에 바로 기록
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
  const { rank, next } = rankOf(save.stars);
  const rankPct = next ? Math.min(100, ((save.stars - rank.min) / (next.min - rank.min)) * 100) : 100;

  let hint: string;
  let mood: 'idle' | 'wow' | 'happy' = 'idle';
  if (phase === 'appear' && enc) {
    mood = 'wow';
    hint = enc.shiny
      ? `우와! 반짝반짝 빛나는 ${withIGa(enc.creature.name)} 나타났어요! ${TOOL_HINT[enc.creature.tool]}`
      : `${withIGa(enc.creature.name)} 나타났어요! ${TOOL_HINT[enc.creature.tool]}`;
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
          <Logo />
          <h1 className="brand-name">우리 반 생물 탐험대</h1>
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
              <span className="habitat-name">{h.name}</span>
              <span className="habitat-count">
                {got}/{list.length}
              </span>
            </button>
          );
        })}
      </nav>

      <section className="mission-bar" aria-label="나의 등급과 탐험 미션">
        <div className="rank-card" aria-label={`${rank.name}, 별 ${save.stars}개`}>
          <span className="rank-icon" aria-hidden="true">
            {rank.icon}
          </span>
          <div className="rank-info">
            <p className="rank-name">{rank.name}</p>
            <p className="rank-stars">
              ⭐ {save.stars}
              {next && <small> / {next.min}</small>}
            </p>
            <div className="mini-bar" aria-hidden="true">
              <span style={{ width: `${rankPct}%` }} />
            </div>
          </div>
        </div>
        <ul className="missions" aria-label="탐험 미션">
          {save.missions.map((m) => (
            <MissionChip key={m.id} mission={m} />
          ))}
        </ul>
      </section>

      <main className={`scene scene--${habitat}`} aria-label={`${getHabitat(habitat).name} 탐험`}>
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

        {enc && (
          <div
            key={`enc-${enc.key}`}
            className={`encounter is-${phase} motion-${enc.creature.motion}${enc.shiny ? ' is-shiny' : ''}`}
            style={{ '--x': enc.x, '--y': enc.y } as CSSProperties}
          >
            <button
              type="button"
              className="creature-btn"
              onClick={onCatch}
              aria-label={`${enc.shiny ? '반짝이는 ' : ''}${enc.creature.name} ${enc.creature.tool === 'loupe' ? '살펴보기' : '채집하기'}`}
              aria-disabled={phase !== 'appear'}
            >
              <span className="creature-body">
                <CreatureArt id={enc.creature.id} />
              </span>
            </button>
            {phase !== 'appear' && (
              <div className={`tool tool--${enc.creature.tool}`} aria-hidden="true">
                <ToolArt tool={enc.creature.tool} />
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
        </div>
      </footer>
    </div>
  );
}

function MissionChip({ mission }: { mission: Mission }) {
  const h = missionHabitat(mission);
  let icon;
  if (mission.kind === 'tool') {
    icon = <ToolArt tool={mission.target as Tool} />;
  } else if (h) {
    icon = <HabitatIcon id={h} />;
  } else if (mission.kind === 'group') {
    icon = <span>{mission.target === 'insect' ? '🐞' : '🐸'}</span>;
  } else {
    icon = <span>✨</span>;
  }
  return (
    <li className={`mission${mission.done ? ' is-done' : ''}`}>
      <span className="mission-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="mission-text">{missionText(mission)}</span>
      <span className="mission-prog">
        {mission.done ? (
          <span className="stamp">성공!</span>
        ) : (
          <>
            {mission.have}/{mission.need}
            <small> ⭐{mission.reward}</small>
          </>
        )}
      </span>
    </li>
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
          <p className="result-title">{ev.isNew ? '새로운 생물 발견!' : '또 만났어요!'}</p>
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
