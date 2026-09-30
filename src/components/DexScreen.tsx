import { useEffect, useRef, useState } from 'react';
import {
  CREATURES,
  GROUP_NAMES,
  TOTAL,
  countDiscovered,
  getCreature,
  getHabitat,
  type Creature,
  type Group,
} from '../data/creatures.ts';
import { CreatureArt } from '../art/CreatureArt.tsx';
import { HabitatIcon } from '../art/SceneArt.tsx';
import { BADGES, rankOf } from '../game/progress.ts';
import type { SaveData } from '../game/storage.ts';

type Filter = 'all' | Group;

interface Props {
  save: SaveData;
  storageOk: boolean;
  onBack: () => void;
  onReset: () => void;
}

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'insect', label: '곤충' },
  { id: 'other', label: '다른 동물' },
];

export function DexScreen({ save, storageOk, onBack, onReset }: Props) {
  const counts = save.counts;
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const found = countDiscovered(counts);
  const list = CREATURES.filter((c) => filter === 'all' || c.group === filter);
  const detail = selected ? getCreature(selected) : undefined;

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSelected(null);
      setConfirming(false);
      setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="screen dex">
      <header className="topbar dex-top">
        <button type="button" className="btn btn-light" onClick={onBack}>
          <span aria-hidden="true">←</span> 탐험으로 돌아가기
        </button>
        <div className="dex-progress">
          <p className="dex-progress-text">
            발견한 생물 <strong>{found}/{TOTAL}</strong>
          </p>
          <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={found} aria-label="도감 진행">
            <span style={{ width: `${(found / TOTAL) * 100}%` }} />
          </div>
        </div>
        <div className="menu" ref={menuRef}>
          <button
            type="button"
            className="btn btn-icon-only"
            aria-label="더보기 메뉴"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true">⋯</span>
          </button>
          {menuOpen && (
            <div className="menu-pop" role="menu">
              <button
                type="button"
                role="menuitem"
                className="menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirming(true);
                }}
              >
                기록 지우기
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="dex-body">
        <MyExplore save={save} />

        <h2 className="dex-title">수집할 생물 {TOTAL}가지</h2>

        <div className="filters" role="group" aria-label="도감 분류">
          {FILTERS.map((f) => {
            const all = CREATURES.filter((c) => f.id === 'all' || c.group === f.id);
            const got = all.filter((c) => (counts[c.id] ?? 0) > 0).length;
            return (
              <button
                key={f.id}
                type="button"
                className={`filter${filter === f.id ? ' is-active' : ''}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label} <span className="filter-count">{got}/{all.length}</span>
              </button>
            );
          })}
        </div>

        <ul className="cards">
          {list.map((c) => (
            <li key={c.id}>
              <Card creature={c} count={counts[c.id] ?? 0} shiny={save.shiny[c.id] ?? 0} onOpen={() => setSelected(c.id)} />
            </li>
          ))}
        </ul>

        <aside className="dex-notes">
          <p>🔍 게임에서는 수집하고, 자연에서는 눈으로 관찰해요!</p>
          <p>게임 속 장소는 간단히 꾸민 것이에요. 실제 자연에서 언제나 그곳에서 볼 수 있는 것은 아니에요.</p>
          {storageOk ? (
            <p>💾 이 브라우저에 탐험 기록이 저장돼요. 같은 기기·같은 브라우저를 쓰는 친구와는 기록을 함께 써요.</p>
          ) : (
            <p className="warn">⚠️ 지금은 기록을 저장할 수 없어요. 창을 닫으면 기록이 사라져요.</p>
          )}
        </aside>
      </div>

      {detail && (
        <Detail
          creature={detail}
          count={counts[detail.id] ?? 0}
          shiny={save.shiny[detail.id] ?? 0}
          onClose={() => setSelected(null)}
        />
      )}

      {confirming && (
        <div className="overlay" onClick={() => setConfirming(false)}>
          <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="reset-title">탐험 기록을 모두 지울까요?</h3>
            <p>지운 기록은 되돌릴 수 없어요.</p>
            <div className="dialog-actions">
              <button type="button" className="btn btn-light" onClick={() => setConfirming(false)} autoFocus>
                취소
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setConfirming(false);
                  onReset();
                }}
              >
                지우기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceTag({ creature }: { creature: Creature }) {
  return (
    <span className="place-tag">
      <HabitatIcon id={creature.habitat} />
      {getHabitat(creature.habitat).name}
    </span>
  );
}

/** 나의 탐험: 등급, 별, 배지(스티커) 모음 */
function MyExplore({ save }: { save: SaveData }) {
  const { rank, next } = rankOf(save.stars);
  const pct = next ? Math.min(100, ((save.stars - rank.min) / (next.min - rank.min)) * 100) : 100;
  const shinyTotal = Object.values(save.shiny).reduce((a, b) => a + b, 0);
  return (
    <section className="my-explore" aria-label="나의 탐험">
      <div className="my-rank">
        <span className="my-rank-icon" aria-hidden="true">
          {rank.icon}
        </span>
        <div className="my-rank-info">
          <p className="my-rank-name">{rank.name}</p>
          <p className="my-rank-stars">
            ⭐ {save.stars}
            {next ? ` · 다음 등급 ‘${next.name}’까지 ⭐${next.min - save.stars}` : ' · 최고 등급이에요!'}
          </p>
          <div className="bar" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="my-rank-stats">
            발견 {save.totalFinds}번 · 미션 성공 {save.missionsDone}개 · 반짝 생물 {shinyTotal}번
          </p>
        </div>
      </div>
      <h2 className="sticker-title">
        나의 배지 <span>{save.badges.length}/{BADGES.length}</span>
      </h2>
      <ul className="stickers">
        {BADGES.map((b) => {
          const got = save.badges.includes(b.id);
          return (
            <li key={b.id} className={`sticker${got ? ' is-got' : ''}`}>
              <span className="sticker-icon" aria-hidden="true">
                {got ? b.icon : '?'}
              </span>
              <span className="sticker-name">{b.name}</span>
              <span className="sticker-desc">{got ? '받았어요!' : b.desc}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Card({ creature, count, shiny, onOpen }: { creature: Creature; count: number; shiny: number; onOpen: () => void }) {
  const found = count > 0;
  return (
    <button
      type="button"
      className={`card${found ? ' is-found' : ' is-unknown'} group-${creature.group}`}
      onClick={onOpen}
      aria-label={found ? `${creature.name} 자세히 보기` : `아직 못 찾은 생물, ${getHabitat(creature.habitat).name}에서 찾아보세요`}
    >
      <div className="card-art">
        <CreatureArt id={creature.id} hidden={!found} />
        {!found && <span className="question" aria-hidden="true">?</span>}
        {shiny > 0 && <span className="shiny-badge">✨ 반짝 {shiny}번</span>}
      </div>
      {found ? (
        <div className="card-info">
          <div className="card-head">
            <span className="card-name">{creature.name}</span>
            <span className="count-badge">발견 {count}번</span>
          </div>
          <span className="card-place">
            <PlaceTag creature={creature} /> {creature.placeText}
          </span>
          <p className="card-fact">{creature.fact}</p>
        </div>
      ) : (
        <div className="card-info">
          <span className="card-name unknown">???</span>
          <span className="card-place">
            찾을 곳: <PlaceTag creature={creature} />
          </span>
        </div>
      )}
    </button>
  );
}

function Detail({ creature, count, shiny, onClose }: { creature: Creature; count: number; shiny: number; onClose: () => void }) {
  const found = count > 0;
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="detail"
        role="dialog"
        aria-modal="true"
        aria-label={found ? `${creature.name} 자세히 보기` : '아직 못 찾은 생물'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`detail-art${found ? '' : ' is-unknown'}`}>
          <CreatureArt id={creature.id} hidden={!found} />
          {!found && <span className="question" aria-hidden="true">?</span>}
        </div>
        {found ? (
          <div className="detail-info">
            <h3>{creature.name}</h3>
            <p className="tags">
              <span className={`tag tag-${creature.group}`}>{GROUP_NAMES[creature.group]}</span>
              {creature.group === 'other' && <span className="tag">{creature.kindLabel}</span>}
              <span className="tag tag-count">발견 {count}번</span>
              {shiny > 0 && <span className="tag tag-shiny">✨ 반짝 {shiny}번</span>}
            </p>
            <p className="detail-place">
              <PlaceTag creature={creature} /> 게임 속 장소: {creature.placeText}
            </p>
            <p className="detail-fact">{creature.fact}</p>
            {creature.note && <p className="detail-note">📝 {creature.note}</p>}
            {creature.caution && <p className="detail-caution">⚠️ {creature.caution}</p>}
            <p className="detail-small">게임에서는 수집하고, 자연에서는 눈으로 관찰해요!</p>
          </div>
        ) : (
          <div className="detail-info">
            <h3>아직 못 찾았어요</h3>
            <p className="detail-place">
              찾을 곳: <PlaceTag creature={creature} /> {creature.placeText}
            </p>
            <p className="detail-fact">탐험하러 가서 찾아보세요!</p>
          </div>
        )}
        <button ref={closeRef} type="button" className="btn btn-primary detail-close" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
