import type { Tool } from '../data/creatures.ts';
import { missionHabitat, missionText, rankOf, type Mission } from '../game/progress.ts';
import { HabitatIcon, ToolArt } from '../art/SceneArt.tsx';

// 홈과 탐험 화면에서 함께 쓰는 등급 카드와 미션 카드

export function RankCard({ stars }: { stars: number }) {
  const { rank, next } = rankOf(stars);
  const pct = next ? Math.min(100, ((stars - rank.min) / (next.min - rank.min)) * 100) : 100;
  return (
    <div className="rank-card" aria-label={`${rank.name}, 별 ${stars}개`}>
      <span className="rank-icon" aria-hidden="true">
        {rank.icon}
      </span>
      <div className="rank-info">
        <p className="rank-name">{rank.name}</p>
        <p className="rank-stars">
          ⭐ {stars}
          {next && <small> / {next.min}</small>}
        </p>
        <div className="mini-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export function MissionChip({ mission }: { mission: Mission }) {
  const h = missionHabitat(mission);
  let icon;
  if (mission.kind === 'tool') {
    icon = <ToolArt tool={mission.target as Tool} />;
  } else if (h) {
    icon = <HabitatIcon id={h} />;
  } else if (mission.kind === 'group') {
    icon = <span>{mission.target === 'insect' ? '🐞' : '🐸'}</span>;
  } else if (mission.kind === 'perfect') {
    icon = <span>🎖️</span>;
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

export function MissionList({ missions }: { missions: Mission[] }) {
  return (
    <ul className="missions" aria-label="탐험 미션">
      {missions.map((m) => (
        <MissionChip key={m.id} mission={m} />
      ))}
    </ul>
  );
}
