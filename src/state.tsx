import { createContext, useContext } from 'react'

export type Answers = {
  readiness: number
  fatigue: number
  soreness: number
  sleep: string
  sleepQuality: number
  stress: number
  mood: number
}

export const defaultAnswers: Answers = {
  readiness: 8,
  fatigue: 4,
  soreness: 4,
  sleep: '8h',
  sleepQuality: 4,
  stress: 4,
  mood: 5,
}

export type Route =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'register'
  | 'forgot'
  | 'home'
  | 'notifications'
  | 'readiness'
  | 'fatigue'
  | 'sleep'
  | 'stress'
  | 'review'
  | 'success'
  | 'rpe'
  | 'participation'
  | 'injury'
  | 'stats'
  | 'calendar'
  | 'profile'

export type WellnessEntry = Answers & { date: string; time: string; score: number }
export type RpeEntry = { date: string; rpe: number; minutes: number; type: string }
export type ParticipationEntry = { date: string; status: string; reason?: string }
export type InjuryEntry = { date: string; area: string; side: string; pain: number; note: string }
export type Reminder = { hour: number; minute: number; pm: boolean; days: boolean[] }

export type Data = {
  wellness: WellnessEntry[]
  rpe: RpeEntry[]
  participation: ParticipationEntry[]
  injuries: InjuryEntry[]
  reminder: Reminder
  remindersOn: boolean
  soundOn: boolean
  notifRead: boolean
  profile: { name: string; email: string; sport: string }
}

export const SLEEP_OPTIONS = ['0h', '4h', '5h', '6h', '6.5h', '7h', '7.5h', '8h', '8.5h', '9h', '10h', '12h']
const SLEEP_SCORE: Record<string, number> = {
  '0h': 0, '4h': 30, '5h': 45, '6h': 60, '6.5h': 70, '7h': 80,
  '7.5h': 90, '8h': 100, '8.5h': 100, '9h': 100, '10h': 90, '12h': 70,
}

/** Weighted 0–100 readiness score from all wellness answers. */
export function readinessScore(a: Answers) {
  const score =
    0.2 * a.readiness * 10 +
    0.2 * (SLEEP_SCORE[a.sleep] ?? 0) +
    0.2 * a.mood * 20 +
    0.1 * a.sleepQuality * 20 +
    0.1 * a.fatigue * 20 +
    0.1 * a.soreness * 20 +
    0.1 * a.stress * 20
  return Math.round(score)
}

export function scoreLabel(s: number) {
  if (s >= 85) return 'Optimal'
  if (s >= 70) return 'Good'
  if (s >= 50) return 'Moderate'
  return 'Take it easy'
}

/* ------------------------------------------------------------ dates */

export function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const todayKey = () => dateKey(new Date())
export function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export function parseKey(k: string) {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** "Today", "Yesterday", "Mar 10" or "Never" for the most recent date in a list. */
export function latestLabel(dates: string[]) {
  if (!dates.length) return 'Never'
  const last = [...dates].sort().at(-1)!
  if (last === todayKey()) return 'Today'
  if (last === dateKey(addDays(new Date(), -1))) return 'Yesterday'
  return parseKey(last).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Consecutive days with a wellness check-in, counting back from today (or yesterday). */
export function computeStreak(wellness: WellnessEntry[]) {
  const days = new Set(wellness.map((w) => w.date))
  let d = new Date()
  if (!days.has(dateKey(d))) d = addDays(d, -1)
  let n = 0
  while (days.has(dateKey(d))) {
    n++
    d = addDays(d, -1)
  }
  return n
}

/* ------------------------------------------------------------ seed + storage */

function seedData(): Data {
  const past: Answers[] = [
    { readiness: 6, fatigue: 3, soreness: 3, sleep: '7h', sleepQuality: 3, stress: 3, mood: 4 },
    { readiness: 7, fatigue: 4, soreness: 3, sleep: '7.5h', sleepQuality: 4, stress: 4, mood: 4 },
    { readiness: 5, fatigue: 2, soreness: 2, sleep: '6h', sleepQuality: 3, stress: 3, mood: 3 },
    { readiness: 8, fatigue: 4, soreness: 4, sleep: '8h', sleepQuality: 4, stress: 4, mood: 5 },
    { readiness: 7, fatigue: 3, soreness: 4, sleep: '8.5h', sleepQuality: 4, stress: 4, mood: 4 },
  ]
  const wellness = past.map((a, i) => ({
    ...a,
    date: dateKey(addDays(new Date(), i - 5)),
    time: '08:1' + i,
    score: readinessScore(a),
  }))
  return {
    wellness,
    rpe: [
      { date: dateKey(addDays(new Date(), -3)), rpe: 6, minutes: 75, type: 'Training' },
      { date: dateKey(addDays(new Date(), -1)), rpe: 7, minutes: 90, type: 'Training' },
    ],
    participation: [],
    injuries: [],
    reminder: { hour: 7, minute: 0, pm: false, days: [true, true, true, true, true, true, false] },
    remindersOn: true,
    soundOn: true,
    notifRead: false,
    profile: { name: 'Alex', email: 'alex.runner@mail.com', sport: 'Football' },
  }
}

const KEY = 'wellmate-data-v1'
export function loadData(): Data {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...seedData(), ...JSON.parse(raw) }
  } catch {
    /* ignore corrupt storage */
  }
  return seedData()
}
export function saveData(d: Data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d))
  } catch {
    /* storage unavailable */
  }
}
export function resetData() {
  localStorage.removeItem(KEY)
  return seedData()
}

/* ------------------------------------------------------------ context */

type Ctx = {
  answers: Answers
  set: <K extends keyof Answers>(key: K, value: Answers[K]) => void
  setAnswers: (a: Answers) => void
  route: Route
  /** route that was open before the current one */
  prev: Route | undefined
  go: (r: Route) => void
  back: () => void
  canBack: boolean
  goHome: () => void
  restart: (r: Route) => void
  data: Data
  update: (fn: (d: Data) => Data) => void
  submitWellness: () => void
  streak: number
  toast: (msg: string) => void
}

export const AppCtx = createContext<Ctx>(null as unknown as Ctx)
export const useApp = () => useContext(AppCtx)
