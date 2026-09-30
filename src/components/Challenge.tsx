import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Creature, SpotKind } from '../data/creatures.ts';
import {
  ASSIST_AFTER,
  CHALLENGE_INFO,
  GAUGE,
  SNEAK_STEPS,
  chaseState,
  gaugePos,
  gaugeZone,
  hideState,
  ringScale,
  ringZone,
  sneakState,
  swimState,
  holeFromKey,
  isActionKey,
  type Grade,
} from '../game/challenges.ts';
import { sfx } from '../game/sound.ts';
import { CreatureArt } from '../art/CreatureArt.tsx';
import { SpotArt } from '../art/SceneArt.tsx';

export interface ChallengeProps {
  creature: Creature;
  /** 처음 나타난 위치 (%) */
  x: number;
  y: number;
  reduced: boolean;
  /** 성공! (한 번만 불립니다) — 생물이 있던 위치와 함께 */
  onSuccess: (grade: Grade, x: number, y: number) => void;
}

/** 화면마다 다시 그리는 시계. 움직임 줄이기 설정이면 천천히 흘러요. */
function useClock(speed: number) {
  const start = useRef(performance.now());
  const [, setFrame] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setFrame((f) => (f + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const now = () => (performance.now() - start.current) * speed;
  return { t: now(), now };
}

/**
 * 키보드 조작. handler 가 true 를 돌려주면 그 키를 여기서 처리한 것으로 보고
 * 브라우저 기본 동작(포커스된 버튼 누르기, 화면 스크롤 등)을 막습니다.
 */
function useKeys(handler: (key: string) => boolean) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.repeat) {
        if (isActionKey(e.key)) e.preventDefault(); // 꾹 누르고 있어도 한 번만
        return;
      }
      if (ref.current(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    // 스페이스바는 손을 뗄 때 버튼이 눌리므로 그것도 막아요 (두 번 처리 방지)
    const up = (e: KeyboardEvent) => {
      if (isActionKey(e.key)) e.preventDefault();
    };
    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up, true);
    return () => {
      window.removeEventListener('keydown', down, true);
      window.removeEventListener('keyup', up, true);
    };
  }, []);
}

/** 잠깐 떴다 사라지는 말풍선 (“아깝다!” 등) */
function useFeedback() {
  const [fb, setFb] = useState<{ key: number; text: string; good: boolean } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const show = (text: string, good = false) => {
    window.clearTimeout(timer.current);
    setFb({ key: performance.now(), text, good });
    timer.current = window.setTimeout(() => setFb(null), 1300);
  };
  return { fb, show };
}

function Feedback({ fb, x, y }: { fb: ReturnType<typeof useFeedback>['fb']; x: number; y: number }) {
  if (!fb) return null;
  return (
    <div key={fb.key} className={`ch-feedback${fb.good ? ' is-good' : ''}`} style={{ '--x': x, '--y': y } as CSSProperties} role="status">
      {fb.text}
    </div>
  );
}

function Sprite({
  creature,
  x,
  y,
  hit,
  onTap,
  className = '',
  flip = false,
  scale = 1,
  children,
}: {
  creature: Creature;
  x: number;
  y: number;
  hit: boolean;
  onTap: () => void;
  className?: string;
  flip?: boolean;
  scale?: number;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`ch-sprite ${className}`}
      style={{ '--x': x, '--y': y, '--s': scale } as CSSProperties}
      data-hit={hit ? 'true' : 'false'}
      aria-label={`${creature.name} 잡기`}
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
    >
      {children}
      <span className={`ch-body${flip ? ' is-flip' : ''}`}>
        <CreatureArt id={creature.id} />
      </span>
    </button>
  );
}

/** 모든 미니게임 공통: 성공은 딱 한 번만 */
function useOnce(onSuccess: ChallengeProps['onSuccess']) {
  const done = useRef(false);
  return {
    done,
    succeed: (g: Grade, x: number, y: number) => {
      if (done.current) return;
      done.current = true;
      onSuccess(g, x, y);
    },
  };
}

// ─────────────────────────── 링 맞추기 ───────────────────────────
function RingGame({ creature, x, y, reduced, onSuccess }: ChallengeProps) {
  const clock = useClock(reduced ? 0.65 : 1);
  const [misses, setMisses] = useState(0);
  const assist = misses >= ASSIST_AFTER.ring;
  const { fb, show } = useFeedback();
  const { done, succeed } = useOnce(onSuccess);
  const s = ringScale(clock.t, assist);
  const zone = ringZone(s, assist);

  const tap = () => {
    if (done.current) return;
    const now = ringScale(clock.now(), assist);
    const z = ringZone(now, assist);
    if (z === 'miss') {
      setMisses((m) => m + 1);
      show(now > 1 ? '조금 더 기다려요!' : '앗, 조금 늦었어요!');
      sfx.miss();
      return;
    }
    succeed(z, x, y);
  };
  useKeys((k) => (isActionKey(k) ? (tap(), true) : false));

  return (
    <div className="challenge-hit-area" onClick={tap}>
      <Sprite creature={creature} x={x} y={y} hit={zone !== 'miss'} onTap={tap}>
        <span className="ring-target" aria-hidden="true" />
        <span className={`ring-move zone-${zone}`} style={{ transform: `translate(-50%, -50%) scale(${s})` }} aria-hidden="true" />
      </Sprite>
      <Feedback fb={fb} x={x} y={y} />
    </div>
  );
}

// ─────────────────────────── 점프 타이밍 게이지 ───────────────────────────
function GaugeGame({ creature, x, y, reduced, onSuccess }: ChallengeProps) {
  const clock = useClock(reduced ? 0.65 : 1);
  const [misses, setMisses] = useState(0);
  const assist = misses >= ASSIST_AFTER.gauge;
  const { fb, show } = useFeedback();
  const { done, succeed } = useOnce(onSuccess);
  const cy = Math.min(y, 42);
  const p = gaugePos(clock.t, assist);
  const zone = gaugeZone(p, assist);
  const good = assist ? GAUGE.assistGood : GAUGE.good;
  const perfect = assist ? GAUGE.assistPerfect : GAUGE.perfect;

  const tap = () => {
    if (done.current) return;
    const z = gaugeZone(gaugePos(clock.now(), assist), assist);
    if (z === 'miss') {
      setMisses((m) => m + 1);
      show('초록색에서 눌러요!');
      sfx.miss();
      return;
    }
    succeed(z, x, cy);
  };
  useKeys((k) => (isActionKey(k) ? (tap(), true) : false));

  return (
    <div className="challenge-hit-area" onClick={tap}>
      <Sprite creature={creature} x={x} y={cy} hit={zone !== 'miss'} onTap={tap} className="is-hopping" />
      <div className="ch-panel">
        <div className="gauge" aria-hidden="true">
          <span className="gauge-good" style={{ left: `${(0.5 - good) * 100}%`, width: `${good * 200}%` }} />
          <span className="gauge-perfect" style={{ left: `${(0.5 - perfect) * 100}%`, width: `${perfect * 200}%` }} />
          <span className={`gauge-pointer zone-${zone}`} style={{ left: `${p * 100}%` }} />
        </div>
        <button
          type="button"
          className="btn btn-primary ch-action"
          data-hit={zone !== 'miss' ? 'true' : 'false'}
          onClick={(e) => {
            e.stopPropagation();
            tap();
          }}
        >
          잡기! <kbd>스페이스</kbd>
        </button>
      </div>
      <Feedback fb={fb} x={x} y={cy} />
    </div>
  );
}

// ─────────────────────────── 날쌘 곤충 잡기 ───────────────────────────
function ChaseGame({ creature, x, y, reduced, onSuccess }: ChallengeProps) {
  const clock = useClock(reduced ? 0.6 : 1);
  const [misses, setMisses] = useState(0);
  const assist = misses >= ASSIST_AFTER.chase;
  const { fb, show } = useFeedback();
  const { done, succeed } = useOnce(onSuccess);
  const st = chaseState(clock.t, assist);
  // 처음 0.6초는 원래 자리에서 날아오르며 길에 합류
  const k = Math.min(1, clock.t / 600);
  const cx = x + (st.x - x) * k;
  const cy = y + (st.y - y) * k;

  // 곤충을 직접 누르면: 날고 있을 때 “완벽해요!”, 쉬고 있을 때 “좋아요!”
  const tap = () => {
    if (done.current) return;
    const now = chaseState(clock.now(), assist);
    succeed(now.resting ? 'good' : 'perfect', cx, cy);
  };
  // 화면 아무 곳이나 누르거나 스페이스바: 곤충이 쉬고 있을 때(“지금!”) 성공
  const anywhere = (how: 'screen' | 'key') => {
    if (done.current) return;
    if (chaseState(clock.now(), assist).resting) {
      succeed('good', cx, cy);
      return;
    }
    setMisses((m) => m + 1);
    show(how === 'key' ? '“지금!”이 뜨면 스페이스바를 눌러요' : '앗, 놓쳤어요! 멈출 때를 노려 봐요');
    sfx.miss();
  };
  useKeys((k) => (isActionKey(k) ? (anywhere('key'), true) : false));

  return (
    <div className="challenge-hit-area" onClick={() => anywhere('screen')}>
      <Sprite
        creature={creature}
        x={cx}
        y={cy}
        hit
        onTap={tap}
        flip={st.facingLeft}
        className={`is-chase${st.resting ? ' is-resting' : ' is-flying'}`}
      >
        {st.resting && <span className="ch-now">지금!</span>}
      </Sprite>
      <Feedback fb={fb} x={cx} y={cy} />
    </div>
  );
}

// ─────────────────────────── 살금살금 (무궁화 꽃이 피었습니다) ───────────────────────────
function SneakGame({ creature, x, y, reduced, onSuccess }: ChallengeProps) {
  const clock = useClock(reduced ? 0.75 : 1);
  const [steps, setSteps] = useState(0);
  const [busts, setBusts] = useState(0);
  const frozenUntil = useRef(0);
  const stepsRef = useRef(0);
  const bustsRef = useRef(0);
  const assist = busts >= ASSIST_AFTER.sneak;
  const { fb, show } = useFeedback();
  const { done, succeed } = useOnce(onSuccess);
  const cy = Math.min(y, 42);
  const look = sneakState(clock.t, assist);
  const frozen = clock.t < frozenUntil.current;

  const tap = () => {
    if (done.current) return;
    const now = clock.now();
    if (now < frozenUntil.current) return;
    if (sneakState(now, assist) === 'look') {
      bustsRef.current += 1;
      setBusts(bustsRef.current);
      frozenUntil.current = now + 800;
      show('앗, 들켰다! 가만히…');
      sfx.miss();
      return;
    }
    stepsRef.current += 1;
    setSteps(stepsRef.current);
    sfx.step();
    if (stepsRef.current >= SNEAK_STEPS) {
      const b = bustsRef.current;
      succeed(b === 0 ? 'perfect' : b === 1 ? 'good' : 'ok', x, cy);
    }
  };
  useKeys((k) => (isActionKey(k) ? (tap(), true) : false));

  const bubble = look === 'away' ? '🎵' : look === 'warn' ? '❗' : '👀';
  return (
    <div className="challenge-hit-area" onClick={tap}>
      <Sprite
        creature={creature}
        x={x}
        y={cy}
        hit={false}
        onTap={() => {}}
        flip={look === 'away'}
        scale={0.8 + steps * 0.14}
        className={`is-sneak look-${look}`}
      >
        <span className="ch-bubble" aria-hidden="true">
          {bubble}
        </span>
      </Sprite>
      <div className="ch-panel">
        <div className="steps" aria-label={`${steps}/${SNEAK_STEPS}걸음`}>
          {Array.from({ length: SNEAK_STEPS }, (_, i) => (
            <span key={i} className={i < steps ? 'is-on' : ''}>
              👣
            </span>
          ))}
        </div>
        <p className={`look-text look-${look}`}>
          {look === 'look' ? '보고 있어요! 멈춰요' : look === 'warn' ? '곧 돌아봐요!' : '지금 다가가요!'}
        </p>
        <button
          type="button"
          className="btn btn-primary ch-action"
          data-hit={look !== 'look' && !frozen ? 'true' : 'false'}
          onClick={(e) => {
            e.stopPropagation();
            tap();
          }}
        >
          살금살금 👣 <kbd>스페이스</kbd>
        </button>
      </div>
      <Feedback fb={fb} x={x} y={cy} />
    </div>
  );
}

// ─────────────────────────── 숨바꼭질 (두더지 잡기) ───────────────────────────
const COVER: Record<string, SpotKind> = { ant: 'ground', earthworm: 'soil', snail: 'wetLeaf', 'pill-bug': 'fallenLeaves' };

function HideGame({ creature, x, y, reduced, onSuccess }: ChallengeProps) {
  const clock = useClock(reduced ? 0.75 : 1);
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState<{ i: number; key: number } | null>(null);
  const assist = misses >= ASSIST_AFTER.hide;
  const { fb, show } = useFeedback();
  const { done, succeed } = useOnce(onSuccess);
  const st = hideState(clock.t, assist);
  const baseX = Math.min(62, Math.max(38, x));
  const cy = Math.min(74, Math.max(40, y));
  const xs = [baseX - 24, baseX, baseX + 24];
  const cover = COVER[creature.id] ?? 'stone';

  const tap = (i: number) => {
    if (done.current) return;
    const now = hideState(clock.now(), assist);
    if (now.stage === 'peek' && now.hole === i) {
      succeed(misses === 0 ? 'perfect' : misses <= 2 ? 'good' : 'ok', xs[i], cy);
      return;
    }
    setMisses((m) => m + 1);
    setShake({ i, key: performance.now() });
    show(now.stage === 'wiggle' && now.hole === i ? '곧 나와요! 조금만 기다려요' : '여기는 없어요!');
    sfx.miss();
  };
  useKeys((k) => {
    const i = holeFromKey(k);
    if (i !== null) {
      tap(i);
      return true;
    }
    if (isActionKey(k)) {
      show('숫자 1, 2, 3으로 골라요!');
      return true;
    }
    return false;
  });

  return (
    <div className="challenge-hit-area">
      {xs.map((cx, i) => {
        const here = st.hole === i;
        const peek = here && st.stage === 'peek';
        return (
          <button
            key={i}
            type="button"
            className={`hide-cover${here && st.stage === 'wiggle' ? ' is-wiggle' : ''}${peek ? ' is-peek' : ''}${shake?.i === i ? ' is-shake' : ''}`}
            style={{ '--x': cx, '--y': cy } as CSSProperties}
            data-hit={peek ? 'true' : 'false'}
            aria-label={`${i + 1}번째 숨은 곳 살펴보기`}
            onClick={() => tap(i)}
            onAnimationEnd={() => setShake(null)}
          >
            {peek && (
              <span className="hide-peek" aria-hidden="true">
                <CreatureArt id={creature.id} />
              </span>
            )}
            <span className="hide-art" aria-hidden="true">
              <SpotArt kind={cover} variant={i} />
            </span>
            <kbd className="hide-key" aria-hidden="true">
              {i + 1}
            </kbd>
          </button>
        );
      })}
      <Feedback fb={fb} x={baseX} y={cy - 12} />
    </div>
  );
}

// ─────────────────────────── 물속 그림자 ───────────────────────────
function SwimGame({ creature, reduced, onSuccess }: ChallengeProps) {
  const clock = useClock(reduced ? 0.7 : 1);
  const [misses, setMisses] = useState(0);
  const assist = misses >= ASSIST_AFTER.swim;
  const { fb, show } = useFeedback();
  const { done, succeed } = useOnce(onSuccess);
  const st = swimState(clock.t, assist);

  const tap = () => {
    if (done.current) return;
    const now = swimState(clock.now(), assist);
    if (now.stage === 'up') {
      succeed(now.upFrac < 0.5 ? 'perfect' : 'good', now.x, now.y);
      return;
    }
    setMisses((m) => m + 1);
    show('물 위로 떠오르면 떠요!');
    sfx.miss();
  };
  useKeys((k) => (isActionKey(k) ? (tap(), true) : false));

  // 화면 어디를 눌러도 “지금 뜨기”로 처리
  return (
    <div className="challenge-hit-area" onClick={tap}>
      <Sprite
        creature={creature}
        x={st.x}
        y={st.y}
        hit={st.stage === 'up'}
        onTap={tap}
        flip={!st.facingLeft}
        className={`is-swim stage-${st.stage}`}
      >
        {st.stage === 'rise' && (
          <span className="ch-bubbles" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
        {st.stage === 'up' && <span className="ch-splash" aria-hidden="true" />}
      </Sprite>
      <Feedback fb={fb} x={st.x} y={st.y} />
    </div>
  );
}

const GAMES = {
  ring: RingGame,
  gauge: GaugeGame,
  chase: ChaseGame,
  sneak: SneakGame,
  hide: HideGame,
  swim: SwimGame,
} as const;

export function Challenge(props: ChallengeProps) {
  const Game = GAMES[props.creature.challenge];
  const info = CHALLENGE_INFO[props.creature.challenge];
  const rootRef = useRef<HTMLDivElement>(null);
  // 미니게임이 시작되면 키보드 초점을 미니게임으로 옮겨요 (다른 버튼이 눌리지 않게)
  useEffect(() => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    rootRef.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className={`challenge challenge--${props.creature.challenge}`}
      data-kind={props.creature.challenge}
      data-name={props.creature.name}
      aria-label={`${info.name}: ${info.hint} (${info.keys})`}
    >
      <div className="ch-banner" aria-hidden="true">
        <span>
          {info.icon} {info.name}
        </span>
        <small className="ch-keys">{info.keys}</small>
      </div>
      <Game {...props} />
    </div>
  );
}
