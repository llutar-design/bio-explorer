// 홈 화면의 “오늘의 생태 탐험” 지도 (직접 그린 SVG, viewBox 160×100)
// 장소 핀 위치(%)는 HomeScreen 의 MAP_PINS 와 맞춰 그렸어요.

function Tree({ x, y, s = 1, dark = false }: { x: number; y: number; s?: number; dark?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-0.8} y={1} width={1.6} height={4} rx={0.6} fill="#8a5a36" />
      <circle cx={0} cy={-1} r={4.2} fill={dark ? '#3f9a35' : '#57b244'} />
      <circle cx={-2.6} cy={0.6} r={2.8} fill={dark ? '#4ea83a' : '#6cc24e'} />
      <circle cx={2.6} cy={0.4} r={2.8} fill={dark ? '#46a034' : '#62bb47'} />
      <circle cx={-1} cy={-2.6} r={1.4} fill="#8fd86a" opacity={0.6} />
    </g>
  );
}

function Tuft({ x, y, c = '#4f9a33' }: { x: number; y: number; c?: string }) {
  return <path d={`M${x - 2} ${y} L${x - 2.6} ${y - 4} L${x - 0.8} ${y - 0.6} L${x} ${y - 5} L${x + 0.8} ${y - 0.6} L${x + 2.6} ${y - 4} L${x + 2} ${y} Z`} fill={c} />;
}

function Flower({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <g>
      <circle cx={x - 0.9} cy={y} r={0.9} fill={c} />
      <circle cx={x + 0.9} cy={y} r={0.9} fill={c} />
      <circle cx={x} cy={y - 0.9} r={0.9} fill={c} />
      <circle cx={x} cy={y + 0.9} r={0.9} fill={c} />
      <circle cx={x} cy={y} r={0.6} fill="#ffd35a" />
    </g>
  );
}

export function MapArt() {
  const flowers: Array<[number, number, string]> = [];
  const cols = ['#ff8fb1', '#fff', '#b99bff', '#ffb347', '#ff6b8a'];
  for (let i = 0; i < 34; i++) {
    const x = 8 + ((i * 37) % 52);
    const y = 62 + ((i * 23) % 30);
    flowers.push([x, y, cols[i % cols.length]]);
  }
  const tufts: Array<[number, number]> = [];
  for (let i = 0; i < 26; i++) tufts.push([8 + ((i * 29) % 50), 16 + ((i * 17) % 30)]);
  const trees: Array<[number, number, number, boolean]> = [
    [108, 10, 1.1, true], [118, 6, 1, false], [128, 11, 1.2, true], [139, 6, 1, false], [150, 12, 1.1, true],
    [112, 22, 1, false], [124, 25, 1.25, true], [137, 22, 1, false], [149, 27, 1.1, false], [104, 30, 0.9, true],
    [131, 34, 0.9, false], [156, 36, 0.8, true],
  ];
  return (
    <svg viewBox="0 0 160 100" className="map-art" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <rect width={160} height={100} fill="#a8d978" />
      {/* 풀숲 */}
      <ellipse cx={32} cy={30} rx={30} ry={20} fill="#8cc95a" />
      {tufts.map(([x, y], i) => (
        <Tuft key={i} x={x} y={y} c={i % 3 ? '#4f9a33' : '#5cb845'} />
      ))}
      {/* 꽃밭 */}
      <ellipse cx={34} cy={77} rx={31} ry={19} fill="#c6e98f" />
      {flowers.map(([x, y, c], i) => (
        <Flower key={i} x={x} y={y} c={c} />
      ))}
      <path d="M4 60 L64 60 M4 63 L64 63" stroke="#c99a62" strokeWidth={0.7} />
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={4 + i * 5} y={58} width={1} height={6.5} rx={0.3} fill="#b07a4a" />
      ))}
      {/* 나무숲 */}
      <ellipse cx={130} cy={20} rx={32} ry={20} fill="#7cc04c" />
      {trees.map(([x, y, s, d], i) => (
        <Tree key={i} x={x} y={y} s={s} dark={d} />
      ))}
      {/* 연못 */}
      <ellipse cx={112} cy={74} rx={31} ry={18} fill="#8a7a55" opacity={0.35} />
      <ellipse cx={112} cy={73} rx={29.5} ry={16.5} fill="#5bb5e8" />
      <ellipse cx={109} cy={70} rx={21} ry={10} fill="#7fcaf0" />
      <path d="M96 70 Q102 68 108 70 M112 78 Q118 76 124 78" stroke="#fff" strokeWidth={0.7} fill="none" opacity={0.8} />
      <ellipse cx={95} cy={80} rx={3.4} ry={1.6} fill="#5fb544" />
      <ellipse cx={127} cy={66} rx={3} ry={1.4} fill="#5fb544" />
      <path d="M140 82 L139.5 72 M142 82 L142.6 73 M144 82 L144 75" stroke="#4f9a33" strokeWidth={0.8} />
      <rect x={139} y={71.5} width={1.6} height={4} rx={0.8} fill="#8a5a36" />
      {/* 길과 다리 */}
      <path d="M0 52 C24 50 46 54 66 50 C84 46 88 36 100 34 C112 32 120 40 128 46 C138 54 150 50 160 48" stroke="#f3e2b8" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M66 50 C74 56 80 66 82 74 C84 86 76 94 70 100" stroke="#f3e2b8" strokeWidth={3.6} fill="none" strokeLinecap="round" />
      <g>
        <rect x={77} y={70} width={9} height={7} rx={1} fill="#b98552" />
        <path d="M77 70.5 L86 70.5 M77 76.5 L86 76.5" stroke="#8a5a36" strokeWidth={0.8} />
      </g>
      {/* 학교 */}
      <g transform="translate(70 8)">
        <rect x={0} y={6} width={22} height={13} rx={1} fill="#fff3df" stroke="#d9c7a4" strokeWidth={0.5} />
        <path d="M-1.5 6.5 L11 0 L23.5 6.5 Z" fill="#e8735a" />
        <rect x={9} y={12} width={4} height={7} fill="#c98a5a" />
        {[2, 5.5, 15, 18.5].map((x) => (
          <rect key={x} x={x} y={9} width={2.4} height={2.4} fill="#8fd0f5" />
        ))}
        <path d="M11 0 L11 -5" stroke="#8a5a36" strokeWidth={0.5} />
        <path d="M11 -5 L15 -4 L11 -3 Z" fill="#ff6b6b" />
      </g>
      {/* 작은 생물들 */}
      <g fill="#fff">
        <path d="M58 70 q1.4 -2 2.6 0 q1.2 -2 2.6 0 q-1.3 1.6 -2.6 0.5 q-1.3 1.1 -2.6 -0.5 Z" fill="#ffd35a" />
        <path d="M92 52 l6 -0.6 M95 51.4 l0 2" stroke="#d9573a" strokeWidth={0.6} />
      </g>
    </svg>
  );
}
