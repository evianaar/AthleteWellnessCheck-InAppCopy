import { ArrowUpRight, BarChart3, CalendarDays, ChevronLeft, Home, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { useApp, type Route } from '../state'

export function BackButton({ onClick, className = '', light = false }: { onClick?: () => void; className?: string; light?: boolean }) {
  const { back, canBack } = useApp()
  if (!onClick && !canBack) return null
  return (
    <button
      onClick={onClick ?? back}
      aria-label="Go back"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${light ? 'bg-white/25 text-white ring-1 ring-white/50 hover:bg-white/35' : 'bg-white text-ink ring-1 ring-ink/10 hover:bg-ink hover:text-white'} ${className}`}
    >
      <ChevronLeft size={22} strokeWidth={2.75} />
    </button>
  )
}

const TABS: { route: Route; label: string; Icon: typeof Home }[] = [
  { route: 'home', label: 'Home', Icon: Home },
  { route: 'stats', label: 'Stats', Icon: BarChart3 },
  { route: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { route: 'profile', label: 'Profile', Icon: User },
]

export function TabBar({ active }: { active: Route }) {
  const { go } = useApp()
  return (
    <nav className="absolute inset-x-5 bottom-7 z-30 flex h-16 items-center justify-around rounded-full bg-ink px-2 shadow-[0_18px_36px_-16px_rgba(17,19,17,0.7)]">
      {TABS.map(({ route, label, Icon }) =>
        route === active ? (
          <span key={route} className="flex h-11 items-center gap-2 rounded-full bg-lav px-4 text-[14px] font-extrabold text-ink">
            <Icon size={18} strokeWidth={2.5} /> {label}
          </span>
        ) : (
          <button
            key={route}
            onClick={() => go(route)}
            aria-label={label}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
          >
            <Icon size={22} />
          </button>
        ),
      )}
    </nav>
  )
}

/** Standard page: back button + title row, scrollable body, optional footer or tab bar. */
export function Page({
  title,
  right,
  children,
  footer,
  tab,
}: {
  title: string
  right?: ReactNode
  children: ReactNode
  footer?: ReactNode
  tab?: Route
}) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center gap-3 px-5 pt-[56px]">
        <BackButton />
        <h1 className="flex-1 truncate font-display text-[24px] font-semibold text-ink">{title}</h1>
        {right}
      </div>
      <div className={`no-scrollbar flex-1 overflow-y-auto px-5 pt-4 ${tab ? 'pb-28' : footer ? 'pb-4' : 'pb-10'}`}>{children}</div>
      {footer && <div className="px-5 pb-9 pt-2">{footer}</div>}
      {tab && <TabBar active={tab} />}
    </div>
  )
}

export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-full px-4 text-[14px] font-extrabold transition ${on ? 'bg-ink text-white ring-1 ring-ink' : 'bg-white text-ink ring-1 ring-ink/15 hover:ring-ink/40'}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[26px] bg-white p-5 shadow-[0_1px_0_rgba(17,19,17,0.04),0_14px_30px_-24px_rgba(17,19,17,0.45)] ${className}`}>{children}</div>
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-[52px] rounded-full transition ${on ? 'bg-peri' : 'bg-[#E3E4DF]'}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[24px]' : 'left-1'}`} />
    </button>
  )
}

/** Outlined circular arrow button — the signature action of the bento style. */
export function ArrowButton({ onClick, label, dark = false, className = '' }: { onClick?: () => void; label: string; dark?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${dark ? 'text-white ring-1 ring-white/40 hover:bg-white hover:text-ink' : 'text-ink ring-1 ring-ink/25 hover:bg-ink hover:text-white'} ${className}`}
    >
      <ArrowUpRight size={19} strokeWidth={2.25} />
    </button>
  )
}
