import { useState } from 'react'
import {
  Activity,
  Bandage,
  Bell,
  CalendarCheck,
  ChevronRight,
  Clock,
  Flame,
  HeartPulse,
  Lock,
  LogOut,
  Mail,
  Moon,
  RotateCcw,
  Smile,
  Trophy,
  User,
  Users,
  Volume2,
} from 'lucide-react'
import { Mascot, Sparkle } from './components/Mascot'
import { PillButton } from './components/Phone'
import { BackButton, Card, Chip, Page, Toggle } from './components/Nav'
import { AuthInput } from './screens'
import { addDays, dateKey, parseKey, resetData, scoreLabel, todayKey, useApp, type WellnessEntry } from './state'

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MINS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 mt-6 text-[13px] font-extrabold uppercase tracking-[0.12em] text-mist first:mt-0">{children}</p>
}

function scoreColor(s: number) {
  if (s >= 85) return '#5CC9B3'
  if (s >= 70) return '#FFFFFF'
  if (s >= 50) return '#E2F79A'
  return '#F5B8C9'
}

/* ================================================================ Register */

const SPORTS = ['Football', 'Basketball', 'Running', 'Swimming', 'Tennis', 'Cycling']

export function Register() {
  const { go, update, toast } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [sport, setSport] = useState('Football')
  const [err, setErr] = useState('')
  const create = () => {
    if (!name.trim()) return setErr('What should I call you?')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Please enter a valid email.')
    if (pw.length < 6) return setErr('Password needs at least 6 characters.')
    update((d) => ({ ...d, profile: { name: name.trim(), email, sport } }))
    toast(`Welcome to WellMate, ${name.trim()}!`)
    go('home')
  }
  return (
    <div className="wm-dots-light absolute inset-0 bg-ink">
      <div className="flex items-center gap-3 px-5 pt-[56px]">
        <BackButton light />
      </div>
      <div className="no-scrollbar h-[calc(100%-96px)] overflow-y-auto px-7 pb-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="mt-3 font-display text-[36px] font-semibold leading-none text-white">Regis<span className="text-lav">ter</span></h2>
            <p className="mt-2 text-[15px] font-semibold text-white/80">Let's set up your wellness buddy.</p>
          </div>
          <Mascot mood="wave" size={92} />
        </div>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            create()
          }}
        >
          <AuthInput icon={<User size={20} />} value={name} onChange={(v) => (setName(v), setErr(''))} placeholder="First name" />
          <AuthInput icon={<Mail size={20} />} value={email} onChange={(v) => (setEmail(v), setErr(''))} placeholder="Email" type="email" />
          <AuthInput icon={<Lock size={20} />} value={pw} onChange={(v) => (setPw(v), setErr(''))} placeholder="Password (6+ characters)" type="password" />
          <p className="pt-2 text-[14px] font-extrabold text-white">Your main sport</p>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSport(s)}
                className={`h-10 rounded-full px-4 text-[14px] font-extrabold transition ${sport === s ? 'bg-lav text-ink' : 'bg-white/5 text-white ring-1 ring-white/30'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="min-h-[20px] text-[13px] font-extrabold text-[#F5A3BC]">{err}</p>
          <button type="submit" className="flex h-14 w-full items-center justify-center rounded-full bg-lav text-[17px] font-extrabold text-ink hover:bg-lav-2">
            Create account
          </button>
        </form>
      </div>
    </div>
  )
}

/* ================================================================ Forgot password */

export function Forgot() {
  const { back, data } = useApp()
  const [email, setEmail] = useState(data.profile.email)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  return (
    <Page title="Reset password">
      <div className="flex flex-col items-center pt-6 text-center">
        <div className="relative">
          <Mascot mood={sent ? 'cheer' : 'curious'} size={160} />
          {sent && <Sparkle size={22} className="wm-twinkle absolute -right-2 top-4" />}
        </div>
        <h2 className="mt-4 font-display text-[26px] font-semibold text-peri">{sent ? 'Check your inbox!' : 'Forgot your password?'}</h2>
        <p className="mt-2 max-w-[290px] text-[15px] font-semibold text-mist">
          {sent ? `I sent a reset link to ${email}. It expires in 30 minutes.` : "No worries. Enter your email and I'll send you a reset link."}
        </p>
      </div>
      {!sent ? (
        <form
          className="mt-8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Please enter a valid email.')
            setSent(true)
          }}
        >
          <AuthInput icon={<Mail size={20} />} value={email} onChange={(v) => (setEmail(v), setErr(''))} placeholder="Email" type="email" />
          <p className="min-h-[20px] px-2 text-[13px] font-extrabold text-[#D9567A]">{err}</p>
          <PillButton>Send reset link</PillButton>
        </form>
      ) : (
        <div className="mt-8 space-y-3">
          <PillButton onClick={back}>Back to log in</PillButton>
          <button onClick={() => setSent(false)} className="mx-auto block text-[15px] font-bold text-mist hover:text-ink">
            Didn't get it? Send again
          </button>
        </div>
      )}
    </Page>
  )
}

/* ================================================================ Notifications */

export function Notifications() {
  const { data, update, go, streak } = useApp()
  const doneToday = data.wellness.some((w) => w.date === todayKey())
  const r = data.reminder
  const items = [
    !doneToday && {
      icon: <HeartPulse size={20} color="#5E7A12" />,
      tint: '#F1FBD6',
      title: 'Time for your daily check-in',
      body: 'It only takes 2 minutes. Your coach is waiting!',
      when: `${HOURS[r.hour]}:${MINS[r.minute]} ${r.pm ? 'PM' : 'AM'}`,
      action: () => go('readiness'),
    },
    {
      icon: <Flame size={20} color="#EE8E5A" />,
      tint: '#FFEADB',
      title: `${streak} day streak!`,
      body: 'You are on a roll. Keep checking in daily.',
      when: 'Today',
      action: () => go('calendar'),
    },
    {
      icon: <Users size={20} color="#3DB8A0" />,
      tint: '#DDF5EC',
      title: 'Coach Maya viewed your report',
      body: 'Great sleep this week. Keep it up before Saturday.',
      when: 'Yesterday',
      action: () => go('stats'),
    },
    {
      icon: <Activity size={20} color="#3DB8A0" />,
      tint: '#D8F1EC',
      title: 'Log yesterday’s session RPE',
      body: 'Rate how hard training felt to track your load.',
      when: '2 days ago',
      action: () => go('rpe'),
    },
  ].filter(Boolean) as { icon: React.ReactNode; tint: string; title: string; body: string; when: string; action: () => void }[]

  return (
    <Page
      title="Notifications"
      right={
        <button
          onClick={() => update((d) => ({ ...d, notifRead: true }))}
          disabled={data.notifRead}
          className="text-[14px] font-extrabold text-peri disabled:text-mist"
        >
          {data.notifRead ? 'All read' : 'Mark all read'}
        </button>
      }
    >
      <div className="space-y-3">
        {items.map((n, i) => (
          <button key={n.title} onClick={n.action} className="flex w-full items-start gap-3 rounded-[24px] bg-white p-4 text-left shadow-[0_10px_24px_-20px_rgba(17,19,17,0.9)]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: n.tint }}>
              {n.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="flex-1 text-[15px] font-extrabold text-ink">{n.title}</span>
                {!data.notifRead && i < 2 && <span className="h-2.5 w-2.5 rounded-full bg-lav" />}
              </span>
              <span className="mt-0.5 block text-[13px] font-semibold text-mist">{n.body}</span>
              <span className="mt-1 block text-[12px] font-bold text-[#5E7A12]">{n.when}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center text-center">
        <Mascot mood="sleeping" size={90} />
        <p className="mt-2 text-[13px] font-semibold text-mist">That's everything for now.</p>
      </div>
    </Page>
  )
}

/* ================================================================ Session RPE */

const RPE_LABELS = ['Rest', 'Very, very easy', 'Easy', 'Moderate', 'Somewhat hard', 'Hard', 'Hard', 'Very hard', 'Very hard', 'Very, very hard', 'Maximal']
const DURATIONS = [30, 45, 60, 75, 90, 120]
const SESSION_TYPES = ['Training', 'Match', 'Gym', 'Recovery']

export function SessionRpe() {
  const { data, update, back, toast } = useApp()
  const today = todayKey()
  const existing = data.rpe.find((r) => r.date === today)
  const [rpe, setRpe] = useState(existing?.rpe ?? 6)
  const [minutes, setMinutes] = useState(existing?.minutes ?? 75)
  const [type, setType] = useState(existing?.type ?? 'Training')
  const mood = rpe <= 2 ? 'content' : rpe <= 5 ? 'neutral' : rpe <= 8 ? 'tired' : 'dizzy'
  const save = () => {
    update((d) => ({ ...d, rpe: [...d.rpe.filter((r) => r.date !== today), { date: today, rpe, minutes, type }] }))
    toast(`Session saved · load ${rpe * minutes} AU`)
    back()
  }
  return (
    <Page title="Session RPE" footer={<PillButton onClick={save}>{existing ? 'Update session' : 'Save session'}</PillButton>}>
      <Card className="flex items-center gap-4">
        <div key={mood} className="wm-pop">
          <Mascot mood={mood} size={92} />
        </div>
        <div>
          <p className="text-[14px] font-bold text-mist">How hard was today's session?</p>
          <p className="font-display text-[40px] font-semibold leading-none text-ink">
            {rpe}
            <span className="text-[20px] text-mist">/10</span>
          </p>
          <span className="mt-1 inline-block rounded-full bg-lav-soft px-3 py-1 text-[13px] font-extrabold text-[#5E7A12]">{RPE_LABELS[rpe]}</span>
        </div>
      </Card>
      <div className="mt-4 grid grid-cols-6 gap-2">
        {RPE_LABELS.map((_, i) => (
          <button
            key={i}
            onClick={() => setRpe(i)}
            className={`h-11 rounded-full text-[15px] font-extrabold transition ${i === rpe ? 'bg-peri text-white shadow-[0_10px_18px_-10px_rgba(17,19,17,1)]' : 'bg-white text-ink'} ${i === 10 ? 'col-span-1' : ''}`}
          >
            {i}
          </button>
        ))}
      </div>
      <SectionLabel>Duration</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {DURATIONS.map((m) => (
          <Chip key={m} on={minutes === m} onClick={() => setMinutes(m)}>
            {m} min
          </Chip>
        ))}
      </div>
      <SectionLabel>Session type</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {SESSION_TYPES.map((t) => (
          <Chip key={t} on={type === t} onClick={() => setType(t)}>
            {t}
          </Chip>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-[22px] bg-peri-soft px-5 py-3">
        <span className="text-[14px] font-bold text-[#2A8C7A]">Training load</span>
        <span className="font-display text-[22px] font-semibold text-peri">{rpe * minutes} AU</span>
      </div>
    </Page>
  )
}

/* ================================================================ Participation */

const PART_OPTIONS = [
  { id: 'Full', desc: 'Completed the whole session', mood: 'happy' as const },
  { id: 'Modified', desc: 'Took part with adjustments', mood: 'content' as const },
  { id: 'Missed', desc: "Couldn't take part today", mood: 'down' as const },
  { id: 'Rest day', desc: 'Planned recovery day', mood: 'sleeping' as const },
]
const REASONS = ['Injury', 'Illness', 'School / work', 'Travel', 'Personal']

export function Participation() {
  const { data, update, back, toast } = useApp()
  const today = todayKey()
  const existing = data.participation.find((r) => r.date === today)
  const [status, setStatus] = useState(existing?.status ?? 'Full')
  const [reason, setReason] = useState(existing?.reason ?? '')
  const needsReason = status === 'Missed' || status === 'Modified'
  const save = () => {
    update((d) => ({
      ...d,
      participation: [...d.participation.filter((r) => r.date !== today), { date: today, status, reason: needsReason ? reason : undefined }],
    }))
    toast('Participation saved')
    back()
  }
  return (
    <Page title="Participation" footer={<PillButton onClick={save}>Save participation</PillButton>}>
      <h2 className="font-display text-[24px] font-semibold leading-tight text-peri">Did you take part in today's session?</h2>
      <div className="mt-5 space-y-3">
        {PART_OPTIONS.map((o) => {
          const sel = status === o.id
          return (
            <button
              key={o.id}
              onClick={() => setStatus(o.id)}
              className={`flex h-[72px] w-full items-center gap-3 rounded-full pl-2 pr-5 text-left transition ${sel ? 'bg-peri text-white shadow-[0_14px_26px_-14px_rgba(17,19,17,1)]' : 'bg-white text-ink'}`}
            >
              <span className={`flex h-14 w-14 items-center justify-center rounded-full ${sel ? 'bg-white/25' : 'bg-ice'}`}>
                <Mascot mood={o.mood} size={50} />
              </span>
              <span className="flex-1">
                <span className="block text-[16px] font-extrabold">{o.id}</span>
                <span className={`block text-[13px] font-semibold ${sel ? 'text-white/75' : 'text-mist'}`}>{o.desc}</span>
              </span>
            </button>
          )
        })}
      </div>
      {needsReason && (
        <>
          <SectionLabel>What was the reason?</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <Chip key={r} on={reason === r} onClick={() => setReason(r)}>
                {r}
              </Chip>
            ))}
          </div>
        </>
      )}
    </Page>
  )
}

/* ================================================================ Injury */

const AREAS = ['Head', 'Neck', 'Shoulder', 'Arm', 'Back', 'Hip', 'Hamstring', 'Quad', 'Knee', 'Calf', 'Ankle', 'Foot']

export function Injury() {
  const { update, back, toast } = useApp()
  const [area, setArea] = useState('')
  const [side, setSide] = useState('Left')
  const [pain, setPain] = useState(3)
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const save = () => {
    if (!area) return setErr('Pick the area that hurts first.')
    update((d) => ({ ...d, injuries: [...d.injuries, { date: todayKey(), area, side, pain, note }] }))
    toast(pain >= 7 ? 'Report sent. Your physio has been notified.' : 'Injury report saved')
    back()
  }
  return (
    <Page title="Injury Report" footer={<PillButton onClick={save}>Submit report</PillButton>}>
      <div className="flex items-center gap-3">
        <h2 className="flex-1 font-display text-[24px] font-semibold leading-tight text-peri">Where does it hurt?</h2>
        <Mascot mood={pain >= 7 ? 'sad' : pain >= 4 ? 'stressed' : 'curious'} size={76} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {AREAS.map((a) => (
          <button
            key={a}
            onClick={() => (setArea(a), setErr(''))}
            className={`h-11 rounded-full text-[14px] font-extrabold transition ${area === a ? 'bg-peri text-white' : 'bg-white text-ink'}`}
          >
            {a}
          </button>
        ))}
      </div>
      {err && <p className="mt-2 text-[13px] font-extrabold text-[#D9567A]">{err}</p>}
      <SectionLabel>Side</SectionLabel>
      <div className="flex rounded-full bg-white p-1.5">
        {['Left', 'Right', 'Both', 'N/A'].map((s) => (
          <button key={s} onClick={() => setSide(s)} className={`h-9 flex-1 rounded-full text-[14px] font-extrabold ${side === s ? 'bg-lav-soft text-[#5E7A12]' : 'text-mist'}`}>
            {s}
          </button>
        ))}
      </div>
      <SectionLabel>Pain level · {pain}/10</SectionLabel>
      <input type="range" min={1} max={10} value={pain} onChange={(e) => setPain(Number(e.target.value))} className="wm-range" aria-label="Pain level" />
      <div className="flex justify-between text-[12px] font-bold text-mist">
        <span>Mild</span>
        <span>Severe</span>
      </div>
      <SectionLabel>Notes (optional)</SectionLabel>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="When did it start? What makes it worse?"
        rows={3}
        className="w-full resize-none rounded-[22px] bg-white p-4 text-[15px] font-semibold text-ink outline-none placeholder:text-mist focus:ring-2 focus:ring-peri-soft"
      />
    </Page>
  )
}

/* ================================================================ Stats */

export function Stats() {
  const { data, go } = useApp()
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6))
  const byDate = new Map(data.wellness.map((w) => [w.date, w]))
  const week = days.map((d) => byDate.get(dateKey(d)))
  const logged = week.filter(Boolean) as WellnessEntry[]
  const avg = (f: (w: WellnessEntry) => number) => (logged.length ? logged.reduce((s, w) => s + f(w), 0) / logged.length : 0)
  const weekKeys = new Set(days.map(dateKey))
  const load = data.rpe.filter((r) => weekKeys.has(r.date)).reduce((s, r) => s + r.rpe * r.minutes, 0)
  const avgScore = Math.round(avg((w) => w.score))
  const tiles = [
    { label: 'Avg readiness', value: `${avg((w) => w.readiness).toFixed(1)}/10`, icon: <HeartPulse size={18} color="#D4F36B" />, tint: '#F1FBD6' },
    { label: 'Avg sleep', value: `${avg((w) => parseFloat(w.sleep)).toFixed(1)} h`, icon: <Moon size={18} color="#3DB8A0" />, tint: '#D8F1EC' },
    { label: 'Avg mood', value: `${avg((w) => w.mood).toFixed(1)}/5`, icon: <Smile size={18} color="#3DB8A0" />, tint: '#DDF5EC' },
    { label: 'Training load', value: `${load} AU`, icon: <Activity size={18} color="#EE8E5A" />, tint: '#FFEADB' },
  ]
  return (
    <Page title="Your trends" tab="stats">
      <div className="wm-dots-light rounded-[28px] bg-ink p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] font-bold text-white/55">Readiness · 7 days</p>
            <p className="mt-1 font-display text-[32px] font-semibold leading-none text-white">
              {logged.length ? `${avgScore}%` : '—'}
              <span className="ml-2 rounded-full bg-lav px-2.5 py-0.5 align-middle font-sans text-[12px] font-extrabold text-ink">{logged.length ? scoreLabel(avgScore) : 'No data yet'}</span>
            </p>
          </div>
          <Mascot mood={avgScore >= 85 ? 'happy' : avgScore >= 70 ? 'content' : 'tired'} size={64} />
        </div>
        <div className="mt-5 flex h-[140px] items-end justify-between gap-2">
          {week.map((w, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-extrabold text-white/60">{w ? w.score : ''}</span>
              <div
                className="w-full rounded-full transition-all"
                style={{ height: w ? `${Math.max(12, w.score)}px` : '10px', background: w ? (i === 6 ? '#D4F36B' : scoreColor(w.score)) : 'rgba(255,255,255,0.12)' }}
              />
              <span className={`text-[12px] font-extrabold ${i === 6 ? 'text-lav' : 'text-white/50'}`}>
                {i === 6 ? 'Today' : days[i].toLocaleDateString('en-US', { weekday: 'narrow' })}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[11px] font-bold text-white/60">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-leaf-2" /> Primed</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white" /> Good</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-lav-2" /> Fair</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <Card key={t.label} className={`!p-4 ${t.label === 'Avg readiness' ? '!bg-lav' : ''}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: t.label === 'Avg readiness' ? '#121412' : t.tint }}>
              {t.icon}
            </span>
            <p className="mt-3 font-display text-[22px] font-semibold text-ink">{t.value}</p>
            <p className={`text-[13px] font-bold ${t.label === 'Avg readiness' ? 'text-ink/60' : 'text-mist'}`}>{t.label}</p>
          </Card>
        ))}
      </div>
      <SectionLabel>Recent sessions</SectionLabel>
      <Card className="!py-2">
        {data.rpe.length === 0 && <p className="py-3 text-[14px] font-semibold text-mist">No sessions logged yet.</p>}
        {[...data.rpe]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 4)
          .map((r, i, arr) => (
            <div key={r.date + i} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b-2 border-lav-soft' : ''}`}>
              <div>
                <p className="text-[15px] font-extrabold text-ink">{r.type}</p>
                <p className="text-[12px] font-bold text-mist">
                  {parseKey(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {r.minutes} min
                </p>
              </div>
              <span className="rounded-full bg-ink px-3 py-1 text-[13px] font-extrabold text-white">RPE {r.rpe}</span>
            </div>
          ))}
      </Card>
      {data.injuries.length > 0 && (
        <>
          <SectionLabel>Injury reports</SectionLabel>
          <Card className="!py-2">
            {[...data.injuries].reverse().slice(0, 3).map((inj, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <span className="flex items-center gap-2 text-[15px] font-extrabold text-ink">
                  <Bandage size={16} color="#EC6F8E" /> {inj.area} · {inj.side}
                </span>
                <span className="rounded-full bg-[#FFE5EC] px-3 py-1 text-[13px] font-extrabold text-[#D9567A]">Pain {inj.pain}/10</span>
              </div>
            ))}
          </Card>
        </>
      )}
      <button onClick={() => go('calendar')} className="mt-4 flex w-full items-center justify-center gap-1 text-[14px] font-extrabold text-peri">
        Open calendar <ChevronRight size={16} />
      </button>
    </Page>
  )
}

/* ================================================================ Calendar */

export function Calendar() {
  const { data, go, setAnswers } = useApp()
  const now = new Date()
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selected, setSelected] = useState(todayKey())
  const byDate = new Map(data.wellness.map((w) => [w.date, w]))
  const first = month.getDay() === 0 ? 6 : month.getDay() - 1 // Monday-first
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const sel = byDate.get(selected)
  const rpe = data.rpe.find((r) => r.date === selected)
  const part = data.participation.find((r) => r.date === selected)
  const isToday = selected === todayKey()
  const isFuture = selected > todayKey()

  const editDay = () => {
    if (sel) {
      const { date: _d, time: _t, score: _s, ...a } = sel
      setAnswers(a)
    }
    go('readiness')
  }

  return (
    <Page title="Calendar" tab="calendar">
      <Card className="!bg-lav">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink ring-1 ring-ink/30 hover:bg-ink hover:text-lav"
            aria-label="Previous month"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <p className="font-display text-[20px] font-semibold text-ink">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          <button
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink ring-1 ring-ink/30 hover:bg-ink hover:text-lav"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="pb-1 text-[12px] font-extrabold text-ink/55">
              {d}
            </span>
          ))}
          {cells.map((day, i) => {
            if (!day) return <span key={i} />
            const k = dateKey(new Date(month.getFullYear(), month.getMonth(), day))
            const w = byDate.get(k)
            const isSel = k === selected
            return (
              <button key={i} onClick={() => setSelected(k)} className="flex flex-col items-center py-0.5">
                <span
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-extrabold transition ${w ? 'bg-ink text-white' : 'bg-white/45 text-ink'} ${isSel ? 'ring-[3px] ring-white scale-110' : k === todayKey() ? 'outline-2 outline-offset-2 outline-dashed outline-ink' : ''}`}
                >
                  {day}
                  {w && w.score >= 85 && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-leaf-2 ring-2 ring-lav" />}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="mt-4">
        <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-mist">
          {parseKey(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        {sel ? (
          <>
            <div className="mt-3 flex items-center gap-4">
              <span className="font-display text-[36px] font-semibold text-ink">{sel.score}%</span>
              <span className="rounded-full bg-leaf px-3 py-1 text-[13px] font-extrabold text-ink">{scoreLabel(sel.score)}</span>
              <span className="ml-auto text-[13px] font-bold text-mist">at {sel.time}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ['Ready', `${sel.readiness}/10`],
                ['Sleep', sel.sleep],
                ['Mood', `${sel.mood}/5`],
                ['Fatigue', `${sel.fatigue}/5`],
                ['Soreness', `${sel.soreness}/5`],
                ['Stress', `${sel.stress}/5`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl bg-ice py-2">
                  <p className="text-[15px] font-extrabold text-ink">{v}</p>
                  <p className="text-[11px] font-bold text-mist">{l}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-3 flex items-center gap-3">
            <Mascot mood={isFuture ? 'curious' : 'sleeping'} size={60} />
            <p className="text-[14px] font-semibold text-mist">{isFuture ? 'This day is still ahead.' : 'No check-in on this day.'}</p>
          </div>
        )}
        {(rpe || part) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {rpe && <span className="rounded-full bg-[#FFEADB] px-3 py-1 text-[12px] font-extrabold text-[#C9703F]">{rpe.type} · RPE {rpe.rpe}</span>}
            {part && <span className="rounded-full bg-[#DDF5EC] px-3 py-1 text-[12px] font-extrabold text-[#2E9E74]">{part.status}</span>}
          </div>
        )}
        {isToday && (
          <button onClick={editDay} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-extrabold text-white hover:bg-black">
            <CalendarCheck size={18} /> {sel ? 'Edit today’s check-in' : 'Check in now'}
          </button>
        )}
      </Card>
    </Page>
  )
}

/* ================================================================ Profile */

export function Profile() {
  const { data, update, go, restart, streak, toast } = useApp()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(data.profile.name)
  const r = data.reminder
  const saveName = () => {
    if (name.trim()) {
      update((d) => ({ ...d, profile: { ...d.profile, name: name.trim() } }))
      toast('Name updated')
    }
    setEditing(false)
  }
  const Row = ({ icon, label, children, onClick }: { icon: React.ReactNode; label: string; children?: React.ReactNode; onClick?: () => void }) => {
    const Tag = onClick ? 'button' : 'div'
    return (
      <Tag onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ice text-ink">{icon}</span>
        <span className="flex-1 text-[15px] font-extrabold text-ink">{label}</span>
        {children}
      </Tag>
    )
  }
  return (
    <Page title="Profile" tab="profile">
      <Card className="flex flex-col items-center text-center">
        <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full bg-lav">
          <Mascot mood="happy" size={96} />
        </div>
        {editing ? (
          <form
            className="mt-3 flex w-full gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              saveName()
            }}
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 flex-1 rounded-full bg-ice px-4 text-center text-[16px] font-extrabold text-ink outline-none ring-2 ring-peri-soft"
            />
            <button className="h-11 rounded-full bg-peri px-4 text-[14px] font-extrabold text-white">Save</button>
          </form>
        ) : (
          <button onClick={() => setEditing(true)} className="mt-3 font-display text-[24px] font-semibold text-ink hover:text-peri">
            {data.profile.name}
          </button>
        )}
        <p className="text-[14px] font-semibold text-mist">
          {data.profile.sport} · {data.profile.email}
        </p>
        <div className="mt-4 grid w-full grid-cols-3 gap-2">
          {[
            [<Flame key="f" size={16} color="#D4F36B" />, `${streak}`, 'Streak'],
            [<CalendarCheck key="c" size={16} color="#3DB8A0" />, `${data.wellness.length}`, 'Check-ins'],
            [<Trophy key="t" size={16} color="#EE8E5A" />, `${data.rpe.length}`, 'Sessions'],
          ].map(([icon, v, l], i) => (
            <div key={i} className="rounded-2xl bg-ice py-3">
              <p className="flex items-center justify-center gap-1 font-display text-[20px] font-semibold text-ink">
                {icon} {v}
              </p>
              <p className="text-[12px] font-bold text-mist">{l}</p>
            </div>
          ))}
        </div>
      </Card>

      <SectionLabel>Settings</SectionLabel>
      <Card className="!py-1">
        <Row icon={<Clock size={18} />} label="Daily reminder" onClick={() => go('onboarding')}>
          <span className="text-[14px] font-extrabold text-mist">
            {HOURS[r.hour]}:{MINS[r.minute]} {r.pm ? 'PM' : 'AM'}
          </span>
          <ChevronRight size={16} className="text-[#C9CBC4]" />
        </Row>
        <Row icon={<Bell size={18} />} label="Reminders">
          <Toggle label="Reminders" on={data.remindersOn} onChange={(v) => (update((d) => ({ ...d, remindersOn: v })), toast(v ? 'Reminders on' : 'Reminders paused'))} />
        </Row>
        <Row icon={<Volume2 size={18} />} label="Mascot sounds">
          <Toggle label="Mascot sounds" on={data.soundOn} onChange={(v) => update((d) => ({ ...d, soundOn: v }))} />
        </Row>
        <Row icon={<User size={18} />} label="Edit name" onClick={() => setEditing(true)}>
          <ChevronRight size={16} className="text-[#C9CBC4]" />
        </Row>
      </Card>

      <div className="mt-4 space-y-3">
        <button
          onClick={() => {
            update(() => resetData())
            toast('Sample data restored')
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-extrabold text-mist ring-1 ring-ink/10 hover:text-ink"
        >
          <RotateCcw size={16} /> Reset sample data
        </button>
        <button onClick={() => restart('login')} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FFE5EC] text-[15px] font-extrabold text-[#D9567A]">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </Page>
  )
}
