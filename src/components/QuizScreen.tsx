import { useEffect, useMemo, useRef, useState } from 'react';
import { QUIZ_LENGTH, QUIZ_STAR, makeQuiz, type QuizQuestion } from '../game/quiz.ts';
import type { Badge, Rank } from '../game/progress.ts';
import { sfx } from '../game/sound.ts';
import { CreatureArt } from '../art/CreatureArt.tsx';
import { HabitatIcon, Mascot } from '../art/SceneArt.tsx';

interface Props {
  counts: Record<string, number>;
  onBack: () => void;
  /** 한 판이 끝나면 맞힌 수를 기록하고 받은 별·배지를 돌려줘요 */
  onFinish: (correct: number) => { starsGained: number; newBadges: Badge[]; rankUp: Rank | null };
}

export function QuizScreen({ counts, onBack, onFinish }: Props) {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => makeQuiz(counts), [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [result, setResult] = useState<ReturnType<Props['onFinish']> | null>(null);
  const lock = useRef(false);
  const nextRef = useRef<HTMLButtonElement>(null);

  const q: QuizQuestion | undefined = questions[index];
  const done = index >= questions.length;

  useEffect(() => {
    if (picked) nextRef.current?.focus();
  }, [picked]);

  const choose = (key: string) => {
    if (lock.current || !q) return;
    lock.current = true;
    setPicked(key);
    if (key === q.answer) {
      setCorrect((n) => n + 1);
      sfx.newFind();
    } else {
      sfx.miss();
    }
  };

  const next = () => {
    if (!picked) return;
    const isLast = index + 1 >= questions.length;
    setPicked(null);
    lock.current = false;
    setIndex((i) => i + 1);
    if (isLast) {
      const r = onFinish(correct);
      setResult(r);
      if (r.newBadges.length || r.rankUp) sfx.reward();
    }
  };

  const again = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setCorrect(0);
    setPicked(null);
    setResult(null);
    lock.current = false;
  };

  return (
    <div className="screen quiz-screen">
      <header className="topbar dex-top">
        <button type="button" className="btn btn-light" onClick={onBack}>
          <span aria-hidden="true">←</span> 홈으로 돌아가기
        </button>
        <div className="dex-progress">
          <p className="dex-progress-text">
            💡 생태 퀴즈 <strong>{done ? QUIZ_LENGTH : index + 1}/{QUIZ_LENGTH}</strong>
          </p>
          <div className="bar" aria-hidden="true">
            <span style={{ width: `${((done ? QUIZ_LENGTH : index) / QUIZ_LENGTH) * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="quiz-body">
        {!done && q && (
          <section className="quiz-card" key={`${round}-${index}`}>
            <p className="quiz-kind">
              {q.kind === 'fact' ? '🔍 설명 듣고 맞히기' : q.kind === 'insect' ? '🐞 곤충일까, 아닐까?' : '🗺️ 어디에서 만날까?'}
            </p>
            <h2 className="quiz-prompt">{q.prompt}</h2>

            {q.kind === 'fact' ? (
              <p className="quiz-clue">“{q.clue}”</p>
            ) : (
              <div className="quiz-hero">
                <CreatureArt id={q.creature.id} />
              </div>
            )}

            <div className={`quiz-choices quiz-choices--${q.kind}`} role="group" aria-label="보기">
              {q.choices.map((c, i) => {
                const state = picked ? (c.key === q.answer ? ' is-answer' : c.key === picked ? ' is-wrong' : ' is-dim') : '';
                return (
                  <button
                    key={c.key}
                    type="button"
                    className={`quiz-choice${state}`}
                    onClick={() => choose(c.key)}
                    disabled={!!picked}
                    aria-label={`${i + 1}번 ${c.label}`}
                  >
                    <kbd className="key-hint" aria-hidden="true">
                      {i + 1}
                    </kbd>
                    {c.creatureId && (
                      <span className="quiz-choice-art" aria-hidden="true">
                        <CreatureArt id={c.creatureId} />
                      </span>
                    )}
                    {c.habitat && (
                      <span className="quiz-choice-place" aria-hidden="true">
                        <HabitatIcon id={c.habitat} />
                      </span>
                    )}
                    <span className="quiz-choice-label">{c.label}</span>
                  </button>
                );
              })}
            </div>

            {picked && (
              <div className={`quiz-feedback${picked === q.answer ? ' is-right' : ' is-wrong'}`} role="status">
                <p className="quiz-feedback-title">{picked === q.answer ? `⭕ 정답이에요! ⭐+${QUIZ_STAR}` : '💡 아쉬워요! 정답을 알아볼까요?'}</p>
                <p className="quiz-explain">{q.explain}</p>
                {q.creature.caution && <p className="quiz-caution">⚠️ {q.creature.caution}</p>}
                <button ref={nextRef} type="button" className="btn btn-primary" onClick={next}>
                  {index + 1 >= questions.length ? '결과 보기' : '다음 문제 ▶'}
                </button>
              </div>
            )}
          </section>
        )}

        {done && result && (
          <section className="quiz-card quiz-result">
            <div className="quiz-result-mascot">
              <Mascot mood="happy" />
            </div>
            <h2 className="quiz-prompt">
              {QUIZ_LENGTH}문제 중 <b>{correct}문제</b> 맞혔어요!
            </h2>
            <p className="quiz-result-stars">⭐ +{result.starsGained}</p>
            {result.newBadges.map((b) => (
              <p key={b.id} className="quiz-result-line">
                {b.icon} 새 배지: {b.name}
              </p>
            ))}
            {result.rankUp && (
              <p className="quiz-result-line">
                {result.rankUp.icon} 등급이 올랐어요! <b>{result.rankUp.name}</b>
              </p>
            )}
            <p className="quiz-result-tip">
              {correct === QUIZ_LENGTH ? '모두 맞혔어요! 생물 박사가 다 됐네요!' : '틀린 문제는 도감에서 다시 살펴봐요.'}
            </p>
            <div className="dialog-actions">
              <button type="button" className="btn btn-light" onClick={onBack}>
                홈으로
              </button>
              <button type="button" className="btn btn-primary" onClick={again} autoFocus>
                한 판 더 하기
              </button>
            </div>
          </section>
        )}
        <p className="quiz-note">퀴즈는 도감에 적힌 설명으로 만들어요. 게임 속 장소는 간단히 꾸민 것이에요.</p>
      </div>
      <QuizKeys
        count={q?.choices.length ?? 0}
        enabled={!done && !picked}
        onPick={(i) => q && choose(q.choices[i].key)}
        onNext={() => picked && next()}
      />
    </div>
  );
}

/** 키보드: 1~4 보기 고르기, 엔터/스페이스 다음 문제 */
function QuizKeys({ count, enabled, onPick, onNext }: { count: number; enabled: boolean; onPick: (i: number) => void; onNext: () => void }) {
  const ref = useRef({ count, enabled, onPick, onNext });
  ref.current = { count, enabled, onPick, onNext };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
      const n = Number(e.key);
      const r = ref.current;
      if (r.enabled && n >= 1 && n <= r.count) {
        e.preventDefault();
        r.onPick(n - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
