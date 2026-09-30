import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { TOTAL, getCreature, type HabitatId } from './data/creatures.ts';
import { emptySave, isStorageAvailable, loadSave, writeSave, type SaveData } from './game/storage.ts';
import { applyFind, type FindEvents } from './game/progress.ts';
import type { Grade } from './game/challenges.ts';
import { setSoundEnabled, sfx } from './game/sound.ts';
import { ExploreScreen } from './components/ExploreScreen.tsx';
import { DexScreen } from './components/DexScreen.tsx';
import { Logo, Mascot } from './art/SceneArt.tsx';

type Screen = 'explore' | 'dex';

export default function App() {
  const [storageOk, setStorageOk] = useState(isStorageAvailable);
  const [save, setSave] = useState<SaveData>(() => (isStorageAvailable() ? loadSave() : emptySave()));
  const saveRef = useRef(save);
  const [screen, setScreen] = useState<Screen>('explore');
  const [habitat, setHabitat] = useState<HabitatId>('flower');
  const [started, setStarted] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => setSoundEnabled(save.sound), [save.sound]);

  const commit = useCallback((next: SaveData) => {
    saveRef.current = next;
    setSave(next);
    if (!writeSave(next)) setStorageOk(false);
  }, []);

  // 발견 1번을 기록합니다. (같은 생물이면 발견 횟수만 늘어요)
  const record = useCallback(
    (id: string, shiny: boolean, grade: Grade): FindEvents => {
      const creature = getCreature(id)!;
      const { next, events } = applyFind(saveRef.current, creature, shiny, grade);
      commit(next);
      return events;
    },
    [commit],
  );

  const toggleSound = () => {
    const on = !saveRef.current.sound;
    commit({ ...saveRef.current, sound: on });
    setSoundEnabled(on);
    if (on) sfx.tap();
  };

  const reset = () => {
    commit(emptySave(saveRef.current.sound));
    setNotice('탐험 기록을 모두 지웠어요.');
  };

  // 시작 화면: 초점이 어디에 있든 엔터·스페이스바로 시작
  useEffect(() => {
    if (started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      setStarted(true);
      sfx.appear();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(t);
  }, [notice]);

  return (
    <div className="app">
      {!storageOk && (
        <div className="storage-warning" role="alert">
          ⚠️ 지금은 기록을 저장할 수 없어요. 게임은 할 수 있지만, 창을 닫으면 기록이 사라져요.
        </div>
      )}

      {screen === 'explore' ? (
        <ExploreScreen
          habitat={habitat}
          onHabitat={(h) => {
            if (h !== habitat) sfx.tap();
            setHabitat(h);
          }}
          save={save}
          onRecord={record}
          onToggleSound={toggleSound}
          onOpenDex={() => setScreen('dex')}
          onCelebrate={() => {
            sfx.rankUp();
            setCelebrating(true);
          }}
        />
      ) : (
        <DexScreen save={save} storageOk={storageOk} onBack={() => setScreen('explore')} onReset={reset} />
      )}

      {!started && (
        <div className="overlay start-overlay">
          <div className="start-card" role="dialog" aria-modal="true" aria-labelledby="start-title">
            <div className="start-hero">
              <Logo />
              <div className="start-mascot">
                <Mascot mood="happy" />
              </div>
            </div>
            <h1 id="start-title">우리 반 생물 탐험대</h1>
            <p className="start-line">장소를 고르고, 흔들리는 곳을 눌러 숨은 생물을 찾아보세요!</p>
            <button
              type="button"
              className="btn btn-primary btn-big"
              onClick={() => {
                setStarted(true);
                sfx.appear();
              }}
              autoFocus
            >
              탐험 시작!
            </button>
            <p className="start-note">
              {storageOk
                ? '이 브라우저에 탐험 기록이 저장돼요. 같은 기기·같은 브라우저를 쓰면 기록도 함께 써요.'
                : '지금은 기록이 저장되지 않아요. 창을 닫으면 기록이 사라져요.'}
            </p>
          </div>
        </div>
      )}

      {celebrating && (
        <div className="overlay celebrate-overlay">
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} style={{ '--i': i } as CSSProperties} />
            ))}
          </div>
          <div className="celebrate-card" role="dialog" aria-modal="true" aria-labelledby="celebrate-title">
            <p className="celebrate-emoji" aria-hidden="true">🎉</p>
            <h2 id="celebrate-title">축하해요!</h2>
            <p>수집할 생물 {TOTAL}가지를 모두 발견했어요!</p>
            <p className="celebrate-sub">반짝이는 생물과 남은 배지도 모아 볼까요?</p>
            <div className="dialog-actions">
              <button type="button" className="btn btn-light" onClick={() => { setCelebrating(false); setScreen('dex'); }}>
                도감 보기
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setCelebrating(false)} autoFocus>
                계속 탐험하기
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}
    </div>
  );
}
