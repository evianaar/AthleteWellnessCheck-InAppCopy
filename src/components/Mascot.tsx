import { useId } from 'react'

type Eyes = 'open' | 'wide' | 'happy' | 'closed' | 'half' | 'dizzy' | 'star' | 'squint' | 'sad'
type Mouth = 'smile' | 'big' | 'grin' | 'o' | 'tiny' | 'flat' | 'frown' | 'wavy'
type Arms = 'down' | 'wave' | 'cheer' | 'peek'

const presets = {
  dizzy: { eyes: 'dizzy', mouth: 'wavy', arms: 'down' },
  sleepy: { eyes: 'closed', mouth: 'o', arms: 'down' },
  sleeping: { eyes: 'closed', mouth: 'tiny', arms: 'down' },
  tired: { eyes: 'half', mouth: 'flat', arms: 'down' },
  down: { eyes: 'open', mouth: 'frown', arms: 'down' },
  sad: { eyes: 'sad', mouth: 'frown', arms: 'down' },
  stressed: { eyes: 'squint', mouth: 'wavy', arms: 'down' },
  neutral: { eyes: 'open', mouth: 'tiny', arms: 'down' },
  content: { eyes: 'open', mouth: 'smile', arms: 'down' },
  happy: { eyes: 'happy', mouth: 'big', arms: 'down' },
  pumped: { eyes: 'star', mouth: 'grin', arms: 'cheer' },
  wave: { eyes: 'happy', mouth: 'smile', arms: 'wave' },
  cheer: { eyes: 'happy', mouth: 'grin', arms: 'cheer' },
  peek: { eyes: 'wide', mouth: 'smile', arms: 'peek' },
  curious: { eyes: 'wide', mouth: 'o', arms: 'down' },
} satisfies Record<string, { eyes: Eyes; mouth: Mouth; arms: Arms }>

export type MascotMood = keyof typeof presets

const INK = '#1F3128'

function Eye({ x, y, type, dx, mirror }: { x: number; y: number; type: Eyes; dx: number; mirror: boolean }) {
  const s = { stroke: INK, strokeWidth: 5, strokeLinecap: 'round' as const, fill: 'none' }
  const ex = x + dx
  switch (type) {
    case 'open':
    case 'wide':
    case 'sad': {
      const big = type === 'wide'
      const sm = type === 'sad'
      return (
        <g>
          <ellipse cx={ex} cy={y} rx={big ? 11 : sm ? 8 : 9.5} ry={big ? 13 : sm ? 10 : 11.5} fill={INK} />
          <circle cx={ex + 3} cy={y - 4.5} r={big ? 4 : 3.2} fill="#fff" />
          <circle cx={ex - 3} cy={y + 4} r={1.6} fill="#fff" opacity={0.8} />
          {sm && (
            <path
              d={mirror ? `M${x + 10} ${y - 15} L${x - 8} ${y - 21}` : `M${x - 10} ${y - 15} L${x + 8} ${y - 21}`}
              {...s}
              strokeWidth={4}
            />
          )}
        </g>
      )
    }
    case 'happy':
      return <path d={`M${x - 10} ${y + 3} Q${x} ${y - 12} ${x + 10} ${y + 3}`} {...s} />
    case 'closed':
      return <path d={`M${x - 10} ${y - 1} Q${x} ${y + 9} ${x + 10} ${y - 1}`} {...s} />
    case 'half':
      return (
        <g>
          <path d={`M${ex - 9} ${y} A9 9 0 0 0 ${ex + 9} ${y} Z`} fill={INK} />
          <path d={`M${x - 12} ${y} L${x + 12} ${y}`} {...s} strokeWidth={4} />
        </g>
      )
    case 'dizzy':
      return (
        <path
          d={`M${x} ${y} m-1 0 a1.5 1.5 0 1 1 3 0 a4 4 0 1 1 -7 0 a7 7 0 1 1 13 0 a9.5 9.5 0 1 1 -18 0`}
          {...s}
          strokeWidth={3.2}
        />
      )
    case 'star': {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? 13 : 5.5
        const a = (Math.PI / 5) * i - Math.PI / 2
        return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`
      }).join(' ')
      return <polygon points={pts} fill="#FFD66E" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    }
    case 'squint':
      return mirror ? (
        <path d={`M${x + 8} ${y - 8} L${x - 6} ${y} L${x + 8} ${y + 8}`} {...s} strokeLinejoin="round" />
      ) : (
        <path d={`M${x - 8} ${y - 8} L${x + 6} ${y} L${x - 8} ${y + 8}`} {...s} strokeLinejoin="round" />
      )
  }
}

function MouthShape({ type }: { type: Mouth }) {
  const s = { stroke: INK, strokeWidth: 4.5, strokeLinecap: 'round' as const, fill: 'none' }
  switch (type) {
    case 'smile':
      return <path d="M88 133 Q100 145 112 133" {...s} />
    case 'big':
      return (
        <g>
          <path d="M86 131 Q100 154 114 131 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <ellipse cx="100" cy="143" rx="6.5" ry="3.6" fill="#FF8FB1" />
        </g>
      )
    case 'grin':
      return (
        <g>
          <path d="M82 129 Q100 160 118 129 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <ellipse cx="100" cy="146" rx="9" ry="4.5" fill="#FF8FB1" />
        </g>
      )
    case 'o':
      return <ellipse cx="100" cy="137" rx="5" ry="6" fill={INK} />
    case 'tiny':
      return <path d="M95 135 Q100 139.5 105 135" {...s} strokeWidth={4} />
    case 'flat':
      return <path d="M92 137 L108 137" {...s} />
    case 'frown':
      return <path d="M89 141 Q100 131 111 141" {...s} />
    case 'wavy':
      return <path d="M86 137 Q91 131 96 137 Q101 143 106 137 Q111 131 115 137" {...s} strokeWidth={4} />
  }
}

export function Mascot({
  mood = 'content',
  size = 160,
  look = 0,
  className = '',
  animateArm = true,
}: {
  mood?: MascotMood
  size?: number
  /** horizontal pupil offset, -4..4 */
  look?: number
  className?: string
  animateArm?: boolean
}) {
  const id = useId().replace(/:/g, '')
  const p = presets[mood]
  const arm = '#3DB8A0'
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id={`b${id}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#A8E3D7" />
          <stop offset="55%" stopColor="#4DB57F" />
          <stop offset="100%" stopColor="#3DB8A0" />
        </radialGradient>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5E7A0" />
          <stop offset="100%" stopColor="#D4F36B" />
        </linearGradient>
      </defs>

      {/* gills */}
      {[false, true].map((m) => (
        <g key={String(m)} transform={m ? 'translate(200 0) scale(-1 1)' : undefined} fill={`url(#g${id})`}>
          <ellipse cx="30" cy="76" rx="21" ry="9.5" transform="rotate(-38 30 76)" />
          <ellipse cx="20" cy="99" rx="21" ry="9.5" transform="rotate(-8 20 99)" />
          <ellipse cx="26" cy="122" rx="18" ry="8.5" transform="rotate(22 26 122)" />
          <circle cx="16" cy="64" r="4" fill="#F5B8E0" />
          <circle cx="2" cy="98" r="4" fill="#F5B8E0" />
        </g>
      ))}
      {/* crest droplet */}
      <path d="M100 62 C90 50 95 38 105 30 C107 42 113 52 100 62 Z" fill={`url(#g${id})`} />

      {/* feet */}
      <ellipse cx="78" cy="178" rx="15" ry="8" fill="#3DB8A0" />
      <ellipse cx="122" cy="178" rx="15" ry="8" fill="#3DB8A0" />

      {/* arms behind body when raised */}
      {p.arms === 'cheer' && (
        <>
          <ellipse cx="36" cy="86" rx="11" ry="19" transform="rotate(-32 36 86)" fill={arm} />
          <ellipse cx="164" cy="86" rx="11" ry="19" transform="rotate(32 164 86)" fill={arm} />
        </>
      )}
      {p.arms === 'wave' && (
        <g className={animateArm ? 'wm-wave-arm' : undefined}>
          <ellipse cx="166" cy="88" rx="11" ry="19" transform="rotate(30 166 88)" fill={arm} />
        </g>
      )}

      {/* body */}
      <ellipse cx="100" cy="118" rx="70" ry="62" fill={`url(#b${id})`} />
      <ellipse cx="100" cy="150" rx="40" ry="24" fill="#fff" opacity="0.28" />
      <ellipse cx="72" cy="80" rx="17" ry="9" transform="rotate(-28 72 80)" fill="#fff" opacity="0.55" />
      <circle cx="94" cy="72" r="3.5" fill="#fff" opacity="0.6" />

      {/* arms at sides */}
      {(p.arms === 'down' || p.arms === 'wave') && (
        <ellipse cx="35" cy="138" rx="10" ry="15" transform="rotate(28 35 138)" fill={arm} />
      )}
      {p.arms === 'down' && <ellipse cx="165" cy="138" rx="10" ry="15" transform="rotate(-28 165 138)" fill={arm} />}
      {p.arms === 'peek' && (
        <>
          <ellipse cx="66" cy="168" rx="15" ry="10" fill={arm} />
          <ellipse cx="134" cy="168" rx="15" ry="10" fill={arm} />
        </>
      )}

      {/* cheeks */}
      <ellipse cx="58" cy="130" rx="11" ry="6.5" fill="#FF9EC4" opacity="0.55" />
      <ellipse cx="142" cy="130" rx="11" ry="6.5" fill="#FF9EC4" opacity="0.55" />

      <Eye x={76} y={112} type={p.eyes} dx={look} mirror={false} />
      <Eye x={124} y={112} type={p.eyes} dx={look} mirror />
      <MouthShape type={p.mouth} />

      {mood === 'pumped' && (
        <g fill="#D4F36B">
          <path d="M30 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
          <path d="M172 34 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" />
          <path d="M168 150 q6 -2 6 6 q-6 2 -6 -6z" fill="#9FD8FF" />
        </g>
      )}
      {mood === 'stressed' && <path d="M160 76 q8 10 0 16 q-8 -6 0 -16z" fill="#9FD8FF" />}
    </svg>
  )
}

export function Sparkle({ size = 18, color = '#E2F79A', className = '', style }: { size?: number; color?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} aria-hidden>
      <path d="M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0Z" fill={color} />
    </svg>
  )
}
