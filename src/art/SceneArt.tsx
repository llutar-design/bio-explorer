import type { HabitatId, SpotKind, Tool } from '../data/creatures.ts';

// 탐색 요소, 채집 도구, 장소 배경, 아이콘 그림 (모두 직접 그린 SVG)

const FLOWER_COLORS: Array<[string, string]> = [
  ['#ff8fb1', '#ffd35a'],
  ['#b99bff', '#fff1a8'],
  ['#ffb347', '#fff7d6'],
];

function Flower({ v }: { v: number }) {
  const [petal, center] = FLOWER_COLORS[v % 3];
  const petals = [0, 72, 144, 216, 288];
  return (
    <g>
      <path d="M50 96 L50 50" stroke="#4f9a33" strokeWidth={4} strokeLinecap="round" />
      <path d="M50 80 C38 70 30 72 26 78 C34 84 42 84 50 80 Z" fill="#5fb544" />
      <path d="M50 70 C62 60 70 62 74 68 C66 74 58 74 50 70 Z" fill="#5fb544" />
      {petals.map((a) => (
        <ellipse key={a} cx={50} cy={24} rx={10} ry={14} fill={petal} transform={`rotate(${a} 50 38)`} />
      ))}
      <circle cx={50} cy={38} r={9} fill={center} />
      <circle cx={47} cy={35} r={2.5} fill="#fff" opacity={0.7} />
    </g>
  );
}

function Leaf({ v }: { v: number }) {
  const fill = ['#5fb544', '#4ea83a', '#6cc24e'][v % 3];
  return (
    <g>
      <path d="M50 96 L50 80" stroke="#3f8a2a" strokeWidth={4} strokeLinecap="round" />
      <path d="M50 88 C18 70 20 32 50 8 C80 32 82 70 50 88 Z" fill={fill} stroke="#3f8a2a" strokeWidth={2} />
      <path d="M50 84 L50 16 M50 40 L36 30 M50 54 L34 44 M50 40 L64 30 M50 54 L66 44 M50 68 L38 60 M50 68 L62 60" stroke="#3f8a2a" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Grass({ v }: { v: number }) {
  const c = ['#4fa83a', '#5cb845', '#46a034'][v % 3];
  return (
    <g fill={c} stroke="#357a26" strokeWidth={1.2} strokeLinejoin="round">
      <path d="M20 96 C22 70 18 48 8 30 C26 46 32 70 34 96 Z" />
      <path d="M34 96 C36 60 38 30 48 6 C50 34 48 64 50 96 Z" />
      <path d="M48 96 C52 66 60 40 78 22 C70 48 64 70 64 96 Z" />
      <path d="M62 96 C66 74 76 58 94 48 C84 64 78 80 80 96 Z" />
      <path d="M28 96 C30 78 26 64 18 54 C32 64 38 80 40 96 Z" fill="#6cc24e" />
    </g>
  );
}

function Stone({ v }: { v: number }) {
  const c = ['#a8a39a', '#9c978d', '#b3aea4'][v % 3];
  return (
    <g>
      <ellipse cx={50} cy={86} rx={40} ry={8} fill="#000" opacity={0.12} />
      <path d="M12 82 C10 60 26 40 50 40 C76 40 92 58 88 82 C70 90 30 90 12 82 Z" fill={c} stroke="#7d786f" strokeWidth={2} />
      <path d="M30 56 C36 48 46 46 54 48" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.5} fill="none" />
      <circle cx={66} cy={66} r={3} fill="#8c877e" />
      <circle cx={38} cy={72} r={2} fill="#8c877e" />
    </g>
  );
}

function WetLeaf() {
  return (
    <g>
      <path d="M8 80 C20 50 60 42 92 60 C70 86 32 94 8 80 Z" fill="#3f9a4a" stroke="#2c6e34" strokeWidth={2} />
      <path d="M10 79 C40 70 66 64 90 60" stroke="#2c6e34" strokeWidth={1.6} fill="none" />
      <path d="M40 38 C34 48 34 54 40 56 C46 54 46 48 40 38 Z" fill="#9fdcff" stroke="#5aa7d6" strokeWidth={1.2} />
      <path d="M66 42 C62 49 62 53 66 55 C70 53 70 49 66 42 Z" fill="#9fdcff" stroke="#5aa7d6" strokeWidth={1.2} />
      <circle cx={52} cy={70} r={3} fill="#c8ecff" />
      <circle cx={28} cy={78} r={2.4} fill="#c8ecff" />
    </g>
  );
}

function Soil() {
  return (
    <g>
      <path d="M6 88 C14 62 34 52 50 52 C68 52 86 62 94 88 Z" fill="#8a5a3b" stroke="#6b4228" strokeWidth={2} />
      <circle cx={34} cy={74} r={3} fill="#6b4228" />
      <circle cx={60} cy={68} r={2.5} fill="#6b4228" />
      <circle cx={70} cy={80} r={3.5} fill="#a77a55" />
      <circle cx={46} cy={82} r={2} fill="#a77a55" />
      <path d="M50 52 C48 40 42 34 36 32 M50 50 C54 40 60 36 66 34" stroke="#5fb544" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
}

function TrunkKnot() {
  return (
    <g>
      <ellipse cx={50} cy={52} rx={30} ry={38} fill="#7a4d2c" stroke="#5a3519" strokeWidth={3} />
      <ellipse cx={50} cy={54} rx={16} ry={22} fill="#5a3519" />
      <ellipse cx={50} cy={56} rx={8} ry={12} fill="#3d220f" />
      <path d="M26 30 C30 44 28 64 30 80 M74 28 C70 42 72 62 70 82" stroke="#5a3519" strokeWidth={2} fill="none" />
    </g>
  );
}

function Branch({ v }: { v: number }) {
  return (
    <g transform={v % 2 ? 'matrix(-1 0 0 1 100 0)' : undefined}>
      <path d="M4 58 C30 54 60 50 96 40" stroke="#7a4d2c" strokeWidth={9} strokeLinecap="round" fill="none" />
      <path d="M50 51 C58 40 64 34 74 30" stroke="#7a4d2c" strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d="M74 30 C80 18 92 16 96 20 C92 30 82 34 74 30 Z" fill="#5fb544" />
      <path d="M30 55 C26 42 30 34 36 30 C40 40 38 50 30 55 Z" fill="#6cc24e" />
      <path d="M86 43 C92 52 92 60 88 66 C82 58 82 50 86 43 Z" fill="#4ea83a" />
    </g>
  );
}

function Ground() {
  return (
    <g>
      <ellipse cx={50} cy={74} rx={44} ry={18} fill="#9b6b45" stroke="#7a5030" strokeWidth={2} />
      <path d="M30 74 C36 58 48 54 56 56 C64 58 70 66 72 74 Z" fill="#b07d52" />
      <ellipse cx={51} cy={62} rx={4} ry={2.5} fill="#3d220f" />
      <circle cx={24} cy={80} r={2.5} fill="#7a5030" />
      <circle cx={78} cy={82} r={2} fill="#7a5030" />
      <circle cx={66} cy={84} r={1.5} fill="#7a5030" />
    </g>
  );
}

function FallenLeaves() {
  const leaves: Array<[number, number, number, string]> = [
    [30, 70, -30, '#e8893a'],
    [62, 72, 25, '#c9642c'],
    [46, 60, 5, '#f2b33d'],
    [72, 58, 60, '#d9772f'],
    [26, 52, -70, '#b8863d'],
  ];
  return (
    <g>
      <ellipse cx={50} cy={84} rx={42} ry={9} fill="#000" opacity={0.1} />
      {leaves.map(([x, y, r, c]) => (
        <g key={`${x}-${y}`} transform={`rotate(${r} ${x} ${y})`}>
          <path d={`M${x} ${y - 20} C${x + 14} ${y - 8} ${x + 12} ${y + 10} ${x} ${y + 18} C${x - 12} ${y + 10} ${x - 14} ${y - 8} ${x} ${y - 20} Z`} fill={c} stroke="#8a4f22" strokeWidth={1.4} />
          <path d={`M${x} ${y - 18} L${x} ${y + 16}`} stroke="#8a4f22" strokeWidth={1.2} />
        </g>
      ))}
    </g>
  );
}

function Reed() {
  return (
    <g strokeLinecap="round">
      <path d="M30 98 C32 70 30 40 24 14" stroke="#4f9a33" strokeWidth={4} fill="none" />
      <path d="M50 98 C50 64 52 34 56 8" stroke="#4f9a33" strokeWidth={4} fill="none" />
      <path d="M68 98 C66 76 70 56 80 38" stroke="#4f9a33" strokeWidth={4} fill="none" />
      <rect x={51} y={16} width={10} height={26} rx={5} fill="#8a5a36" transform="rotate(6 56 29)" />
      <rect x={20} y={24} width={9} height={22} rx={4.5} fill="#7a4d2c" transform="rotate(-10 24 35)" />
      <path d="M40 98 C38 80 30 66 16 58 C28 70 34 82 34 98 Z" fill="#6cc24e" />
      <path d="M62 98 C66 82 76 72 90 66 C80 76 72 86 72 98 Z" fill="#5fb544" />
    </g>
  );
}

function ShoreLeaf() {
  return (
    <g>
      <path d="M50 96 L50 60 M50 96 L30 58" stroke="#3f8a2a" strokeWidth={3} strokeLinecap="round" />
      <path d="M50 64 C20 64 14 32 36 22 C44 18 50 24 50 30 C50 24 58 18 66 22 C88 32 82 64 50 64 Z" fill="#5fb544" stroke="#3f8a2a" strokeWidth={2} />
      <path d="M50 62 L50 30 M50 46 L34 36 M50 46 L66 36" stroke="#3f8a2a" strokeWidth={1.5} fill="none" />
      <ellipse cx={24} cy={72} rx={16} ry={10} fill="#6cc24e" stroke="#3f8a2a" strokeWidth={1.5} transform="rotate(-20 24 72)" />
    </g>
  );
}

function WaterRipple() {
  return (
    <g fill="none" stroke="#fff" strokeLinecap="round">
      <ellipse cx={50} cy={60} rx={36} ry={14} strokeWidth={3} opacity={0.75} />
      <ellipse cx={50} cy={60} rx={22} ry={8} strokeWidth={3} opacity={0.85} />
      <ellipse cx={50} cy={60} rx={9} ry={3.5} strokeWidth={2.5} />
      <circle cx={40} cy={38} r={4} strokeWidth={2} />
      <circle cx={58} cy={28} r={3} strokeWidth={2} />
      <circle cx={48} cy={18} r={2} strokeWidth={2} />
    </g>
  );
}

export function SpotArt({ kind, variant }: { kind: SpotKind; variant: number }) {
  let content;
  switch (kind) {
    case 'flower': content = <Flower v={variant} />; break;
    case 'leaf': content = <Leaf v={variant} />; break;
    case 'grass': content = <Grass v={variant} />; break;
    case 'stone': content = <Stone v={variant} />; break;
    case 'wetLeaf': content = <WetLeaf />; break;
    case 'soil': content = <Soil />; break;
    case 'trunk': content = <TrunkKnot />; break;
    case 'branch': content = <Branch v={variant} />; break;
    case 'ground': content = <Ground />; break;
    case 'fallenLeaves': content = <FallenLeaves />; break;
    case 'reed': content = <Reed />; break;
    case 'shoreLeaf': content = <ShoreLeaf />; break;
    case 'water': content = <WaterRipple />; break;
  }
  return (
    <svg viewBox="0 0 100 100" className="spot-art" aria-hidden="true" focusable="false">
      {content}
    </svg>
  );
}

export function ToolArt({ tool }: { tool: Tool }) {
  if (tool === 'binoculars') {
    // 쌍안경: 새는 멀리서 관찰해요
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <path d="M40 70 Q60 60 80 70" stroke="#5a4636" strokeWidth={6} fill="none" strokeLinecap="round" />
        <rect x={20} y={36} width={34} height={46} rx={10} fill="#4b6584" />
        <rect x={66} y={36} width={34} height={46} rx={10} fill="#4b6584" />
        <rect x={50} y={44} width={20} height={20} rx={5} fill="#3c5270" />
        <circle cx={37} cy={86} r={17} fill="#dff4ff" stroke="#2f405a" strokeWidth={6} />
        <circle cx={83} cy={86} r={17} fill="#dff4ff" stroke="#2f405a" strokeWidth={6} />
        <path d="M28 80 Q32 74 39 73 M74 80 Q78 74 85 73" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" />
        <rect x={26} y={28} width={22} height={10} rx={4} fill="#2f405a" />
        <rect x={72} y={28} width={22} height={10} rx={4} fill="#2f405a" />
      </svg>
    );
  }
  if (tool === 'net') {
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <path d="M66 66 L114 114" stroke="#b07a3c" strokeWidth={7} strokeLinecap="round" />
        <path d="M22 22 C10 44 22 70 48 76 C58 62 64 40 62 24 C50 16 32 14 22 22 Z" fill="#fff" fillOpacity={0.55} stroke="#9fb4bf" strokeWidth={1.5} />
        <path d="M24 34 L56 30 M22 46 L60 42 M26 58 L56 56 M34 20 L32 70 M46 18 L44 74" stroke="#9fb4bf" strokeWidth={1} />
        <ellipse cx={44} cy={44} rx={30} ry={26} transform="rotate(45 44 44)" fill="none" stroke="#f06548" strokeWidth={5} />
      </svg>
    );
  }
  if (tool === 'scoop') {
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <path d="M64 70 L112 110" stroke="#3a8fd6" strokeWidth={7} strokeLinecap="round" />
        <path d="M14 46 L70 46 C70 72 56 84 42 84 C28 84 14 72 14 46 Z" fill="#fff" fillOpacity={0.6} stroke="#2f7fc4" strokeWidth={5} strokeLinejoin="round" />
        <path d="M22 56 L64 56 M26 66 L60 66 M32 76 L52 76 M28 48 L28 80 M42 48 L42 84 M56 48 L56 80" stroke="#9fc3e0" strokeWidth={1.2} />
        <path d="M30 94 C28 99 28 101 30 103 C32 101 32 99 30 94 Z M48 98 C46 103 46 105 48 107 C50 105 50 103 48 98 Z" fill="#7cc8f5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path d="M72 72 L108 108" stroke="#8a5a3b" strokeWidth={11} strokeLinecap="round" />
      <circle cx={48} cy={48} r={32} fill="#dff4ff" fillOpacity={0.35} stroke="#f2b233" strokeWidth={8} />
      <path d="M30 38 C34 28 42 22 52 21" stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.85} />
    </svg>
  );
}

export function HabitatIcon({ id }: { id: HabitatId }) {
  let content;
  if (id === 'flower') {
    content = (
      <g>
        <path d="M24 44 L24 26" stroke="#4f9a33" strokeWidth={3.5} strokeLinecap="round" />
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx={24} cy={10} rx={6} ry={8} fill="#ff8fb1" transform={`rotate(${a} 24 19)`} />
        ))}
        <circle cx={24} cy={19} r={5} fill="#ffd35a" />
      </g>
    );
  } else if (id === 'grass') {
    content = (
      <g fill="#5cb845" stroke="#357a26" strokeWidth={1}>
        <path d="M8 44 C10 32 8 22 3 14 C12 22 15 32 16 44 Z" />
        <path d="M16 44 C18 28 20 14 25 3 C26 16 25 30 26 44 Z" />
        <path d="M25 44 C28 30 33 20 44 12 C38 24 35 34 35 44 Z" />
      </g>
    );
  } else if (id === 'tree') {
    content = (
      <g>
        <rect x={20} y={26} width={8} height={18} rx={2} fill="#8a5a36" />
        <circle cx={24} cy={18} r={14} fill="#4ea83a" />
        <circle cx={14} cy={24} r={8} fill="#5fb544" />
        <circle cx={34} cy={24} r={8} fill="#5fb544" />
      </g>
    );
  } else {
    content = (
      <g>
        <ellipse cx={24} cy={30} rx={21} ry={12} fill="#5bb5e8" />
        <path d="M12 30 C18 27 24 27 30 30 M18 36 C22 34 28 34 32 36" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
        <ellipse cx={34} cy={24} rx={7} ry={3.5} fill="#5fb544" />
        <path d="M8 26 L6 6 M12 26 L13 10" stroke="#4f9a33" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="habitat-icon" aria-hidden="true" focusable="false">
      {content}
    </svg>
  );
}

export function Logo() {
  return (
    <svg viewBox="0 0 64 64" className="logo" aria-hidden="true" focusable="false">
      <circle cx={32} cy={32} r={30} fill="#ffe8a3" />
      <path d="M18 40 C14 26 24 14 38 14 C40 28 32 40 18 40 Z" fill="#5fb544" stroke="#3f8a2a" strokeWidth={2} />
      <path d="M18 40 C24 32 30 24 36 18" stroke="#3f8a2a" strokeWidth={2} fill="none" />
      <circle cx={38} cy={38} r={11} fill="#dff4ff" fillOpacity={0.6} stroke="#f2a522" strokeWidth={4} />
      <path d="M46 46 L54 54" stroke="#8a5a3b" strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
}

/** 길잡이 캐릭터 ‘탐탐이’ — 새싹 탐험가 (직접 그린 독창 캐릭터) */
export function Mascot({ mood }: { mood: 'idle' | 'wow' | 'happy' }) {
  return (
    <svg viewBox="0 0 80 80" className="mascot-art" aria-hidden="true" focusable="false">
      <ellipse cx={40} cy={76} rx={22} ry={3.5} fill="#000" opacity={0.12} />
      <path d="M40 22 C38 14 32 8 22 8 C24 18 30 22 40 22 Z" fill="#6cc24e" stroke="#3f8a2a" strokeWidth={1.5} />
      <path d="M40 22 C42 12 50 6 60 8 C58 18 50 22 40 22 Z" fill="#5fb544" stroke="#3f8a2a" strokeWidth={1.5} />
      <path d="M40 24 L40 18" stroke="#3f8a2a" strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={40} cy={49} rx={26} ry={26} fill="#9ddc72" stroke="#5aa845" strokeWidth={2} />
      <ellipse cx={40} cy={58} rx={15} ry={12} fill="#d8f3bf" />
      <path d="M17 50 C12 52 10 56 12 60" stroke="#5aa845" strokeWidth={4} strokeLinecap="round" fill="none" />
      <path d="M63 50 C68 46 70 42 70 38" stroke="#5aa845" strokeWidth={4} strokeLinecap="round" fill="none" />
      <circle cx={71} cy={34} r={6} fill="#dff4ff" fillOpacity={0.6} stroke="#f2a522" strokeWidth={2.5} />
      <circle cx={31} cy={44} r={mood === 'wow' ? 6 : 5} fill="#fff" stroke="#2b2b2b" strokeWidth={0.8} />
      <circle cx={49} cy={44} r={mood === 'wow' ? 6 : 5} fill="#fff" stroke="#2b2b2b" strokeWidth={0.8} />
      <circle cx={32} cy={45} r={3.2} fill="#1f1f1f" />
      <circle cx={50} cy={45} r={3.2} fill="#1f1f1f" />
      <circle cx={33} cy={43.5} r={1.1} fill="#fff" />
      <circle cx={51} cy={43.5} r={1.1} fill="#fff" />
      <ellipse cx={24} cy={52} rx={4} ry={2.4} fill="#ff8f8f" opacity={0.6} />
      <ellipse cx={56} cy={52} rx={4} ry={2.4} fill="#ff8f8f" opacity={0.6} />
      {mood === 'idle' && <path d="M35 53 Q40 57 45 53" stroke="#3a5a2a" strokeWidth={2} fill="none" strokeLinecap="round" />}
      {mood === 'wow' && <ellipse cx={40} cy={55} rx={3.5} ry={4} fill="#7a3a2a" />}
      {mood === 'happy' && <path d="M34 52 Q40 61 46 52 Z" fill="#7a3a2a" />}
    </svg>
  );
}

export function BookIcon() {
  return (
    <svg viewBox="0 0 32 32" className="btn-icon" aria-hidden="true" focusable="false">
      <path d="M4 7 C9 5 13 6 16 8 C19 6 23 5 28 7 L28 26 C23 24 19 25 16 27 C13 25 9 24 4 26 Z" fill="#fff" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
      <path d="M16 8 L16 27" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}

/** 장소 배경: 하늘·땅·나무·연못 같은 큰 모양 (탐색 요소는 따로 배치) */
export function SceneDecor({ habitat }: { habitat: HabitatId }) {
  return (
    <div className="scene-decor" aria-hidden="true">
      <div className="sun" />
      <svg className="cloud cloud-a" viewBox="0 0 100 50"><path d="M20 42 C6 42 6 24 20 24 C22 10 42 8 48 20 C56 8 76 12 76 26 C92 24 94 42 80 42 Z" fill="#fff" /></svg>
      <svg className="cloud cloud-b" viewBox="0 0 100 50"><path d="M20 42 C6 42 6 24 20 24 C22 10 42 8 48 20 C56 8 76 12 76 26 C92 24 94 42 80 42 Z" fill="#fff" /></svg>
      <svg className="scene-shape" viewBox="0 0 100 100" preserveAspectRatio="none">
        {habitat === 'flower' && (
          <g>
            <path d="M0 36 C20 28 40 30 60 34 C76 36 90 30 100 32 L100 100 L0 100 Z" fill="#b6e27f" />
            <path d="M0 46 C30 40 70 44 100 42 L100 100 L0 100 Z" fill="#a3d86a" />
            {[[8, 44], [22, 48], [36, 43], [52, 47], [70, 45], [86, 48], [94, 44]].map(([x, y]) => (
              <ellipse key={`${x}`} cx={x} cy={y} rx={1.2} ry={0.9} fill={x % 3 ? '#ffb3c8' : '#fff4a8'} />
            ))}
          </g>
        )}
        {habitat === 'grass' && (
          <g>
            <path d="M0 34 C24 30 50 36 76 32 C88 30 96 32 100 33 L100 100 L0 100 Z" fill="#8cc95a" />
            <path d="M0 44 C30 40 64 46 100 42 L100 100 L0 100 Z" fill="#78bd48" />
            <path d="M0 40 L3 30 L5 40 L8 28 L10 40 L13 32 L15 40 Z M85 40 L88 29 L90 40 L93 31 L95 40 L98 28 L100 40 Z" fill="#5da83a" />
          </g>
        )}
        {habitat === 'tree' && (
          <g>
            <path d="M0 50 C30 46 70 48 100 50 L100 100 L0 100 Z" fill="#9ccf6a" />
            <path d="M0 80 C30 76 70 78 100 80 L100 100 L0 100 Z" fill="#b98f5e" opacity={0.45} />
            <path d="M42 96 C44 80 44 40 45 20 L55 20 C56 40 56 80 58 96 C54 94 46 94 42 96 Z" fill="#8a5a36" />
            <path d="M42 96 C38 97 34 98 32 99 L44 97 Z M58 96 C62 97 66 98 68 99 L56 97 Z" fill="#7a4d2c" />
            <path d="M47 30 C47 50 46 70 47 90 M53 26 C53 46 54 66 53 88" stroke="#6b4228" strokeWidth={0.5} fill="none" />
            <ellipse cx={50} cy={14} rx={40} ry={16} fill="#4ea83a" />
            <ellipse cx={24} cy={22} rx={20} ry={11} fill="#5fb544" />
            <ellipse cx={76} cy={21} rx={20} ry={11} fill="#5fb544" />
            <ellipse cx={50} cy={24} rx={22} ry={8} fill="#46a034" />
            <ellipse cx={38} cy={8} rx={10} ry={4} fill="#6cc24e" opacity={0.7} />
          </g>
        )}
        {habitat === 'pond' && (
          <g>
            <path d="M0 34 C30 30 70 34 100 32 L100 100 L0 100 Z" fill="#9ccf6a" />
            <ellipse cx={50} cy={75} rx={40} ry={23} fill="#8a7a55" opacity={0.5} />
            <ellipse cx={50} cy={75} rx={38} ry={21.5} fill="#5bb5e8" />
            <ellipse cx={50} cy={72} rx={30} ry={14} fill="#79c6ef" />
            <ellipse cx={24} cy={86} rx={5} ry={2} fill="#5fb544" />
            <ellipse cx={78} cy={66} rx={4.5} ry={1.8} fill="#5fb544" />
          </g>
        )}
      </svg>
    </div>
  );
}
