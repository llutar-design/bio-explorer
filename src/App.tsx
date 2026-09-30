import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { TOTAL, getCreature, type HabitatId } from './data/creatures.ts';
import { emptySave, isStorageAvailable, loadSave, writeSave, type SaveData } from './game/storage.ts';
import { applyFind, type FindEvents } from './game/progress.ts';
import type { Grade } from './game/challenges.ts';
import { setSoundEnabled, sfx } from './game/sound.ts';
import { HomeScreen } from './components/HomeScreen.tsx';
import { ExploreScreen } from './components/ExploreScreen.tsx';
import { DexScreen } from './components/DexScreen.tsx';

// 화면: 홈(장소 고르기 + 찾은 생물 정원) → 탐험 → 도감
type Screen = 'home' | 'explore' | 'dex';

export default function App() {
  const [storageOk, setStorageOk] = useState(isStorageAvailable);
  const [save, setSave] = useState<SaveData>(() => (isStorageAvailable() ? loadSave() : emptySave()));
  const saveRef = useRef(save);
  const [screen, setScreen] = useState<Screen>('home');
  const [dexFrom, setDexFrom] = useState<'home' | 'explore'>('home');
  const [habitat, setHabitat] = useState<HabitatId>('flower');
  const [celebrating, setCelebrating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setSoundEnabled(save.sound);
  }, [save.sound]);

  // 화면을 바꾸면 맨 위부터 보이게
  // (최신 크롬은 scrollTo 가 값을 돌려주므로 반드시 중괄호로 감싸 아무것도 돌려주지 않게 합니다)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

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

  const goExplore = (h: HabitatId) => {
    sfx.appear();
    setHabitat(h);
    setScreen('explore');
  };

  const openDex = (from: 'home' | 'explore') => {
    setDexFrom(from);
    setScreen('dex');
  };

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

      {screen === 'home' && (
        <HomeScreen
          save={save}
          storageOk={storageOk}
          onGo={goExplore}
          onOpenDex={() => openDex('home')}
          onToggleSound={toggleSound}
        />
      )}

      {screen === 'explore' && (
        <ExploreScreen
          habitat={habitat}
          onHabitat={(h) => {
            if (h !== habitat) sfx.tap();
            setHabitat(h);
          }}
          save={save}
          onRecord={record}
          onToggleSound={toggleSound}
          onOpenDex={() => openDex('explore')}
          onHome={() => {
            sfx.tap();
            setScreen('home');
          }}
          onCelebrate={() => {
            sfx.rankUp();
            setCelebrating(true);
          }}
        />
      )}

      {screen === 'dex' && (
        <DexScreen
          save={save}
          storageOk={storageOk}
          backLabel={dexFrom === 'home' ? '홈으로 돌아가기' : '탐험으로 돌아가기'}
          onBack={() => setScreen(dexFrom)}
          onReset={reset}
        />
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
            <p className="celebrate-sub">홈 화면 정원에서 친구들을 만나 보세요!</p>
            <div className="dialog-actions">
              <button type="button" className="btn btn-light" onClick={() => { setCelebrating(false); setScreen('home'); }}>
                🏠 홈에서 보기
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
