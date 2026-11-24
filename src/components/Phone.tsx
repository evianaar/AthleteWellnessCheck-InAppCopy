import type { ReactNode } from 'react'
import { ArrowUpRight, BatteryFull, ChevronLeft, Signal, Wifi } from 'lucide-react'

export function Phone({
  children,
  bg = '#F2F3EF',
  light = false,
  bare = false,
}: {
  children: ReactNode
  bg?: string
  light?: boolean
  /** Render full-bleed with no device bezel (used when already on a phone-sized screen). */
  bare?: boolean
}) {
  const screen = (
    <div
      className={`relative overflow-hidden ${bare ? 'w-full' : 'h-[852px] w-[393px] rounded-[54px]'}`}
      style={{ background: bg, ...(bare ? { height: '100dvh', minHeight: 760 } : {}) }}
    >
        <div
          className={`absolute inset-x-0 top-0 z-40 flex h-[54px] items-center justify-between px-9 pt-1 text-[16px] font-bold ${light ? 'text-white' : 'text-ink'}`}
        >
          <span className="font-sans tracking-tight">9:41</span>
          <span className="flex items-center gap-1.5">
            <Signal size={16} strokeWidth={2.75} />
            <Wifi size={16} strokeWidth={2.75} />
            <BatteryFull size={22} strokeWidth={2} />
          </span>
        </div>
        {!bare && <div className="absolute left-1/2 top-[11px] z-50 h-[35px] w-[124px] -translate-x-1/2 rounded-full bg-black" />}
        {children}
        {!bare && <div className="absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink/85" />}
    </div>
  )
  if (bare) return screen
  return (
    <div className="relative rounded-[64px] bg-[#121412] p-[11px] shadow-[0_40px_80px_-30px_rgba(31,49,40,0.55),inset_0_0_0_2px_#34372f]">
      {screen}
    </div>
  )
}

export function PillButton({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex h-14 w-full items-center justify-between gap-2 rounded-full bg-ink pl-6 pr-2 text-[17px] font-extrabold text-white shadow-[0_14px_28px_-14px_rgba(17,19,17,0.8)] transition hover:bg-black active:scale-[0.98] ${className}`}
    >
      <span className="flex items-center gap-2">{children}</span>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lav text-ink transition group-hover:rotate-45">
        <ArrowUpRight size={20} strokeWidth={2.5} />
      </span>
    </button>
  )
}

export function WellnessTopBar({
  step,
  onCancel,
  onNext,
  onBack,
  nextLabel = 'Next',
}: {
  step: number
  onCancel?: () => void
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
}) {
  return (
    <div className="absolute inset-x-0 top-[56px] z-30 flex items-center justify-between px-5">
      <div className="flex w-[118px] items-center gap-2">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink ring-1 ring-ink/10 hover:bg-ink hover:text-white"
        >
          <ChevronLeft size={22} strokeWidth={2.75} />
        </button>
        <button onClick={onCancel} className="text-[15px] font-bold text-mist hover:text-ink">
          Cancel
        </button>
      </div>
      <div className="flex items-center gap-1.5" aria-label={`Step ${step} of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-peri' : i < step ? 'w-2 bg-leaf' : 'w-2 bg-[#E3E4DF]'}`}
          />
        ))}
      </div>
      <div className="flex w-[118px] justify-end">
        <button
          onClick={onNext}
          className="flex h-9 min-w-[72px] items-center justify-center rounded-full bg-lav px-4 text-[15px] font-extrabold text-ink hover:bg-ink hover:text-white"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
