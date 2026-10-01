import { useId, type ComponentType, type ReactNode, type SVGProps } from 'react';

// 모든 생물 그림은 외부 이미지 없이 직접 그린 SVG 입니다. (viewBox 0 0 120 120)
// 곤충은 모두 다리 6개·더듬이 2개로, 공벌레는 다리 14개로 그렸습니다.

const S = (p: SVGProps<SVGPathElement>) => (
  <path fill="none" strokeLinecap="round" strokeLinejoin="round" {...p} />
);

function Eye({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" stroke="#2b2b2b" strokeWidth={0.8} />
      <circle cx={x + r * 0.12} cy={y + r * 0.12} r={r * 0.62} fill="#1f1f1f" />
      <circle cx={x + r * 0.3} cy={y - r * 0.22} r={r * 0.24} fill="#fff" />
    </g>
  );
}

function Blush({ x, y, r = 3 }: { x: number; y: number; r?: number }) {
  return <ellipse cx={x} cy={y} rx={r} ry={r * 0.6} fill="#ff8f8f" opacity={0.55} />;
}

/** 왼쪽 절반을 그리면 오른쪽에 거울처럼 한 번 더 그립니다. */
function Mirror({ children }: { children: ReactNode }) {
  return (
    <>
      <g>{children}</g>
      <g transform="matrix(-1 0 0 1 120 0)">{children}</g>
    </>
  );
}

function useSafeId() {
  return 'c' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
}

function Ant() {
  const leg = '#4a2c1d';
  return (
    <g>
      <Mirror>
        <S d="M55 44 L42 36 L34 25" stroke={leg} strokeWidth={3} />
        <S d="M54 50 L38 52 L27 60" stroke={leg} strokeWidth={3} />
        <S d="M55 55 L44 68 L38 84" stroke={leg} strokeWidth={3} />
        <S d="M55 22 L49 12 L41 13" stroke={leg} strokeWidth={2.5} />
      </Mirror>
      <ellipse cx={60} cy={80} rx={15} ry={18} fill="#6b3f2a" />
      <ellipse cx={55} cy={74} rx={5} ry={7} fill="#8e5a3e" opacity={0.7} />
      <circle cx={60} cy={61} r={3.5} fill="#5c3523" />
      <ellipse cx={60} cy={49} rx={7} ry={10} fill="#6b3f2a" />
      <ellipse cx={60} cy={30} rx={12} ry={11} fill="#7a4a32" />
      <Eye x={55} y={29} r={3.6} />
      <Eye x={65} y={29} r={3.6} />
      <S d="M56 37 Q60 40 64 37" stroke="#3a2015" strokeWidth={1.8} />
    </g>
  );
}

function Ladybug() {
  return (
    <g>
      <Mirror>
        <S d="M44 52 L31 46" stroke="#222" strokeWidth={3} />
        <S d="M41 64 L27 66" stroke="#222" strokeWidth={3} />
        <S d="M44 78 L32 88" stroke="#222" strokeWidth={3} />
        <S d="M55 25 L49 16" stroke="#222" strokeWidth={2} />
        <circle cx={49} cy={16} r={2} fill="#222" />
      </Mirror>
      <circle cx={60} cy={68} r={28} fill="#e8392b" />
      <S d="M60 44 L60 96" stroke="#7a1a12" strokeWidth={2} />
      <circle cx={60} cy={48} r={5.5} fill="#222" />
      <circle cx={46} cy={60} r={5.5} fill="#222" />
      <circle cx={74} cy={60} r={5.5} fill="#222" />
      <circle cx={43} cy={78} r={4.5} fill="#222" />
      <circle cx={77} cy={78} r={4.5} fill="#222" />
      <circle cx={52} cy={89} r={4} fill="#222" />
      <circle cx={68} cy={89} r={4} fill="#222" />
      <ellipse cx={47} cy={52} rx={5} ry={3} fill="#fff" opacity={0.45} />
      <path d="M40 44 Q60 32 80 44 Q60 50 40 44 Z" fill="#222" />
      <ellipse cx={48} cy={42} rx={3.5} ry={2.4} fill="#fff" />
      <ellipse cx={72} cy={42} rx={3.5} ry={2.4} fill="#fff" />
      <ellipse cx={60} cy={32} rx={12} ry={9} fill="#2a2a2a" />
      <Eye x={55} y={31} r={3.4} />
      <Eye x={65} y={31} r={3.4} />
    </g>
  );
}

function CabbageWhite() {
  return (
    <g>
      <Mirror>
        <path d="M58 50 C40 24 12 26 15 46 C17 60 40 63 58 60 Z" fill="#fbfbf2" stroke="#b9b9a8" strokeWidth={1.5} />
        <path d="M15 46 C15 36 21 30 31 29 C26 35 21 41 15 46 Z" fill="#4d4d4d" />
        <circle cx={34} cy={47} r={4.5} fill="#444" />
        <path d="M58 62 C40 60 24 70 30 87 C36 97 52 89 58 72 Z" fill="#fffbe4" stroke="#b9b9a8" strokeWidth={1.5} />
        <circle cx={41} cy={66} r={2.4} fill="#555" />
        <S d="M57 36 Q51 24 47 17" stroke="#444" strokeWidth={1.8} />
        <circle cx={47} cy={17} r={2.6} fill="#444" />
        <S d="M57 50 L49 51 M57 55 L49 58 M58 60 L51 65" stroke="#3a3a3a" strokeWidth={1.8} />
      </Mirror>
      <ellipse cx={60} cy={64} rx={4.5} ry={22} fill="#4b4b4b" />
      <circle cx={60} cy={40} r={6.5} fill="#555" />
      <Eye x={57.3} y={39.5} r={2.6} />
      <Eye x={62.7} y={39.5} r={2.6} />
    </g>
  );
}

function Swallowtail() {
  const id = useSafeId();
  const fw = 'M58 50 C44 22 12 14 7 28 C4 42 34 58 58 60 Z';
  const hw = 'M58 62 C42 60 24 66 25 82 C26 92 36 96 43 94 L41 108 L48 95 C55 90 58 80 58 72 Z';
  return (
    <g>
      <defs>
        <clipPath id={`${id}f`}>
          <path d={fw} />
        </clipPath>
        <clipPath id={`${id}h`}>
          <path d={hw} />
        </clipPath>
      </defs>
      <Mirror>
        <path d={fw} fill="#ffd84d" />
        <g clipPath={`url(#${id}f)`} stroke="#262626" fill="none" strokeLinecap="round">
          <path d="M7 28 C4 42 34 58 58 60" strokeWidth={10} />
          <path d="M18 16 L26 44" strokeWidth={4} />
          <path d="M30 14 L36 50" strokeWidth={4} />
          <path d="M42 18 L46 54" strokeWidth={3.5} />
          <path d="M52 34 L54 58" strokeWidth={3} />
        </g>
        <path d={fw} fill="none" stroke="#262626" strokeWidth={1.5} />
        <path d={hw} fill="#ffd84d" />
        <g clipPath={`url(#${id}h)`} stroke="#262626" fill="none">
          <path d="M25 82 C26 92 36 96 43 94 L41 108 L48 95 C55 90 58 80 58 72" strokeWidth={11} />
          <path d="M58 62 C46 64 40 70 44 80" strokeWidth={3} />
        </g>
        <circle cx={30} cy={88} r={2.6} fill="#5b8def" />
        <circle cx={37} cy={92} r={2.4} fill="#5b8def" />
        <circle cx={51} cy={89} r={3.2} fill="#f47b2a" />
        <path d={hw} fill="none" stroke="#262626" strokeWidth={1.5} />
        <S d="M57 36 Q52 22 46 15" stroke="#262626" strokeWidth={1.8} />
        <circle cx={46} cy={15} r={2.6} fill="#262626" />
        <S d="M57 50 L49 51 M57 55 L49 58 M58 60 L51 65" stroke="#262626" strokeWidth={1.8} />
      </Mirror>
      <ellipse cx={60} cy={65} rx={5} ry={24} fill="#2b2b2b" />
      <S d="M57.5 50 L57.5 84 M62.5 50 L62.5 84" stroke="#ffd84d" strokeWidth={1.2} />
      <circle cx={60} cy={40} r={7} fill="#2f2f2f" />
      <Eye x={57} y={39.5} r={2.8} />
      <Eye x={63} y={39.5} r={2.8} />
    </g>
  );
}

function Honeybee() {
  const id = useSafeId();
  const leg = '#3a2a1a';
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={60} cy={77} rx={15} ry={20} />
        </clipPath>
      </defs>
      <Mirror>
        <S d="M53 46 L42 41 L36 34" stroke={leg} strokeWidth={2.6} />
        <S d="M52 52 L40 57 L33 60" stroke={leg} strokeWidth={2.6} />
        <S d="M54 58 L44 70 L41 84" stroke={leg} strokeWidth={2.6} />
        <ellipse cx={42.5} cy={76} rx={3.6} ry={5} fill="#ffb300" />
        <S d="M56 22 L51 14 L45 13" stroke={leg} strokeWidth={2} />
      </Mirror>
      <ellipse cx={60} cy={77} rx={15} ry={20} fill="#f7bd33" />
      <g clipPath={`url(#${id})`} fill="#5a3a1c">
        <rect x={40} y={68} width={40} height={5} />
        <rect x={40} y={78} width={40} height={5} />
        <rect x={40} y={88} width={40} height={5} />
      </g>
      <path d="M57.5 96 L60 102 L62.5 96 Z" fill="#5a3a1c" />
      <circle cx={60} cy={48} r={11} fill="#c98b3c" />
      <circle cx={60} cy={48} r={9} fill="none" stroke="#e3ad62" strokeWidth={2} strokeDasharray="2 2.5" />
      <Mirror>
        <ellipse cx={37} cy={42} rx={18} ry={8} transform="rotate(-20 37 42)" fill="#e9f7ff" fillOpacity={0.85} stroke="#9fc3d6" strokeWidth={1.2} />
        <ellipse cx={41} cy={56} rx={12} ry={5.5} transform="rotate(8 41 56)" fill="#e9f7ff" fillOpacity={0.85} stroke="#9fc3d6" strokeWidth={1.2} />
      </Mirror>
      <circle cx={60} cy={30} r={10} fill="#4a3522" />
      <Eye x={55.5} y={29} r={3.6} />
      <Eye x={64.5} y={29} r={3.6} />
      <S d="M57 35 Q60 37.5 63 35" stroke="#f0d2a0" strokeWidth={1.5} />
    </g>
  );
}

function Grasshopper() {
  const far = '#9ccf73';
  const near = '#3f8a2a';
  return (
    <g>
      <S d="M80 62 L82 74 L88 78" stroke={far} strokeWidth={3} />
      <S d="M70 63 L68 76 L73 80" stroke={far} strokeWidth={3} />
      <S d="M58 58 L41 42 L35 76 L41 78" stroke={far} strokeWidth={3.5} />
      <ellipse cx={48} cy={62} rx={27} ry={9} fill="#6dbb43" />
      <S d="M30 56 L30 68 M38 55 L38 69 M46 54 L46 70" stroke="#58a035" strokeWidth={1.2} />
      <ellipse cx={72} cy={58} rx={11} ry={11} fill="#62b03c" />
      <path d="M76 50 L26 54 Q20 57 26 60 L70 58 Z" fill="#4f9a33" />
      <ellipse cx={87} cy={54} rx={11} ry={12} fill="#7ccf4c" />
      <S d="M88 43 Q93 31 101 25" stroke="#4f9a33" strokeWidth={2} />
      <S d="M85 43 Q86 32 92 23" stroke="#4f9a33" strokeWidth={2} />
      <Eye x={91} y={50} r={4.5} />
      <S d="M91 60 Q94 62 97 60" stroke="#3a7a26" strokeWidth={1.5} />
      <Blush x={86} y={59} r={2.6} />
      <S d="M82 64 L86 75 L93 78" stroke={near} strokeWidth={3} />
      <S d="M72 66 L72 78 L79 81" stroke={near} strokeWidth={3} />
      <ellipse cx={51} cy={53.5} rx={17} ry={6.5} transform="rotate(32 51 53.5)" fill="#5cae3a" stroke={near} strokeWidth={1.5} />
      <S d="M37 45 L31 80 L39 82" stroke={near} strokeWidth={3} />
    </g>
  );
}

function Cricket() {
  const far = '#6a4a30';
  const near = '#2c1c10';
  return (
    <g>
      <S d="M80 66 L82 78 L88 80" stroke={far} strokeWidth={3} />
      <S d="M70 67 L68 80 L73 83" stroke={far} strokeWidth={3} />
      <S d="M56 62 L40 50 L34 80 L42 82" stroke={far} strokeWidth={3.5} />
      <S d="M25 62 L8 54 M25 65 L8 73" stroke="#3b2717" strokeWidth={2.5} />
      <ellipse cx={46} cy={64} rx={24} ry={12} fill="#3b2717" />
      <path d="M74 54 L24 58 Q19 63 26 66 L72 64 Z" fill="#5a3c22" />
      <S d="M66 56 L32 60 M60 61 L30 63" stroke="#7a5636" strokeWidth={1.2} />
      <ellipse cx={72} cy={62} rx={10} ry={11} fill="#33210f" />
      <circle cx={86} cy={58} r={13} fill="#3f2a18" />
      <S d="M92 47 C104 22 114 16 118 36" stroke="#5a3c22" strokeWidth={1.8} />
      <S d="M87 46 C80 12 52 6 30 22" stroke="#5a3c22" strokeWidth={1.8} />
      <Eye x={90} y={54} r={4.5} />
      <S d="M90 64 Q93 66 96 64" stroke="#c9a27a" strokeWidth={1.5} />
      <S d="M84 69 L88 79 L95 81" stroke={near} strokeWidth={3} />
      <S d="M74 71 L74 82 L81 84" stroke={near} strokeWidth={3} />
      <ellipse cx={50} cy={58} rx={16} ry={7} transform="rotate(30 50 58)" fill="#4a3220" stroke={near} strokeWidth={1.5} />
      <S d="M37 50 L31 82 L40 84" stroke={near} strokeWidth={3} />
      <S d="M35 60 L32 59 M34 67 L31 66 M33 74 L30 73" stroke={near} strokeWidth={1.2} />
    </g>
  );
}

function Cicada() {
  const leg = '#3b3526';
  return (
    <g>
      <Mirror>
        <S d="M50 48 L40 44 L36 40" stroke={leg} strokeWidth={3} />
        <S d="M50 55 L38 59 L35 64" stroke={leg} strokeWidth={3} />
        <S d="M52 62 L42 70 L40 76" stroke={leg} strokeWidth={3} />
      </Mirror>
      <ellipse cx={60} cy={70} rx={12} ry={17} fill="#3d3a2c" />
      <Mirror>
        <path d="M55 44 C38 52 28 82 34 104 C42 106 54 90 58 58 Z" fill="#eaf8f0" fillOpacity={0.8} stroke="#5f8d72" strokeWidth={1.5} />
        <S d="M54 50 C44 64 38 82 36 100 M55 56 C49 70 45 86 43 100" stroke="#8ab39a" strokeWidth={1} />
      </Mirror>
      <ellipse cx={60} cy={46} rx={16} ry={12} fill="#4b5a3a" />
      <S d="M50 42 L55 50 L60 44 L65 50 L70 42" stroke="#8cc26a" strokeWidth={2.5} />
      <S d="M54 24 L50 19 M66 24 L70 19" stroke="#3f4a30" strokeWidth={1.5} />
      <ellipse cx={60} cy={32} rx={17} ry={8} fill="#3f4a30" />
      <Eye x={44} y={31} r={5} />
      <Eye x={76} y={31} r={5} />
      <S d="M56 35 Q60 37.5 64 35" stroke="#a8c89a" strokeWidth={1.5} />
    </g>
  );
}

function Dragonfly() {
  const wing = { fill: '#eaf6ff', fillOpacity: 0.8, stroke: '#8fb3c7', strokeWidth: 1.2 };
  return (
    <g>
      <Mirror>
        <g transform="rotate(-6 33 40)">
          <ellipse cx={33} cy={40} rx={27} ry={6.5} {...wing} />
          <S d="M58 40 L10 40" stroke="#b5cfdd" strokeWidth={0.9} />
          <rect x={10} y={37.5} width={5} height={3} fill="#7a5a3a" />
        </g>
        <g transform="rotate(5 33 53)">
          <ellipse cx={33} cy={53} rx={27} ry={7.5} {...wing} />
          <S d="M58 53 L10 53" stroke="#b5cfdd" strokeWidth={0.9} />
          <rect x={10} y={50.5} width={5} height={3} fill="#7a5a3a" />
        </g>
        <S d="M56 42 L50 39 M56 46 L49 47 M56 50 L50 54" stroke="#333" strokeWidth={1.8} />
      </Mirror>
      <rect x={57} y={52} width={6} height={56} rx={3} fill="#e5532f" />
      <S d="M57 60 L63 60 M57 67 L63 67 M57 74 L63 74 M57 81 L63 81 M57 88 L63 88 M57 95 L63 95 M57 102 L63 102" stroke="#b83a1f" strokeWidth={1} />
      <ellipse cx={60} cy={46} rx={7.5} ry={10} fill="#c4452a" />
      <circle cx={53.5} cy={31} r={8} fill="#d9573a" />
      <circle cx={66.5} cy={31} r={8} fill="#d9573a" />
      <Eye x={53.5} y={31} r={5} />
      <Eye x={66.5} y={31} r={5} />
      <S d="M57 38.5 Q60 40.5 63 38.5" stroke="#7a2a18" strokeWidth={1.5} />
    </g>
  );
}

function RhinoBeetle() {
  const leg = '#3a1d10';
  return (
    <g>
      <Mirror>
        <S d="M46 54 L34 46 L30 37" stroke={leg} strokeWidth={3.5} />
        <S d="M46 67 L30 70 L23 77" stroke={leg} strokeWidth={3.5} />
        <S d="M48 80 L36 92 L34 104" stroke={leg} strokeWidth={3.5} />
        <S d="M33 44 L30 46 M30 72 L28 69 M36 94 L33 93" stroke={leg} strokeWidth={1.5} />
        <S d="M53 37 L46 33" stroke={leg} strokeWidth={1.8} />
      </Mirror>
      <path d="M40 62 Q40 104 60 104 Q80 104 80 62 Z" fill="#7a3a1a" />
      <S d="M60 62 L60 104" stroke="#4e220e" strokeWidth={1.5} />
      <ellipse cx={50} cy={74} rx={4} ry={9} fill="#b0643a" opacity={0.6} />
      <ellipse cx={60} cy={55} rx={21} ry={12} fill="#6b2f14" />
      <path d="M56 50 L60 42 L64 50 Z" fill="#5a2610" />
      <S d="M60 38 L60 14" stroke="#5a2610" strokeWidth={6} />
      <S d="M60 15 L53 5 M60 15 L67 5" stroke="#5a2610" strokeWidth={5} />
      <ellipse cx={60} cy={39} rx={10} ry={7} fill="#5a2610" />
      <Eye x={53.5} y={40} r={3} />
      <Eye x={66.5} y={40} r={3} />
      <ellipse cx={54} cy={52} rx={5} ry={2.5} fill="#c07a4e" opacity={0.5} />
    </g>
  );
}

function StagBeetle() {
  const leg = '#241a15';
  return (
    <g>
      <Mirror>
        <S d="M46 50 L32 44 L28 35" stroke={leg} strokeWidth={3} />
        <S d="M46 64 L30 66 L23 73" stroke={leg} strokeWidth={3} />
        <S d="M47 78 L34 90 L32 102" stroke={leg} strokeWidth={3} />
        <S d="M48 33 L40 33 L36 27" stroke={leg} strokeWidth={1.8} />
        <S d="M54 32 C43 24 39 13 46 4" stroke="#3a2a20" strokeWidth={5.5} />
        <S d="M45 18 L51 15" stroke="#3a2a20" strokeWidth={3} />
      </Mirror>
      <path d="M44 60 Q44 104 60 104 Q76 104 76 60 Z" fill="#3a2a22" />
      <S d="M60 60 L60 104" stroke="#1d1410" strokeWidth={1.5} />
      <ellipse cx={52} cy={74} rx={3.5} ry={9} fill="#6e5546" opacity={0.6} />
      <ellipse cx={60} cy={52} rx={17} ry={10} fill="#2e221c" />
      <ellipse cx={60} cy={36} rx={15} ry={9} fill="#33261f" />
      <Eye x={50} y={36} r={3.2} />
      <Eye x={70} y={36} r={3.2} />
      <ellipse cx={55} cy={49} rx={5} ry={2.4} fill="#6e5546" opacity={0.5} />
    </g>
  );
}

function Mantis() {
  const far = '#a6d77a';
  const near = '#4e9a2e';
  const body = '#7bc043';
  return (
    <g>
      <S d="M74 64 L80 82 L86 96" stroke={far} strokeWidth={2.5} />
      <S d="M64 67 L68 86 L64 99" stroke={far} strokeWidth={2.5} />
      <S d="M86 50 L90 62 L100 53 L94 60" stroke={far} strokeWidth={3} />
      <path d="M72 58 C60 55 30 62 16 77 C30 81 60 74 72 68 Z" fill={body} />
      <path d="M72 58 C58 57 36 62 24 73 C40 71 60 66 72 64 Z" fill="#62ab34" />
      <S d="M72 62 L87 40" stroke={body} strokeWidth={7} />
      <path d="M84 33 Q93 26 102 33 Q97 42 93 46 Q88 41 84 33 Z" fill="#8fd155" />
      <S d="M90 29 Q94 14 106 8" stroke="#5b9a36" strokeWidth={1.5} />
      <S d="M95 29 Q104 16 114 14" stroke="#5b9a36" strokeWidth={1.5} />
      <Eye x={87.5} y={33.5} r={3.8} />
      <Eye x={98.5} y={33.5} r={3.8} />
      <S d="M91 40 Q93 41.5 95 40" stroke="#3f7a25" strokeWidth={1.2} />
      <S d="M82 48 L84 62 L98 54" stroke={near} strokeWidth={4} />
      <S d="M98 54 L90 61" stroke={near} strokeWidth={3} />
      <S d="M87 60 L88 57 M91 58 L92 55 M94 56 L95 53" stroke={near} strokeWidth={1.2} />
      <S d="M72 66 L66 82 L70 96" stroke={near} strokeWidth={2.5} />
      <S d="M62 68 L56 86 L50 98" stroke={near} strokeWidth={2.5} />
    </g>
  );
}

function StickInsect() {
  const c = '#8b6a3e';
  return (
    <g>
      <S d="M88 32 L78 14 L70 10" stroke={c} strokeWidth={2} />
      <S d="M78 42 L62 28 L54 26" stroke={c} strokeWidth={2} />
      <S d="M70 50 L54 40 L46 40" stroke={c} strokeWidth={2} />
      <S d="M88 32 L102 44 L108 53" stroke={c} strokeWidth={2} />
      <S d="M78 42 L92 56 L96 66" stroke={c} strokeWidth={2} />
      <S d="M70 50 L84 64 L86 76" stroke={c} strokeWidth={2} />
      <S d="M18 102 L98 22" stroke={c} strokeWidth={6} />
      <S d="M72 48 L92 28" stroke="#a5824f" strokeWidth={8} />
      <S d="M101 19 L114 4 M100 18 L118 12" stroke={c} strokeWidth={1.4} />
      <ellipse cx={99} cy={21} rx={6} ry={4.5} transform="rotate(-45 99 21)" fill="#9a7747" />
      <Eye x={100} y={19} r={2.6} />
      <S d="M30 90 L32 92 M44 76 L46 78 M58 62 L60 64" stroke="#6d5130" strokeWidth={1.2} />
    </g>
  );
}

function LongHeadedGrasshopper() {
  const far = '#b7e08e';
  const near = '#5ea83a';
  return (
    <g>
      <S d="M82 62 L84 72 L88 74" stroke={far} strokeWidth={2.5} />
      <S d="M74 64 L74 74 L78 76" stroke={far} strokeWidth={2.5} />
      <S d="M62 60 L37 47 L27 82" stroke={far} strokeWidth={2.5} />
      <path d="M76 56 L14 60 Q10 63 14 66 L76 64 Z" fill="#8ccf5a" />
      <path d="M74 55 L8 60 L12 63 L74 60 Z" fill="#7cc04c" />
      <ellipse cx={77} cy={60} rx={7} ry={6} fill="#86c957" />
      <path d="M80 54 L112 42 Q114 45 111 48 L82 65 Q78 60 80 54 Z" fill="#9ad866" />
      <path d="M110 43 L118 30 L119.5 33 L112 46 Z" fill="#7cc04c" />
      <path d="M107 44 L113 30 L115.5 32 L110 46 Z" fill="#6aaa3e" />
      <Eye x={100} y={49} r={3.4} />
      <Blush x={96} y={55} r={2.2} />
      <S d="M84 64 L87 74 L93 76" stroke={near} strokeWidth={2.5} />
      <S d="M76 65 L76 76 L82 78" stroke={near} strokeWidth={2.5} />
      <ellipse cx={51} cy={54} rx={17} ry={4.5} transform="rotate(22 51 54)" fill="#7cc04c" stroke={near} strokeWidth={1.3} />
      <S d="M35 47 L24 84 L32 86" stroke={near} strokeWidth={2.5} />
    </g>
  );
}

function Snail() {
  return (
    <g>
      <path d="M14 90 Q50 97 92 90 Q104 88 104 78 Q104 66 94 64 Q86 64 82 72 L70 80 L20 84 Q11 86 14 90 Z" fill="#d9bb9c" />
      <S d="M94 66 L100 42" stroke="#c4a383" strokeWidth={3.5} />
      <S d="M89 67 L89 44" stroke="#c4a383" strokeWidth={3.5} />
      <circle cx={100} cy={41} r={3.8} fill="#3a2e24" />
      <circle cx={89} cy={43} r={3.8} fill="#3a2e24" />
      <circle cx={101} cy={40} r={1.2} fill="#fff" />
      <circle cx={90} cy={42} r={1.2} fill="#fff" />
      <S d="M101 76 L108 72 M100 79 L108 80" stroke="#c4a383" strokeWidth={2.5} />
      <S d="M92 78 Q96 81 100 78" stroke="#7a5a40" strokeWidth={1.5} />
      <Blush x={90} y={80} r={2.6} />
      <circle cx={52} cy={62} r={25} fill="#d08a45" />
      <S d="M55 62 A3 3 0 0 0 49 62 A6 6 0 0 0 61 62 A9 9 0 0 0 43 62 A12 12 0 0 0 67 62 A15 15 0 0 0 37 62 A18 18 0 0 0 73 62 A21 21 0 0 0 31 62" stroke="#8a5024" strokeWidth={3} />
      <ellipse cx={42} cy={48} rx={6} ry={3} fill="#f2c08c" opacity={0.6} transform="rotate(-30 42 48)" />
    </g>
  );
}

function PillBug() {
  const leg = '#3e434a';
  const ys = [42, 50, 58, 66, 74, 82, 90];
  return (
    <g>
      <Mirror>
        {ys.map((y) => (
          <S key={y} d={`M45 ${y} L34 ${y + 3}`} stroke={leg} strokeWidth={2.4} />
        ))}
        <S d="M53 32 Q44 24 37 26" stroke={leg} strokeWidth={2} />
        <S d="M55 96 L50 102" stroke={leg} strokeWidth={2.4} />
      </Mirror>
      <ellipse cx={60} cy={66} rx={20} ry={32} fill="#6f7780" />
      {[44, 52, 60, 68, 76, 84, 91].map((y) => (
        <S key={y} d={`M${y > 86 ? 48 : 42} ${y} Q60 ${y + 4} ${y > 86 ? 72 : 78} ${y}`} stroke="#4f565e" strokeWidth={1.6} />
      ))}
      <ellipse cx={52} cy={58} rx={4} ry={10} fill="#9aa3ad" opacity={0.6} />
      <ellipse cx={60} cy={35} rx={12} ry={6.5} fill="#5d646c" />
      <Eye x={55} y={34.5} r={2.6} />
      <Eye x={65} y={34.5} r={2.6} />
    </g>
  );
}

function Earthworm() {
  const d = 'M14 84 C28 52 48 50 58 70 S88 92 106 58';
  return (
    <g>
      <ellipse cx={60} cy={96} rx={46} ry={6} fill="#b98b62" opacity={0.35} />
      <S d={d} stroke="#e08a7e" strokeWidth={12} />
      <S d={d} stroke="#c86e64" strokeWidth={12} strokeDasharray="1.2 4.6" />
      <S d={d} stroke="#f2aaa0" strokeWidth={13.5} pathLength={100} strokeDasharray="9 200" strokeDashoffset={-68} strokeLinecap="butt" />
      <S d={d} stroke="#fff" strokeOpacity={0.35} strokeWidth={3} transform="translate(-1.5 -3)" />
      <circle cx={30} cy={100} r={2} fill="#8a6a4a" />
      <circle cx={90} cy={100} r={1.6} fill="#8a6a4a" />
    </g>
  );
}

function TreeFrog() {
  return (
    <g>
      <Mirror>
        <ellipse cx={33} cy={92} rx={17} ry={9} fill="#58b83a" />
        {[
          [14, 97], [17, 102], [22, 105], [28, 106], [34, 105],
        ].map(([x, y]) => (
          <circle key={`${x}`} cx={x} cy={y} r={2.5} fill="#8fe36a" />
        ))}
      </Mirror>
      <ellipse cx={60} cy={78} rx={30} ry={24} fill="#6fd04a" />
      <ellipse cx={60} cy={86} rx={18} ry={14} fill="#f3f8dc" />
      <ellipse cx={60} cy={56} rx={31} ry={19} fill="#74d64e" />
      <Mirror>
        <circle cx={44} cy={42} r={10} fill="#74d64e" />
        <S d="M28 58 L35 49" stroke="#3f8f2c" strokeWidth={3} />
        <Eye x={44} y={42} r={6.5} />
        <circle cx={55} cy={52} r={1.2} fill="#3f8f2c" />
        <Blush x={38} y={62} r={3.5} />
        <S d="M45 86 L41 101" stroke="#5cc23c" strokeWidth={6} />
        {[
          [34, 104], [38, 106.5], [43, 106.5], [47, 104],
        ].map(([x, y]) => (
          <circle key={`${x}`} cx={x} cy={y} r={2.4} fill="#8fe36a" />
        ))}
      </Mirror>
      <S d="M42 62 Q60 72 78 62" stroke="#3f8f2c" strokeWidth={2} />
    </g>
  );
}

function Tadpole() {
  return (
    <g>
      <circle cx={94} cy={28} r={4} fill="none" stroke="#9fd3f0" strokeWidth={1.5} />
      <circle cx={104} cy={18} r={2.6} fill="none" stroke="#9fd3f0" strokeWidth={1.5} />
      <path d="M56 50 C74 38 96 42 116 54 C96 64 74 72 56 66 Z" fill="#8a8170" fillOpacity={0.7} />
      <path d="M56 54 C76 50 96 52 114 54 C96 57 76 62 56 62 Z" fill="#5a5044" />
      <ellipse cx={40} cy={58} rx={21} ry={17} fill="#4b4137" />
      <circle cx={48} cy={66} r={1.6} fill="#7a6d5e" />
      <circle cx={52} cy={58} r={1.3} fill="#7a6d5e" />
      <ellipse cx={34} cy={50} rx={8} ry={4} fill="#6d6152" opacity={0.7} />
      <Eye x={30} y={53} r={4.5} />
      <Eye x={42} y={51} r={4} />
      <S d="M24 63 Q27 65 30 63" stroke="#c9b9a0" strokeWidth={1.5} />
    </g>
  );
}

function Medaka() {
  const fin = { fill: '#e8d9ac', stroke: '#b39d62', strokeWidth: 1 };
  return (
    <g>
      <path d="M92 58 L112 44 Q116 58 112 74 L92 62 Z" {...fin} />
      <path d="M52 70 L86 64 L84 75 Q66 80 52 74 Z" {...fin} />
      <path d="M74 50 L86 44 L88 54 Z" {...fin} />
      <path d="M12 60 C26 44 64 44 94 56 L94 64 C64 76 26 76 12 60 Z" fill="#e2cf98" />
      <S d="M22 52 C44 46 70 48 92 56" stroke="#9a8450" strokeWidth={2} />
      <S d="M22 66 C42 72 66 72 88 64" stroke="#fff6dc" strokeWidth={3} />
      <path d="M38 62 L48 58 L46 67 Z" fill="#f2e7c4" stroke="#c9b27a" strokeWidth={0.8} />
      <Eye x={27} y={57} r={6.5} />
      <S d="M12 59 L16 57.5" stroke="#8a7440" strokeWidth={1.5} />
      <circle cx={100} cy={30} r={3} fill="none" stroke="#9fd3f0" strokeWidth={1.5} />
    </g>
  );
}

// ───────── 학교 주변 생물 (추가) ─────────

/** 꽃등에: 벌을 닮았지만 날개가 2장인 파리 무리. 큰 겹눈, 털 없는 매끈한 배 */
function Hoverfly() {
  const leg = '#2f2a1e';
  return (
    <g>
      <Mirror>
        <S d="M53 50 L44 46 L40 39" stroke={leg} strokeWidth={2.2} />
        <S d="M53 55 L42 58 L37 63" stroke={leg} strokeWidth={2.2} />
        <S d="M54 61 L46 69 L44 78" stroke={leg} strokeWidth={2.2} />
        <ellipse cx={33} cy={54} rx={26} ry={9} transform="rotate(-14 33 54)" fill="#eef8ff" fillOpacity={0.85} stroke="#9fbccc" strokeWidth={1.2} />
        <S d="M54 52 C44 50 30 50 12 58" stroke="#b9d2de" strokeWidth={0.9} />
      </Mirror>
      <ellipse cx={60} cy={79} rx={12} ry={20} fill="#2b2a24" />
      <Mirror>
        <ellipse cx={53} cy={69} rx={5} ry={2.6} transform="rotate(-20 53 69)" fill="#f5c331" />
        <ellipse cx={52.5} cy={79} rx={5} ry={2.6} transform="rotate(-20 52.5 79)" fill="#f5c331" />
        <ellipse cx={54} cy={89} rx={4} ry={2.2} transform="rotate(-20 54 89)" fill="#f5c331" />
      </Mirror>
      <ellipse cx={60} cy={51} rx={10} ry={10} fill="#5b5a2e" />
      <S d="M57 44 L57 58 M63 44 L63 58" stroke="#7a7a45" strokeWidth={1.4} />
      <ellipse cx={60} cy={35} rx={15} ry={10} fill="#8a3a22" />
      <circle cx={52} cy={33} r={8.5} fill="#b5482e" />
      <circle cx={68} cy={33} r={8.5} fill="#b5482e" />
      <Eye x={52} y={33} r={5} />
      <Eye x={68} y={33} r={5} />
      <S d="M58 25 L56 21 M62 25 L64 21" stroke={leg} strokeWidth={1.4} />
    </g>
  );
}

/** 노린재: 방패 모양 몸, 등에 세모난 작은방패판 */
function StinkBug() {
  const leg = '#4a3b2a';
  return (
    <g>
      <Mirror>
        <S d="M47 52 L35 46 L31 39" stroke={leg} strokeWidth={2.6} />
        <S d="M45 65 L32 67 L27 73" stroke={leg} strokeWidth={2.6} />
        <S d="M48 78 L37 89 L35 99" stroke={leg} strokeWidth={2.6} />
        <S d="M55 31 L47 22 L41 12" stroke={leg} strokeWidth={2} />
        <circle cx={47} cy={22} r={1.6} fill={leg} />
        <circle cx={41} cy={12} r={1.8} fill={leg} />
      </Mirror>
      <path d="M60 38 L84 50 Q86 60 80 72 L70 97 Q60 104 50 97 L40 72 Q34 60 36 50 Z" fill="#8a6b3f" />
      <path d="M38 50 L60 38 L82 50 L80 58 L40 58 Z" fill="#7a5c34" />
      <path d="M47 58 L73 58 L60 85 Z" fill="#a1804e" />
      <path d="M50 93 Q60 101 70 93 L66 88 L54 88 Z" fill="#5a4630" />
      {[[45, 66], [75, 66], [52, 80], [68, 80], [60, 64]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} fill="#5e4628" />
      ))}
      <path d="M53 30 Q60 27 67 30 L68 40 L52 40 Z" fill="#7a5c34" />
      <Eye x={53.5} y={35} r={3.2} />
      <Eye x={66.5} y={35} r={3.2} />
    </g>
  );
}

/** 하늘소(알락하늘소 모습): 몸보다 긴 줄무늬 더듬이, 검은 몸에 흰 점 */
function LonghornBeetle() {
  const black = '#1d2230';
  return (
    <g>
      <Mirror>
        <S d="M55 30 C40 17 22 19 14 40 C8 57 10 81 16 106" stroke={black} strokeWidth={2.8} />
        <S d="M55 30 C40 17 22 19 14 40 C8 57 10 81 16 106" stroke="#c9dcff" strokeWidth={2.8} strokeDasharray="5 6" strokeLinecap="butt" />
        <S d="M49 50 L36 44 L30 35" stroke={black} strokeWidth={2.6} />
        <S d="M48 63 L32 65 L26 71" stroke={black} strokeWidth={2.6} />
        <S d="M49 77 L36 89 L33 99" stroke={black} strokeWidth={2.6} />
        <S d="M49 48 L44 46" stroke={black} strokeWidth={2.4} />
      </Mirror>
      <path d="M46 55 Q45 104 60 106 Q75 104 74 55 Z" fill={black} />
      <S d="M60 55 L60 106" stroke="#0e121a" strokeWidth={1.2} />
      {[[52, 62, 2.6], [67, 64, 2.4], [54, 74, 3], [66, 78, 2.6], [52, 88, 2.4], [68, 90, 2.8], [58, 98, 2], [62, 70, 1.8], [56, 84, 1.6]].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#f4f7ff" />
      ))}
      <ellipse cx={60} cy={48} rx={11} ry={8} fill={black} />
      <ellipse cx={60} cy={35} rx={9} ry={8} fill={black} />
      <Eye x={55} y={34} r={3} />
      <Eye x={65} y={34} r={3} />
      <ellipse cx={55} cy={60} rx={2.5} ry={6} fill="#4a5470" opacity={0.6} />
    </g>
  );
}

/** 땅강아지: 삽 같은 앞다리, 보송한 갈색 몸, 꼬리털 두 가닥 */
function MoleCricket() {
  const leg = '#6b4228';
  return (
    <g>
      <Mirror>
        <S d="M48 38 L36 31" stroke={leg} strokeWidth={4} />
        <path d="M37 22 L26 24 L21 32 L30 37 L39 32 Z" fill={leg} />
        <S d="M24 26 L19 23 M22 30 L17 30 M24 34 L20 37" stroke={leg} strokeWidth={1.6} />
        <S d="M49 54 L38 58 L33 64" stroke={leg} strokeWidth={3} />
        <S d="M50 64 L40 74 L36 84" stroke={leg} strokeWidth={3} />
        <S d="M56 20 L50 11" stroke={leg} strokeWidth={1.6} />
      </Mirror>
      <S d="M56 97 L52 109 M64 97 L68 109" stroke={leg} strokeWidth={1.8} />
      <ellipse cx={60} cy={78} rx={12} ry={20} fill="#9a6a40" />
      <S d="M50 82 L70 82 M51 89 L69 89 M53 95 L67 95" stroke="#7d5230" strokeWidth={1.2} />
      <path d="M50 55 L70 55 L68 76 L52 76 Z" fill="#b08254" />
      <S d="M60 56 L60 76 M54 60 L56 74 M66 60 L64 74" stroke="#8a6038" strokeWidth={1} />
      <ellipse cx={60} cy={42} rx={14} ry={13} fill="#7a4c2a" />
      <ellipse cx={60} cy={42} rx={12} ry={11} fill="none" stroke="#9a6a40" strokeWidth={1.5} strokeDasharray="1.5 2" />
      <ellipse cx={60} cy={26} rx={8} ry={7} fill="#6b4228" />
      <Eye x={56} y={25} r={2.6} />
      <Eye x={64} y={25} r={2.6} />
    </g>
  );
}

/** 소금쟁이: 가는 몸, 짧은 앞다리 + 아주 긴 가운뎃다리·뒷다리 (모두 6개) */
function WaterStrider() {
  const leg = '#333';
  return (
    <g>
      <Mirror>
        <ellipse cx={8} cy={30} rx={7} ry={2.6} fill="none" stroke="#8fd0f5" strokeWidth={1.5} />
        <ellipse cx={15} cy={104} rx={7} ry={2.6} fill="none" stroke="#8fd0f5" strokeWidth={1.5} />
        <S d="M56 40 L48 34 L46 27" stroke={leg} strokeWidth={2} />
        <S d="M55 50 L30 47 L8 30" stroke={leg} strokeWidth={1.8} />
        <S d="M56 62 L35 77 L15 104" stroke={leg} strokeWidth={1.8} />
        <S d="M58 26 L54 14" stroke={leg} strokeWidth={1.3} />
      </Mirror>
      <ellipse cx={60} cy={61} rx={5} ry={27} fill="#3d3d3d" />
      <ellipse cx={58.5} cy={55} rx={1.6} ry={14} fill="#6b6b6b" />
      <circle cx={60} cy={31} r={5.5} fill="#3d3d3d" />
      <Eye x={57} y={30} r={2.4} />
      <Eye x={63} y={30} r={2.4} />
    </g>
  );
}

/** 물방개: 매끈한 타원형 몸에 노란 테두리, 털 달린 넓적한 뒷다리 */
function DivingBeetle() {
  const leg = '#4a5530';
  return (
    <g>
      <Mirror>
        <S d="M43 46 L34 42 L30 36" stroke={leg} strokeWidth={2.2} />
        <S d="M40 58 L28 60 L24 66" stroke={leg} strokeWidth={2.4} />
        <S d="M42 76 L26 87 L14 101" stroke={leg} strokeWidth={5} />
        <S d="M24 89 L20 85 M20 93 L16 89 M17 97 L13 93 M27 91 L25 95 M22 96 L20 100" stroke="#8a9a5a" strokeWidth={1.2} />
        <S d="M54 29 Q46 20 40 22" stroke={leg} strokeWidth={1.4} />
      </Mirror>
      <ellipse cx={60} cy={65} rx={22} ry={32} fill="#2f3a26" stroke="#e0c040" strokeWidth={3} />
      <S d="M60 46 L60 96" stroke="#1d2418" strokeWidth={1.2} />
      <S d="M40 47 Q60 41 80 47" stroke="#1d2418" strokeWidth={1.2} />
      <ellipse cx={51} cy={62} rx={4} ry={12} fill="#5c6e45" opacity={0.6} />
      <path d="M48 38 Q60 26 72 38 Z" fill="#2f3a26" stroke="#e0c040" strokeWidth={2} />
      <Eye x={54} y={34} r={2.8} />
      <Eye x={66} y={34} r={2.8} />
      <circle cx={60} cy={104} r={3} fill="none" stroke="#9fd3f0" strokeWidth={1.4} />
    </g>
  );
}

/** 거미(무당거미 모습): 몸이 두 부분, 다리 8개, 눈 8개 — 곤충이 아니에요 */
function Spider() {
  const leg = '#3b2a1a';
  return (
    <g>
      <g stroke="#dfe8ee" strokeWidth={0.9} fill="none">
        <path d="M60 4 L60 116 M4 60 L116 60 M18 18 L102 102 M102 18 L18 102" />
        <circle cx={60} cy={60} r={20} />
        <circle cx={60} cy={60} r={36} />
        <circle cx={60} cy={60} r={52} />
      </g>
      <Mirror>
        <S d="M53 40 L39 27 L32 10" stroke={leg} strokeWidth={2.4} />
        <S d="M52 44 L33 37 L18 30" stroke={leg} strokeWidth={2.4} />
        <S d="M52 49 L33 54 L18 62" stroke={leg} strokeWidth={2.4} />
        <S d="M53 53 L39 66 L31 84" stroke={leg} strokeWidth={2.4} />
        <S d="M57 37 L55 31" stroke={leg} strokeWidth={1.8} />
      </Mirror>
      <ellipse cx={60} cy={76} rx={15} ry={20} fill="#f2c12e" />
      <S d="M47 68 Q60 64 73 68 M46 78 Q60 74 74 78 M48 88 Q60 84 72 88" stroke="#2b2b2b" strokeWidth={3} />
      <ellipse cx={60} cy={94} rx={4} ry={2.5} fill="#e2563a" />
      <ellipse cx={60} cy={46} rx={10} ry={11} fill="#4a3522" />
      <Eye x={56} y={44} r={3.3} />
      <Eye x={64} y={44} r={3.3} />
      {[[52.5, 40], [67.5, 40], [56.5, 38], [63.5, 38], [53, 48.5], [67, 48.5]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.2} fill="#1f1f1f" />
      ))}
    </g>
  );
}

/** 민달팽이: 달팽이와 닮았지만 껍데기가 없어요 */
function Slug() {
  return (
    <g>
      <path d="M10 88 Q14 76 30 74 Q60 70 86 66 Q100 64 104 74 Q106 84 96 88 Q60 94 10 88 Z" fill="#b9a58c" />
      <ellipse cx={72} cy={71} rx={18} ry={7} fill="#a38f74" />
      <circle cx={78} cy={73} r={1.6} fill="#7d6a52" />
      <S d="M18 84 Q50 79 62 76" stroke="#a8947a" strokeWidth={1.4} />
      <S d="M24 89 Q60 92 94 87" stroke="#fff" strokeOpacity={0.55} strokeWidth={2} />
      <S d="M94 67 L100 46" stroke="#a8947a" strokeWidth={3.2} />
      <S d="M89 68 L89 48" stroke="#a8947a" strokeWidth={3.2} />
      <circle cx={100} cy={45} r={3.6} fill="#3a2e24" />
      <circle cx={89} cy={47} r={3.6} fill="#3a2e24" />
      <circle cx={101} cy={44} r={1.1} fill="#fff" />
      <circle cx={90} cy={46} r={1.1} fill="#fff" />
      <S d="M101 76 L108 73 M100 79 L107 80" stroke="#a8947a" strokeWidth={2.2} />
      <S d="M92 78 Q96 81 100 78" stroke="#6d5a44" strokeWidth={1.5} />
      <Blush x={90} y={81} r={2.6} />
    </g>
  );
}

/** 참새: 밤색 머리, 흰 뺨에 검은 점, 검은 턱, 짧은 원뿔 부리 */
function Sparrow() {
  return (
    <g>
      <path d="M24 66 L6 78 L10 83 L30 72 Z" fill="#6b4a2e" />
      <S d="M50 84 L48 98 M58 84 L60 98 M44 98 L52 98 M56 98 L64 98" stroke="#b07a4a" strokeWidth={2.2} />
      <ellipse cx={52} cy={66} rx={28} ry={20} fill="#cbb08a" />
      <ellipse cx={58} cy={75} rx={19} ry={10} fill="#ebe1cf" />
      <path d="M28 56 Q50 44 74 56 Q66 74 44 78 Q28 74 28 56 Z" fill="#8a5a34" />
      <S d="M36 58 L46 64 M46 54 L56 62 M56 54 L64 60" stroke="#4e3220" strokeWidth={2} />
      <S d="M38 68 L62 63" stroke="#f3eadb" strokeWidth={2.2} />
      <circle cx={80} cy={48} r={15} fill="#f3eadb" />
      <path d="M65 45 Q71 31 87 33 Q96 37 95 44 Q82 40 66 47 Z" fill="#8a4a2a" />
      <path d="M77 59 Q84 63 91 56 L89 52 Q84 56 79 54 Z" fill="#2b2b2b" />
      <ellipse cx={77} cy={50} rx={3} ry={2.5} fill="#2b2b2b" />
      <Eye x={86} y={44} r={3.4} />
      <path d="M94 46 L104 49 L94 52 Z" fill="#3a3a3a" />
    </g>
  );
}

/** 까치: 검은색·흰색 깃털, 푸른빛 도는 긴 꼬리 */
function Magpie() {
  return (
    <g>
      <path d="M40 66 L4 88 L9 95 L46 74 Z" fill="#1f2a33" />
      <S d="M38 70 L10 88" stroke="#2f7f78" strokeWidth={2.4} />
      <S d="M54 76 L52 93 M62 76 L64 93 M48 93 L56 93 M60 93 L68 93" stroke="#222" strokeWidth={2.2} />
      <ellipse cx={57} cy={62} rx={23} ry={16} fill="#1f2a33" />
      <path d="M44 66 Q56 84 75 67 Q71 77 57 79 Q46 77 44 66 Z" fill="#fff" />
      <path d="M36 56 Q54 45 73 54 Q60 63 40 64 Z" fill="#24425a" />
      <ellipse cx={55} cy={58} rx={11} ry={5} fill="#fff" />
      <circle cx={80} cy={45} r={12} fill="#1f2a33" />
      <Eye x={83} y={42} r={3.2} />
      <path d="M90 44 L105 47.5 L90 51 Z" fill="#1a1a1a" />
    </g>
  );
}

const ART: Record<string, ComponentType> = {
  ant: Ant,
  ladybug: Ladybug,
  'cabbage-white': CabbageWhite,
  honeybee: Honeybee,
  grasshopper: Grasshopper,
  cricket: Cricket,
  cicada: Cicada,
  dragonfly: Dragonfly,
  'rhino-beetle': RhinoBeetle,
  'stag-beetle': StagBeetle,
  mantis: Mantis,
  'stick-insect': StickInsect,
  swallowtail: Swallowtail,
  'long-headed-grasshopper': LongHeadedGrasshopper,
  snail: Snail,
  'pill-bug': PillBug,
  earthworm: Earthworm,
  'tree-frog': TreeFrog,
  tadpole: Tadpole,
  medaka: Medaka,
  hoverfly: Hoverfly,
  'stink-bug': StinkBug,
  'longhorn-beetle': LonghornBeetle,
  'mole-cricket': MoleCricket,
  'water-strider': WaterStrider,
  'diving-beetle': DivingBeetle,
  spider: Spider,
  slug: Slug,
  sparrow: Sparrow,
  magpie: Magpie,
};

export function hasArt(id: string): boolean {
  return id in ART;
}

export function CreatureArt({
  id,
  hidden = false,
  className,
}: {
  id: string;
  /** true 이면 그림자(실루엣)로 보여 줍니다. */
  hidden?: boolean;
  className?: string;
}) {
  const Art = ART[id];
  return (
    <svg
      viewBox="0 0 120 120"
      className={`creature-art${hidden ? ' is-hidden' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      focusable="false"
    >
      {Art ? <Art /> : <circle cx={60} cy={60} r={30} fill="#ccc" />}
    </svg>
  );
}
