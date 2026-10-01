import { CREATURES, getCreature } from '../data/creatures.ts';
import { CARD_GRADES, type Card } from '../game/cards.ts';
import { CreatureArt } from '../art/CreatureArt.tsx';
import { HabitatIcon, Logo } from '../art/SceneArt.tsx';

/**
 * 생물 카드 한 장.
 * size: sm(결과 안내 속 작은 카드) · md(카드첩) · lg(크게 보기)
 * reveal: 뒷면에서 앞면으로 뒤집히며 나타나기
 */
export function GameCard({
  card,
  size = 'md',
  reveal = false,
}: {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  reveal?: boolean;
}) {
  const creature = getCreature(card.c);
  const grade = CARD_GRADES[card.g];
  if (!creature || !grade) return null;
  const mod = grade.modifiers[card.m] ?? grade.modifiers[0];
  const no = String(CREATURES.indexOf(creature) + 1).padStart(2, '0');
  return (
    <div
      className={`gcard gcard--g${card.g} gcard--${size}${reveal ? ' is-reveal' : ''}`}
      role="img"
      aria-label={`${grade.name} 카드, ${mod} ${creature.name}`}
    >
      <div className="gcard-inner">
        <div className="gcard-back" aria-hidden="true">
          <Logo />
        </div>
        <div className="gcard-front" aria-hidden="true">
          <div className="gcard-top">
            <span className="gcard-grade">{grade.name}</span>
            <span className="gcard-stars">{'★'.repeat(grade.stars)}</span>
          </div>
          <div className="gcard-art">
            <CreatureArt id={creature.id} />
          </div>
          <div className="gcard-name">
            <small>{mod}</small>
            <b>{creature.name}</b>
          </div>
          {size !== 'sm' && (
            <div className="gcard-foot">
              <HabitatIcon id={creature.habitat} />
              <span>No.{no}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
