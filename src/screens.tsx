import { useEffect, useRef, useState } from 'react'
import { Activity, ArrowUpRight, Bandage, Bell, Check, ChevronRight, Eye, EyeOff, Flame, HeartPulse, Lock, Mail, Moon, Users } from 'lucide-react'
import { Mascot, Sparkle, type MascotMood } from './components/Mascot'
import { PillButton, WellnessTopBar } from './components/Phone'
import { ArrowButton, BackButton, TabBar } from './components/Nav'
import { SLEEP_OPTIONS, addDays, dateKey, latestLabel, nowTime, readinessScore, scoreLabel, todayKey, useApp, type Route } from './state'

/* ---------------------------------------------------------------- shared bits */

function Zzz({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute font-display font-bold text-leaf ${className}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute"
          style={{
            fontSize: 16 + i * 6,
            left: i * 14,
            top: -i * 16,
            animation: `wm-zzz 2.4s ease-out ${i * 0.6}s infinite`,
          }}
        >
          Z
        </span>
      ))}
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#5E7A12]">{children}</p>
}

function Question({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`font-display text-[28px] font-semibold leading-[1.15] text-peri ${className}`}>{children}</h2>
}

const scaleMood: MascotMood[] = ['sleepy', 'tired', 'neutral', 'content', 'happy']

/* ---------------------------------------------------------------- 1 Splash */

export function Splash() {
  const { go } = useApp()
  return (
    <button onClick={() => go('onboarding')} className="absolute inset-0 flex flex-col items-center justify-center text-left">
      <svg className="absolute left-6 top-28 opacity-70" width="120" height="60" viewBox="0 0 120 60" fill="none">
        <path d="M4 40 C24 4 50 56 70 24 S110 20 116 6" stroke="#E2F79A" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <svg className="absolute bottom-40 right-4 opacity-70" width="110" height="60" viewBox="0 0 110 60" fill="none">
        <path d="M6 10 C30 50 54 0 76 34 S100 52 106 40" stroke="#A8E3D7" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <Sparkle size={26} className="wm-twinkle absolute left-16 top-[250px]" />
      <Sparkle size={16} color="#A8E3D7" className="wm-twinkle absolute right-20 top-[210px]" style={{ animationDelay: '.8s' }} />
      <Sparkle size={20} className="wm-twinkle absolute right-14 top-[460px]" style={{ animationDelay: '1.4s' }} />
      <Sparkle size={12} color="#D4F36B" className="wm-twinkle absolute left-24 top-[520px]" style={{ animationDelay: '.4s' }} />

      <div className="relative -mt-10 flex flex-col items-center">
        <div className="absolute top-6 h-56 w-56 rounded-full bg-[radial-gradient(circle,#E2F79A_0%,#F1FBD6_45%,transparent_70%)]" />
        <div className="wm-float relative">
          <Mascot mood="happy" size={210} />
        </div>
        <div className="wm-shadow mt-1 h-3 w-28 rounded-full bg-peri/25" />
        <h1 className="mt-8 font-display text-[48px] font-bold leading-none tracking-tight text-ink">
          Well<span className="text-leaf">Mate</span>
        </h1>
        <p className="mt-3 text-[16px] font-semibold text-mist">Your daily readiness buddy</p>
      </div>

      <div className="absolute bottom-16 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-full bg-lav" style={{ animation: `wm-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
        ))}
      </div>
    </button>
  )
}

/* ---------------------------------------------------------------- 2 Onboarding */

const ITEM = 44

function Wheel({ items, value, onChange, width = 76 }: { items: string[]; value: number; onChange: (i: number) => void; width?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<number>(0)
  useEffect(() => {
    ref.current?.scrollTo({ top: value * ITEM })
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div
      ref={ref}
      onScroll={(e) => {
        const el = e.currentTarget
        const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM)))
        if (i !== value) onChange(i)
        window.clearTimeout(timer.current)
      }}
      className="no-scrollbar relative z-10 h-[220px] snap-y snap-mandatory overflow-y-scroll"
      style={{
        width,
        maskImage: 'linear-gradient(transparent, #000 30%, #000 70%, transparent)',
        WebkitMaskImage: 'linear-gradient(transparent, #000 30%, #000 70%, transparent)',
      }}
    >
      <div style={{ height: ITEM * 2 }} />
      {items.map((it, i) => {
        const d = Math.abs(i - value)
        return (
          <button
            key={it}
            onClick={() => ref.current?.scrollTo({ top: i * ITEM, behavior: 'smooth' })}
            className="flex w-full snap-center items-center justify-center font-display transition-all"
            style={{
              height: ITEM,
              fontSize: d === 0 ? 28 : 22,
              fontWeight: d === 0 ? 600 : 500,
              color: d === 0 ? '#2A8C7A' : '#A0A5BA',
              opacity: d > 1 ? 0.55 : 1,
            }}
          >
            {it}
          </button>
        )
      })}
      <div style={{ height: ITEM * 2 }} />
    </div>
  )
}

export function Onboarding() {
  const { go, back, prev, data, update, toast } = useApp()
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const mins = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))
  const r = data.reminder
  const [h, setH] = useState(r.hour)
  const [m, setM] = useState(r.minute)
  const [ap, setAp] = useState(r.pm ? 1 : 0)
  const [days, setDays] = useState(r.days)
  const fromProfile = prev === 'profile'
  const save = () => {
    update((d) => ({ ...d, reminder: { hour: h, minute: m, pm: ap === 1, days }, remindersOn: true }))
    if (fromProfile) {
      toast(`Reminder set for ${hours[h]}:${mins[m]} ${ap ? 'PM' : 'AM'}`)
      back()
    } else go('login')
  }
  return (
    <div className="absolute inset-0 flex flex-col px-7 pb-10 pt-[56px]">
      <div className="flex items-center gap-3">
        <BackButton className="-ml-2" />
        <div className="flex flex-1 gap-2">
          <span className="h-2 flex-[2] rounded-full bg-peri" />
          <span className="h-2 flex-1 rounded-full bg-[#E3E4DF]" />
          <span className="h-2 flex-1 rounded-full bg-[#E3E4DF]" />
        </div>
      </div>
      <Eyebrow>
        <span className="mt-6 block">{fromProfile ? 'Settings · Reminders' : 'Step 1 · Reminders'}</span>
      </Eyebrow>
      <Question className="mt-2 text-[30px]">What time should I remind you to check in?</Question>

      <div className="relative h-[118px] shrink-0">
        <div className="absolute -left-[80px] top-0 rotate-[14deg]">
          <Mascot mood="peek" size={150} look={4} />
        </div>
        <div className="absolute left-[78px] top-7 rounded-[22px] rounded-bl-md bg-white px-4 py-3 text-[14px] font-bold text-ink shadow-[0_10px_24px_-14px_rgba(17,19,17,0.6)]">
          I'll give you a gentle nudge
          <span className="block text-[12px] font-semibold text-mist">
            at {hours[h]}:{mins[m]} {ap ? 'PM' : 'AM'} · {days.filter(Boolean).length} days a week
          </span>
        </div>
      </div>

      <div className="relative flex items-center justify-center rounded-[32px] bg-white px-4 py-4 shadow-[0_16px_36px_-20px_rgba(17,19,17,0.55)]">
        <div className="absolute inset-x-4 top-1/2 h-[46px] -translate-y-1/2 rounded-2xl bg-peri-soft" />
        <Wheel items={hours} value={h} onChange={setH} />
        <span className="z-10 -mt-1 font-display text-[28px] font-semibold text-peri">:</span>
        <Wheel items={mins} value={m} onChange={setM} />
        <Wheel items={['AM', 'PM']} value={ap} onChange={setAp} width={70} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <button
            key={i}
            onClick={() => setDays((v) => v.map((x, j) => (j === i ? !x : x)))}
            aria-pressed={days[i]}
            className={`h-10 w-10 rounded-full text-[14px] font-extrabold transition ${days[i] ? 'bg-lav-soft text-[#5E7A12] ring-2 ring-lav-2' : 'bg-white text-mist'}`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <PillButton onClick={save}>{fromProfile ? 'Save reminder' : 'Continue'}</PillButton>
        <button
          onClick={() => (fromProfile ? back() : go('login'))}
          className="mx-auto mt-4 block text-[15px] font-bold text-mist hover:text-ink"
        >
          {fromProfile ? 'Cancel' : 'Skip for now'}
        </button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 3 Login */

export function AuthInput({
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  trailing,
}: {
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
  trailing?: React.ReactNode
}) {
  return (
    <label className="flex h-14 items-center gap-3 rounded-full bg-white px-5 shadow-[0_10px_20px_-14px_rgba(17,19,17,0.6)]">
      <span className="text-mist">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[16px] font-semibold text-ink outline-none placeholder:text-mist"
      />
      {trailing}
    </label>
  )
}

export function Login() {
  const { go, data, update, toast } = useApp()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState(data.profile.email)
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const signIn = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Please enter a valid email.')
    if (pw.length < 6) return setErr('Password needs at least 6 characters.')
    update((d) => ({ ...d, profile: { ...d.profile, email } }))
    go('home')
  }
  const social = (p: string) => {
    toast(`Signed in with ${p}`)
    go('home')
  }
  return (
    <div className="absolute inset-0">
      <BackButton className="absolute left-5 top-[56px] z-30" />
      <Sparkle size={22} className="wm-twinkle absolute left-16 top-32" />
      <Sparkle size={14} color="#A8E3D7" className="wm-twinkle absolute right-16 top-24" style={{ animationDelay: '1s' }} />
      <div className="absolute right-8 top-[132px] rounded-[20px] rounded-bl-md bg-white px-4 py-2.5 text-[14px] font-bold text-ink shadow-[0_10px_24px_-14px_rgba(17,19,17,0.6)]">
        {err ? 'Oops, let me help!' : 'Welcome back, champ!'}
      </div>
      <div className="absolute left-1/2 top-[120px] -translate-x-[62%]">
        <Mascot mood={err ? 'curious' : 'peek'} size={200} look={2} />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[560px] wm-dots-light rounded-t-[40px] bg-ink px-7 pt-10">
        <div className="absolute -top-[9px] left-1/2 h-[22px] w-[34px] -translate-x-[78px] rounded-full bg-lav" />
        <div className="absolute -top-[9px] left-1/2 h-[22px] w-[34px] -translate-x-[10px] rounded-full bg-lav" />

        <h2 className="font-display text-[36px] font-semibold leading-none text-white">Log <span className="text-lav">in</span></h2>
        <p className="mt-2 text-[15px] font-semibold text-white/80">Good to see you. Let's check in.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            signIn()
          }}
        >
          <div className="mt-6 space-y-3">
            <AuthInput icon={<Mail size={20} />} value={email} onChange={(v) => (setEmail(v), setErr(''))} placeholder="Email" type="email" />
            <AuthInput
              icon={<Lock size={20} />}
              value={pw}
              onChange={(v) => (setPw(v), setErr(''))}
              placeholder="Password"
              type={show ? 'text' : 'password'}
              trailing={
                <button type="button" onClick={() => setShow((s) => !s)} className="text-mist hover:text-peri" aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="min-h-[18px] text-[13px] font-extrabold text-[#F5A3BC]">{err}</p>
            <button type="button" onClick={() => go('forgot')} className="shrink-0 text-[14px] font-bold text-white/90 hover:text-white">
              Forgot password?
            </button>
          </div>
          <button
            type="submit"
            className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-lav text-[17px] font-extrabold text-ink transition hover:bg-lav-2 active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[13px] font-bold text-white/70">
          <span className="h-px flex-1 bg-white/40" /> or continue with <span className="h-px flex-1 bg-white/40" />
        </div>
        <div className="flex gap-3">
          {['Apple', 'Google'].map((p) => (
            <button key={p} onClick={() => social(p)} className="h-12 flex-1 rounded-full bg-white/5 text-[15px] font-extrabold text-white ring-1 ring-white/25 hover:bg-white/15">
              {p}
            </button>
          ))}
        </div>
        <p className="mt-5 text-center text-[15px] font-semibold text-white/85">
          Don't have an account?{' '}
          <button onClick={() => go('register')} className="font-extrabold text-white underline underline-offset-4">
            Register
          </button>
        </p>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 4 Home */

function ReportCard({
  icon,
  title,
  sub,
  action,
  highlight,
  onClick,
  done,
}: {
  icon: React.ReactNode
  tint?: string
  title: string
  sub: string
  action?: React.ReactNode
  highlight?: boolean
  onClick?: () => void
  done?: boolean
}) {
  return (
    <div
      className={`relative z-10 flex items-center gap-3.5 rounded-[26px] p-3.5 ${highlight ? 'bg-lav' : 'bg-white shadow-[0_14px_30px_-24px_rgba(17,19,17,0.45)]'}`}
    >
      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${highlight ? 'bg-ink text-lav' : 'bg-ice text-ink'}`}>
        {icon}
        {done && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-leaf text-white ring-2 ring-white">
            <Check size={11} strokeWidth={4} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-extrabold tracking-tight text-ink">{title}</p>
        <p className={`truncate text-[13px] font-semibold ${highlight ? 'text-ink/65' : 'text-mist'}`}>{sub}</p>
      </div>
      {action ?? <ArrowButton onClick={onClick} label={`Add ${title}`} />}
    </div>
  )
}

function WeekChart() {
  const { data, go } = useApp()
  const byDate = new Map(data.wellness.map((w) => [w.date, w]))
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6))
  const scores = days.map((d) => byDate.get(dateKey(d))?.score ?? 0)
  const logged = scores.filter(Boolean)
  const thisAvg = logged.length ? Math.round(logged.reduce((x, y) => x + y, 0) / logged.length) : 0
  const prevDays = Array.from({ length: 7 }, (_, i) => byDate.get(dateKey(addDays(new Date(), i - 13)))?.score ?? 0).filter(Boolean)
  const prevAvg = prevDays.length ? Math.round(prevDays.reduce((x, y) => x + y, 0) / prevDays.length) : thisAvg
  const delta = thisAvg - prevAvg
  // smooth trend line through bar tops
  const pts = scores.map((v, i) => [i * (100 / 6), 100 - (v ? v : 40) * 0.9] as const)
  const path = pts.map(([x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [px, py] = pts[i - 1]
    const cx = (px + x) / 2
    return `C${cx},${py} ${cx},${y} ${x},${y}`
  }).join(' ')
  return (
    <button onClick={() => go('stats')} className="wm-dots-light block w-full rounded-[28px] bg-ink p-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-bold text-white/55">Readiness · 7 days</p>
          <p className="font-display text-[28px] font-semibold leading-tight text-white">{thisAvg ? `${thisAvg}%` : '—'}</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-[13px] font-extrabold ${delta >= 0 ? 'bg-lav text-ink' : 'bg-white text-ink'}`}>
          {delta >= 0 ? '+' : ''}
          {delta}% vs last week
        </span>
      </div>
      <div className="relative mt-3 h-[112px]">
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {scores.map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div
                className={`w-full rounded-full ${i === 6 ? 'bg-lav' : v ? 'bg-white' : 'border border-dashed border-white/35'}`}
                style={{ height: `${Math.max(14, v * 0.82)}%` }}
              />
              <span className={`text-[10px] font-extrabold ${i === 6 ? 'text-lav' : 'text-white/50'}`}>
                {days[i].toLocaleDateString('en-US', { weekday: 'narrow' })}
              </span>
            </div>
          ))}
        </div>
        <svg className="pointer-events-none absolute inset-x-[6%] top-0 h-[85%] w-[88%] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={path} fill="none" stroke="#5CC9B3" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
        </svg>
      </div>
      <div className="mt-2 flex gap-4 text-[11px] font-bold text-white/60">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-leaf-2" /> Trend</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-lav" /> Today</span>
      </div>
    </button>
  )
}

export function HomeScreen() {
  const { go, streak, data, setAnswers } = useApp()
  const today = todayKey()
  const todayWellness = data.wellness.find((w) => w.date === today)
  const doneRpe = data.rpe.some((r) => r.date === today)
  const donePart = data.participation.some((r) => r.date === today)
  const doneInj = data.injuries.some((r) => r.date === today)
  const doneCount = [todayWellness, doneRpe, donePart, doneInj].filter(Boolean).length
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Ready for today?' : hour < 18 ? 'How is your day going?' : 'Time to wind down?'

  const startWellness = () => {
    if (todayWellness) {
      const { date: _d, time: _t, score: _s, ...a } = todayWellness
      setAnswers(a)
    }
    go('readiness')
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28 pt-[56px]">
        <div className="flex items-center gap-3">
          <BackButton />
          <span className="rounded-full bg-white px-3.5 py-2 text-[13px] font-bold text-ink ring-1 ring-ink/10">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className="flex-1" />
          <button
            onClick={() => go('notifications')}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink ring-1 ring-ink/10 hover:bg-ink hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {!data.notifRead && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-lav ring-2 ring-white" />}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="font-display text-[30px] font-semibold leading-[1.05] text-ink">Hi, {data.profile.name}</h1>
            <p className="mt-1 text-[15px] font-semibold text-mist">{hello}</p>
          </div>
          <Mascot mood="wave" size={80} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => go('stats')} className="flex flex-col rounded-[26px] bg-white p-4 text-left shadow-[0_14px_30px_-24px_rgba(17,19,17,0.45)]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white"><Activity size={14} strokeWidth={2.75} /></span>
                Today
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-ink/25"><ArrowUpRight size={16} /></span>
            </div>
            <p className="mt-4 font-display text-[32px] font-semibold leading-none text-ink">
              {todayWellness ? todayWellness.score : '—'}
              <span className="text-[16px] text-mist">{todayWellness ? '%' : ''}</span>
            </p>
            <div className="mt-3 flex h-2 gap-1 overflow-hidden rounded-full">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`flex-1 rounded-full ${i < doneCount ? (i === doneCount - 1 ? 'bg-lav' : 'bg-leaf') : 'bg-ice'}`} />
              ))}
            </div>
            <span className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-mist">
              <span className="h-2 w-2 rounded-full bg-leaf" /> {doneCount} of 4 reports
            </span>
          </button>
          <button onClick={() => go('calendar')} className="flex flex-col rounded-[26px] bg-lav p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-lav"><Flame size={14} strokeWidth={2.75} /></span>
                Streak
              </span>
            </div>
            <p className="mt-4 font-display text-[32px] font-semibold leading-none text-ink">
              {streak}
              <span className="text-[16px] text-ink/55"> days</span>
            </p>
            <div className="mt-auto flex items-center pt-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={`-ml-1 h-6 w-6 rounded-full ring-2 ring-lav first:ml-0 ${i < Math.min(streak, 5) ? 'bg-ink' : 'bg-white/60'}`} />
              ))}
              <span className="ml-auto flex h-7 min-w-7 items-center justify-center rounded-full bg-ink px-2 text-[11px] font-extrabold text-white">
                {streak > 5 ? `+${streak - 5}` : `${streak}/5`}
              </span>
            </div>
          </button>
        </div>

        <div className="mt-3">
          <WeekChart />
        </div>

        <div className="mt-6 flex items-end justify-between">
          <h3 className="font-display text-[20px] font-semibold text-ink">Daily report</h3>
          <span className="rounded-full bg-white px-3 py-1 text-[12px] font-extrabold text-ink ring-1 ring-ink/10">{doneCount} of 4 done</span>
        </div>

        <div className="mt-3 space-y-3">
          <div className="relative pt-[46px]">
            <div className="absolute -top-2 right-[96px] z-0">
              <Mascot mood="peek" size={80} look={-2} />
            </div>
            <ReportCard
              highlight
              icon={<HeartPulse size={22} strokeWidth={2.5} />}
              title="Daily Wellness"
              done={!!todayWellness}
              sub={todayWellness ? `Done today · ${todayWellness.score}%` : 'Due today · 2 min'}
              action={
                <button
                  onClick={startWellness}
                  className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-ink pl-4 pr-3 text-[14px] font-extrabold text-white hover:bg-black"
                >
                  {todayWellness ? 'Edit' : 'Start'} <ChevronRight size={16} strokeWidth={3} />
                </button>
              }
            />
          </div>
          <ReportCard
            icon={<Activity size={22} strokeWidth={2.5} />}
            title="Session RPE"
            sub={`Latest: ${latestLabel(data.rpe.map((r) => r.date))}`}
            done={doneRpe}
            onClick={() => go('rpe')}
          />
          <ReportCard
            icon={<Users size={22} strokeWidth={2.5} />}
            title="Participation"
            sub={`Latest: ${latestLabel(data.participation.map((r) => r.date))}`}
            done={donePart}
            onClick={() => go('participation')}
          />
          <ReportCard
            icon={<Bandage size={22} strokeWidth={2.5} />}
            title="Injury Report"
            sub={`Latest: ${latestLabel(data.injuries.map((r) => r.date))}`}
            done={doneInj}
            onClick={() => go('injury')}
          />
        </div>
      </div>
      <TabBar active="home" />
    </div>
  )
}

/* ---------------------------------------------------------------- 5 Readiness */

const READY_LABELS = ['Not ready', 'Exhausted', 'Very low', 'Low', 'Below par', 'Okay', 'Decent', 'Good', 'Very good', 'Great', 'Max ready']
function readyMood(v: number): MascotMood {
  if (v <= 1) return 'dizzy'
  if (v <= 3) return 'sleepy'
  if (v <= 5) return 'tired'
  if (v <= 7) return 'content'
  if (v <= 9) return 'happy'
  return 'pumped'
}

export function Readiness() {
  const { answers, set, go, back, goHome } = useApp()
  const v = answers.readiness
  const pct = v * 10
  return (
    <div className="absolute inset-0 px-6 pt-[116px]">
      <WellnessTopBar step={1} onBack={back} onCancel={goHome} onNext={() => go('fatigue')} />
      <Eyebrow>Step 1 of 4 · Readiness</Eyebrow>
      <Question className="mt-2">How ready are you to train?</Question>

      <div className="relative mt-6 flex h-[290px] items-center justify-center">
        <div
          className="absolute h-[250px] w-[250px] rounded-full transition-colors duration-500"
          style={{
            background: `radial-gradient(circle, ${v >= 8 ? '#EAF9C2' : v >= 5 ? '#D8F1EC' : '#ECEDF3'} 0%, transparent 70%)`,
          }}
        />
        {v >= 10 && (
          <>
            <Sparkle size={26} className="wm-twinkle absolute left-10 top-8" />
            <Sparkle size={18} color="#5CC9B3" className="wm-twinkle absolute right-12 top-16" style={{ animationDelay: '.5s' }} />
            <Sparkle size={14} className="wm-twinkle absolute bottom-16 right-8" style={{ animationDelay: '1s' }} />
          </>
        )}
        {v >= 2 && v <= 3 && <Zzz className="right-[84px] top-[64px]" />}
        <div key={readyMood(v)} className="wm-pop relative">
          <div className="wm-float">
            <Mascot mood={readyMood(v)} size={200} />
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="font-display text-[56px] font-semibold leading-none text-ink">
          {v}
          <span className="text-[24px] text-mist">/10</span>
        </p>
        <span className="mt-2 inline-block rounded-full bg-lav-soft px-4 py-1.5 text-[14px] font-extrabold text-[#5E7A12]">{READY_LABELS[v]}</span>
      </div>

      <div className="relative mt-6">
        <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#E3E4DF]" />
        <div
          className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#D4F36B,#3DB8A0)]"
          style={{ width: `calc(${pct}% - ${(pct / 100) * 34 - 17}px)` }}
        />
        <input
          type="range"
          min={0}
          max={10}
          value={v}
          onChange={(e) => set('readiness', Number(e.target.value))}
          className="wm-range relative"
          aria-label="Training readiness"
        />
      </div>
      <div className="mt-1 flex justify-between px-[9px]">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => set('readiness', i)}
            className={`w-4 text-center text-[13px] font-extrabold ${i === v ? 'text-peri' : 'text-mist/70'}`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[13px] font-bold text-mist">
        <span>Not Ready</span>
        <span>Max Ready</span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 6 Fatigue & Soreness */

const FATIGUE = ['Very tired', 'More tired than normal', 'Normal', 'Fresh', 'Very fresh']
const SORENESS = ['Very sore', 'A bit sore', 'Normal muscles', 'Good', 'Great']
const soreMood: MascotMood[] = ['stressed', 'tired', 'neutral', 'content', 'happy']

export function FatigueSoreness() {
  const { answers, set, go, back, goHome } = useApp()
  const [tab, setTab] = useState<'fatigue' | 'soreness'>('fatigue')
  const labels = tab === 'fatigue' ? FATIGUE : SORENESS
  const moods = tab === 'fatigue' ? scaleMood : soreMood
  const value = answers[tab]
  return (
    <div className="absolute inset-0 px-6 pt-[116px]">
      <WellnessTopBar
        step={2}
        onBack={() => (tab === 'soreness' ? setTab('fatigue') : back())}
        onCancel={goHome}
        onNext={() => (tab === 'fatigue' ? setTab('soreness') : go('sleep'))}
      />
      <div className="flex rounded-full bg-white p-1.5 shadow-[0_8px_20px_-16px_rgba(17,19,17,0.8)]">
        {(['fatigue', 'soreness'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-10 flex-1 rounded-full text-[15px] font-extrabold capitalize transition ${tab === t ? 'bg-lav-soft text-[#5E7A12]' : 'text-mist'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <Eyebrow>
        <span className="mt-6 block">Step 2 of 4 · Body check</span>
      </Eyebrow>
      <Question className="mt-2">{tab === 'fatigue' ? 'How fatigued do you feel?' : 'How sore are your muscles?'}</Question>

      <div className="mt-5 space-y-3">
        {[5, 4, 3, 2, 1].map((n) => {
          const sel = value === n
          return (
            <button
              key={n}
              onClick={() => set(tab, n)}
              className={`flex h-[72px] w-full items-center gap-3 rounded-full pl-2 pr-5 text-left transition ${sel ? 'bg-peri text-white shadow-[0_14px_26px_-14px_rgba(17,19,17,1)]' : 'bg-white text-ink shadow-[0_10px_22px_-18px_rgba(17,19,17,0.8)] hover:ring-2 hover:ring-peri-soft'}`}
            >
              <span className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full ${sel ? 'bg-white/15' : 'bg-ice'}`}>
                <Mascot mood={moods[n - 1]} size={50} />
              </span>
              <span className={`text-[15px] font-extrabold ${sel ? 'text-white/70' : 'text-mist'}`}>{n}</span>
              <span className="flex-1 text-[16px] font-extrabold">{labels[n - 1]}</span>
              {sel ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lav text-ink">
                  <Check size={16} strokeWidth={3.5} />
                </span>
              ) : (
                <span className="h-7 w-7 rounded-full ring-2 ring-[#E3E4DF]" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 7 Sleep */

const QUALITY = ['Poor', 'Restless', 'Okay', 'Good', 'Deep']

export function Sleep() {
  const { answers, set, go, back, goHome } = useApp()
  return (
    <div className="absolute inset-0 px-6 pt-[116px]">
      <WellnessTopBar step={3} onBack={back} onCancel={goHome} onNext={() => go('stress')} />
      <Eyebrow>Step 3 of 4 · Sleep</Eyebrow>
      <div className="relative">
        <Question className="mt-2 pr-[120px]">How much did you sleep last night?</Question>
        <div className="absolute -right-3 -top-4">
          <div className="wm-float relative">
            <Mascot mood="sleeping" size={120} />
            <div className="absolute -bottom-1 left-2 right-2 h-5 rounded-full bg-lav-soft" />
          </div>
          <Zzz className="right-8 top-4" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {SLEEP_OPTIONS.map((o) => {
          const sel = answers.sleep === o
          return (
            <button
              key={o}
              onClick={() => set('sleep', o)}
              className={`h-[50px] rounded-full text-[17px] font-extrabold transition ${sel ? 'bg-peri text-white shadow-[0_12px_22px_-12px_rgba(17,19,17,1)]' : 'bg-white text-ink shadow-[0_8px_18px_-16px_rgba(17,19,17,0.9)] hover:ring-2 hover:ring-peri-soft'}`}
            >
              {o.replace('h', ' h')}
            </button>
          )
        })}
      </div>

      <div className="mt-7 rounded-[28px] bg-white p-5 shadow-[0_12px_28px_-20px_rgba(17,19,17,0.7)]">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-extrabold text-ink">And how well did you sleep?</p>
          <span className="rounded-full bg-lav-soft px-3 py-1 text-[12px] font-extrabold text-[#5E7A12]">{QUALITY[answers.sleepQuality - 1]}</span>
        </div>
        <div className="mt-4 flex justify-between">
          {[1, 2, 3, 4, 5].map((n) => {
            const on = n <= answers.sleepQuality
            return (
              <button
                key={n}
                onClick={() => set('sleepQuality', n)}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${on ? 'bg-ink text-lav' : 'bg-ice text-[#C9CBC4]'}`}
                aria-label={`Sleep quality ${n}`}
              >
                <Moon size={22} fill={on ? '#D4F36B' : 'none'} strokeWidth={2.5} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 8 Stress & Mood */

const STRESS = ['Highly stressed', 'Somewhat stressed', 'Normal', 'Relaxed', 'Very relaxed']
const MOOD = ['Very bad mood', 'Bad mood', 'Normal mood', 'Good mood', 'Very good mood']
const stressFaces: MascotMood[] = ['stressed', 'tired', 'neutral', 'content', 'happy']
const moodFaces: MascotMood[] = ['sad', 'down', 'neutral', 'content', 'happy']

function FaceRow({ title, labels, ends, faces, value, onChange }: { title: string; labels: string[]; ends: [string, string]; faces: MascotMood[]; value: number; onChange: (n: number) => void }) {
  return (
    <div className="rounded-[30px] bg-white p-5 shadow-[0_14px_30px_-22px_rgba(17,19,17,0.8)]">
      <p className="font-display text-[22px] font-semibold text-peri">{title}</p>
      <div className="mt-4 flex justify-between">
        {faces.map((f, i) => {
          const sel = value === i + 1
          return (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              className={`flex h-[56px] w-[56px] items-center justify-center rounded-full transition ${sel ? 'scale-110 bg-lav-soft ring-4 ring-lav-2' : 'bg-ice opacity-80 hover:opacity-100'}`}
              aria-label={labels[i]}
            >
              <Mascot mood={f} size={50} />
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-between text-[12px] font-bold text-mist">
        <span>{ends[0]}</span>
        <span className="rounded-full bg-lav-soft px-3 py-1 text-[13px] font-extrabold text-[#5E7A12]">
          {value} · {labels[value - 1]}
        </span>
        <span>{ends[1]}</span>
      </div>
    </div>
  )
}

export function StressMood() {
  const { answers, set, go, back, goHome } = useApp()
  const avg = (answers.stress + answers.mood) / 2
  const reaction: MascotMood = avg >= 4.5 ? 'cheer' : avg >= 3.5 ? 'content' : avg >= 2.5 ? 'neutral' : avg >= 1.5 ? 'down' : 'sad'
  return (
    <div className="absolute inset-0 px-6 pt-[116px]">
      <WellnessTopBar step={4} onBack={back} onCancel={goHome} onNext={() => go('review')} />
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Step 4 of 4 · Mind</Eyebrow>
          <Question className="mt-2">How's your mind today?</Question>
        </div>
        <div key={reaction} className="wm-pop -mb-2 -mr-2">
          <Mascot mood={reaction} size={96} />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <FaceRow title="How stressed are you?" labels={STRESS} ends={['Stressed', 'Calm']} faces={stressFaces} value={answers.stress} onChange={(n) => set('stress', n)} />
        <FaceRow title="What is your mood?" labels={MOOD} ends={['Low', 'Great']} faces={moodFaces} value={answers.mood} onChange={(n) => set('mood', n)} />
      </div>
      <p className="mt-5 text-center text-[13px] font-semibold text-mist">Your mascot buddy reacts to how you feel</p>
    </div>
  )
}

/* ---------------------------------------------------------------- 9 Review */

function StatusPill({ value, max, text }: { value: number; max: number; text?: string }) {
  const r = value / max
  const style = r >= 0.8 ? 'bg-[#DDF5EC] text-[#2E9E74]' : r >= 0.6 ? 'bg-peri-soft text-[#2A8C7A]' : r >= 0.4 ? 'bg-[#FFF1D9] text-[#C98417]' : 'bg-[#FFE5EC] text-[#D9567A]'
  return <span className={`min-w-[58px] rounded-full px-3 py-1 text-center text-[14px] font-extrabold ${style}`}>{text ?? `${value}/${max}`}</span>
}

export function Review() {
  const { answers: a, go, back, goHome, submitWellness } = useApp()
  const sleepH = parseFloat(a.sleep)
  const rows: { label: string; screen: Route; pill: React.ReactNode }[] = [
    { label: 'Readiness', screen: 'readiness', pill: <StatusPill value={a.readiness} max={10} /> },
    { label: 'Fatigue', screen: 'fatigue', pill: <StatusPill value={a.fatigue} max={5} /> },
    { label: 'Sleep Duration', screen: 'sleep', pill: <StatusPill value={sleepH >= 7 && sleepH <= 10 ? 5 : sleepH >= 6 ? 3 : 1} max={5} text={a.sleep} /> },
    { label: 'Sleep Quality', screen: 'sleep', pill: <StatusPill value={a.sleepQuality} max={5} /> },
    { label: 'Soreness', screen: 'fatigue', pill: <StatusPill value={a.soreness} max={5} /> },
    { label: 'Stress', screen: 'stress', pill: <StatusPill value={a.stress} max={5} /> },
    { label: 'Mood', screen: 'stress', pill: <StatusPill value={a.mood} max={5} /> },
  ]
  return (
    <div className="absolute inset-0 px-6 pt-[116px]">
      <WellnessTopBar step={5} onBack={back} onCancel={goHome} onNext={submitWellness} nextLabel="Submit" />
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Almost there</Eyebrow>
          <Question className="mt-2">Review and submit</Question>
          <p className="mt-1 text-[14px] font-semibold text-mist">Tap any row to change it.</p>
        </div>
      </div>

      <div className="relative mt-9">
        <div className="absolute -top-[54px] right-5">
          <Mascot mood="peek" size={84} look={-3} />
        </div>
        <div className="relative rounded-[30px] bg-white px-5 py-2 shadow-[0_16px_34px_-22px_rgba(17,19,17,0.8)]">
          <div className="flex items-center justify-between border-b-2 border-lav-soft py-3.5">
            <span className="text-[15px] font-bold text-mist">Date & Time</span>
            <span className="text-[15px] font-extrabold text-ink">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {nowTime()}</span>
          </div>
          {rows.map((r, i) => (
            <button
              key={r.label}
              onClick={() => go(r.screen)}
              className={`flex w-full items-center justify-between py-3 text-left ${i < rows.length - 1 ? 'border-b-2 border-lav-soft' : ''}`}
            >
              <span className="text-[16px] font-extrabold text-ink">{r.label}</span>
              <span className="flex items-center gap-2">
                {r.pill}
                <ChevronRight size={16} className="text-[#C9CBC4]" strokeWidth={3} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-10">
        <PillButton onClick={submitWellness}>Save & Submit</PillButton>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 10 Success */

const CONFETTI = [
  { l: 8, t: 12, c: '#D4F36B', r: 20, w: 10, h: 16 },
  { l: 22, t: 7, c: '#5CC9B3', r: -30, w: 8, h: 8, round: true },
  { l: 78, t: 9, c: '#FFC9DD', r: 40, w: 10, h: 16 },
  { l: 90, t: 20, c: '#E2F79A', r: -10, w: 9, h: 9, round: true },
  { l: 12, t: 32, c: '#BDE7D6', r: 60, w: 10, h: 16 },
  { l: 86, t: 38, c: '#5CC9B3', r: 15, w: 10, h: 16 },
  { l: 6, t: 52, c: '#FFD98A', r: -40, w: 8, h: 8, round: true },
  { l: 92, t: 56, c: '#D4F36B', r: 30, w: 8, h: 14 },
  { l: 38, t: 5, c: '#FFD98A', r: 10, w: 10, h: 16 },
  { l: 62, t: 14, c: '#BDE7D6', r: -50, w: 8, h: 8, round: true },
]

export function Success() {
  const { answers, goHome, streak, go } = useApp()
  const score = readinessScore(answers)
  const C = 2 * Math.PI * 34
  return (
    <div className="absolute inset-0 flex flex-col items-center px-6 pb-10 pt-[120px]">
      <BackButton className="absolute left-5 top-[56px] z-30" />
      {CONFETTI.map((p, i) => (
        <span
          key={i}
          className={`wm-sway absolute ${p.round ? 'rounded-full' : 'rounded-[3px]'}`}
          style={{ left: `${p.l}%`, top: `${p.t}%`, width: p.w, height: p.h, background: p.c, ['--r' as string]: `${p.r}deg`, animationDelay: `${i * 0.3}s` }}
        />
      ))}
      <Sparkle size={24} className="wm-twinkle absolute left-[26%] top-[26%]" />
      <Sparkle size={16} color="#5CC9B3" className="wm-twinkle absolute right-[24%] top-[22%]" style={{ animationDelay: '.7s' }} />

      <h2 className="font-display text-[38px] font-semibold text-peri">All done!</h2>
      <p className="mt-1 max-w-[320px] text-center text-[17px] font-bold leading-snug text-mist">Great job checking in today!</p>

      <div className="relative mt-20 w-full rounded-[36px] bg-lav px-6 pb-6 pt-[150px]">
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
          <div className="wm-float">
            <Mascot mood="cheer" size={200} />
          </div>
        </div>
        <div className="flex items-center gap-5 rounded-[28px] bg-white p-4">
          <div className="relative h-[88px] w-[88px] shrink-0">
            <svg viewBox="0 0 84 84" className="-rotate-90">
              <circle cx="42" cy="42" r="34" fill="none" stroke="#D8F1EC" strokeWidth="10" />
              <circle cx="42" cy="42" r="34" fill="none" stroke="#3DB8A0" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-[20px] font-semibold text-ink">{score}%</span>
          </div>
          <div>
            <p className="whitespace-nowrap text-[12px] font-extrabold uppercase tracking-[0.08em] text-mist">Readiness score</p>
            <p className="font-display text-[26px] font-semibold leading-tight text-leaf">{scoreLabel(score)}</p>
            <p className="text-[13px] font-semibold text-mist">Primed for a strong session.</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <span className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[14px] font-extrabold text-white">
            <Flame size={16} fill="#D4F36B" strokeWidth={2.5} /> {streak} Day Streak · keep it up!
          </span>
        </div>
      </div>

      <div className="mt-auto w-full">
        <PillButton onClick={goHome}>Back to Home</PillButton>
        <button onClick={() => go('stats')} className="mx-auto mt-4 block text-[15px] font-bold text-mist hover:text-ink">
          See my trends
        </button>
      </div>
    </div>
  )
}
