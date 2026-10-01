import { useEffect, useRef, useState } from 'react';
import { CREATURES, getCreature } from '../data/creatures.ts';
import { CARD_GRADES, cardTitle, type Card } from '../game/cards.ts';
import { GameCard } from './GameCard.tsx';

interface Props {
  cards: Card[];
  backLabel: string;
  onBack: () => void;
}

type Sort = 'grade' | 'recent';
const PAGE = 60;

export function CardsScreen({ cards, backLabel, onBack }: Props) {
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [sort, setSort] = useState<Sort>('grade');
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<Card | null>(null);

  const order = (c: Card) => CREATURES.findIndex((x) => x.id === c.c);
  const list = cards
    .filter((c) => filter === 'all' || c.g === filter)
    .slice()
    .sort((a, b) => (sort === 'recent' ? b.t - a.t : b.g - a.g || order(a) - order(b) || b.t - a.t));
  const kinds = new Set(cards.map((c) => c.c)).size;

  useEffect(() => {
    setShown(PAGE);
  }, [filter, sort]);

  return (
    <div className="screen cards-screen">
      <header className="topbar dex-top">
        <button type="button" className="btn btn-light" onClick={onBack}>
          <span aria-hidden="true">←</span> {backLabel}
        </button>
        <div className="dex-progress">
          <p className="dex-progress-text">
            🃏 나의 카드첩 <strong>{cards.length}장</strong>
          </p>
          <p className="cards-sub">
            생물 {kinds}/{CREATURES.length}가지의 카드를 모았어요
          </p>
        </div>
      </header>

      <div className="dex-body">
        <p className="cards-guide">생물을 잡을 때마다 카드를 한 장 받아요. “완벽해요!”를 받으면 더 좋은 카드가 나올 확률이 올라가요!</p>

        <div className="filters" role="group" aria-label="카드 등급">
          <button
            type="button"
            className={`filter${filter === 'all' ? ' is-active' : ''}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            전체 <span className="filter-count">{cards.length}</span>
          </button>
          {CARD_GRADES.map((g, i) => (
            <button
              key={g.name}
              type="button"
              className={`filter grade-filter gf-${i}${filter === i ? ' is-active' : ''}`}
              aria-pressed={filter === i}
              onClick={() => setFilter(i)}
            >
              {g.name} <span className="filter-count">{cards.filter((c) => c.g === i).length}</span>
            </button>
          ))}
        </div>

        <div className="sort-row" role="group" aria-label="정렬">
          <button type="button" className={`sort-btn${sort === 'grade' ? ' is-active' : ''}`} aria-pressed={sort === 'grade'} onClick={() => setSort('grade')}>
            높은 등급부터
          </button>
          <button type="button" className={`sort-btn${sort === 'recent' ? ' is-active' : ''}`} aria-pressed={sort === 'recent'} onClick={() => setSort('recent')}>
            최근 받은 카드부터
          </button>
        </div>

        {list.length === 0 ? (
          <div className="cards-empty">
            <p>{cards.length === 0 ? '아직 카드가 없어요. 탐험을 떠나 생물을 잡으면 카드를 받아요!' : '이 등급의 카드는 아직 없어요.'}</p>
          </div>
        ) : (
          <ul className="card-grid">
            {list.slice(0, shown).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="card-btn"
                  onClick={() => setOpen(c)}
                  aria-label={`${CARD_GRADES[c.g].name} 카드 ${cardTitle(c, getCreature(c.c)?.name ?? '')} 크게 보기`}
                >
                  <GameCard card={c} size="md" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {list.length > shown && (
          <div className="more-row">
            <button type="button" className="btn btn-light" onClick={() => setShown((n) => n + PAGE)}>
              카드 더 보기 ({list.length - shown}장 남음)
            </button>
          </div>
        )}
      </div>

      {open && <CardDetail card={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function CardDetail({ card, onClose }: { card: Card; onClose: () => void }) {
  const creature = getCreature(card.c);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const d = new Date(card.t);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="card-detail" role="dialog" aria-modal="true" aria-label="카드 크게 보기" onClick={(e) => e.stopPropagation()}>
        <GameCard card={card} size="lg" reveal />
        <p className="card-detail-date">
          {d.getMonth() + 1}월 {d.getDate()}일에 받은 카드
        </p>
        {creature && <p className="card-detail-fact">{creature.fact}</p>}
        <button ref={closeRef} type="button" className="btn btn-primary" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
