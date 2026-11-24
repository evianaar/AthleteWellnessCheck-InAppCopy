import { useEffect, useRef, useState } from 'react'
import { Phone } from './components/Phone'
import { Mascot } from './components/Mascot'
import {
  AppCtx,
  computeStreak,
  defaultAnswers,
  loadData,
  nowTime,
  readinessScore,
  saveData,
  todayKey,
  type Answers,
  type Data,
  type Route,
} from './state'
import { FatigueSoreness, HomeScreen, Login, Onboarding, Readiness, Review, Sleep, Splash, StressMood, Success } from './screens'
import { Calendar, Forgot, Injury, Notifications, Participation, Profile, Register, SessionRpe, Stats } from './screens-extra'

const SCREENS: Record<Route, { name: string; C: () => React.ReactNode }> = {
  splash: { name: 'Splash', C: Splash },
  onboarding: { name: 'Onboarding', C: Onboarding },
  login: { name: 'Log In', C: Login },
  register: { name: 'Register', C: Register },
  forgot: { name: 'Forgot password', C: Forgot },
  home: { name: 'Home', C: HomeScreen },
  notifications: { name: 'Notifications', C: Notifications },
  readiness: { name: 'Wellness · Readiness', C: Readiness },
  fatigue: { name: 'Wellness · Fatigue', C: FatigueSoreness },
  sleep: { name: 'Wellness · Sleep', C: Sleep },
  stress: { name: 'Wellness · Stress & Mood', C: StressMood },
  review: { name: 'Review & Submit', C: Review },
  success: { name: 'Success', C: Success },
  rpe: { name: 'Session RPE', C: SessionRpe },
  participation: { name: 'Participation', C: Participation },
  injury: { name: 'Injury Report', C: Injury },
  stats: { name: 'Stats', C: Stats },
  calendar: { name: 'Calendar', C: Calendar },
  profile: { name: 'Profile', C: Profile },
}

const NAV_GROUPS: { title: string; routes: Route[] }[] = [
  { title: 'Start', routes: ['splash', 'onboarding', 'login', 'register', 'forgot'] },
  { title: 'App', routes: ['home', 'stats', 'calendar', 'profile', 'notifications'] },
  { title: 'Daily wellness', routes: ['readiness', 'fatigue', 'sleep', 'stress', 'review', 'success'] },
  { title: 'Reports', routes: ['rpe', 'participation', 'injury'] },
]

/** Scale factor so the full phone frame fits the viewport. */
function useViewport() {
  const calc = () => ({
    scale: Math.min(1, (window.innerHeight - 40) / 874, (window.innerWidth - 24) / 415),
    // On phone-sized viewports (e.g. a device preview) skip the drawn bezel entirely.
    bare: window.innerWidth < 600,
  })
  const [v, setV] = useState(calc)
  useEffect(() => {
    const on = () => setV(calc())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return v
}

export default function App() {
  const [answers, setAnswers] = useState<Answers>(defaultAnswers)
  const [data, setData] = useState<Data>(loadData)
  const [stack, setStack] = useState<Route[]>(['splash'])
  const [toastMsg, setToastMsg] = useState<{ id: number; text: string } | null>(null)
  const { scale, bare } = useViewport()
  const launched = useRef(false)
  const route = stack[stack.length - 1]

  useEffect(() => saveData(data), [data])

  const go = (r: Route) => setStack((s) => (s[s.length - 1] === r ? s : [...s, r]))
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  // Start a fresh history (e.g. after log out); keep splash underneath so Back still works.
  const restart = (r: Route) => setStack(r === 'splash' ? ['splash'] : ['splash', r])
  const goHome = () =>
    setStack((s) => {
      const i = s.lastIndexOf('home')
      return i >= 0 ? s.slice(0, i + 1) : ['home']
    })

  const toast = (text: string) => {
    const id = Date.now()
    setToastMsg({ id, text })
    window.setTimeout(() => setToastMsg((t) => (t?.id === id ? null : t)), 2400)
  }

  const submitWellness = () => {
    const date = todayKey()
    const entry = { ...answers, date, time: nowTime(), score: readinessScore(answers) }
    setData((d) => ({ ...d, wellness: [...d.wellness.filter((w) => w.date !== date), entry] }))
    go('success')
  }

  // The splash moves on to onboarding by itself, once, like a real launch screen.
  useEffect(() => {
    if (route !== 'splash' || launched.current) return
    const t = window.setTimeout(() => {
      launched.current = true
      go('onboarding')
    }, 2600)
    return () => window.clearTimeout(t)
  }, [route])

  const { C } = SCREENS[route]

  const screen = (
    <Phone bare={bare}>
      <div key={route} className="wm-screen-in absolute inset-0">
        <C />
      </div>
      {toastMsg && (
        <div key={toastMsg.id} className="wm-screen-in pointer-events-none absolute inset-x-0 top-[58px] z-50 flex justify-center px-6">
          <span className="rounded-full bg-ink px-5 py-3 text-center text-[14px] font-extrabold text-white shadow-lg">{toastMsg.text}</span>
        </div>
      )}
    </Phone>
  )

  return (
    <AppCtx.Provider
      value={{
        answers,
        set: (k, v) => setAnswers((a) => ({ ...a, [k]: v })),
        setAnswers,
        route,
        prev: stack[stack.length - 2],
        go,
        back,
        canBack: stack.length > 1,
        goHome,
        restart,
        data,
        update: (fn) => setData(fn),
        submitWellness,
        streak: computeStreak(data.wellness),
        toast,
      }}
    >
      <main
        className={`relative flex min-h-screen items-center justify-center overflow-x-hidden ${bare ? 'bg-ice' : 'bg-[#E1E2DD] bg-[radial-gradient(#c4c6bf_1px,transparent_1px)] [background-size:22px_22px] py-5'}`}
      >
        {!bare && (
          <aside className="no-scrollbar absolute left-8 top-1/2 hidden max-h-[92vh] w-[230px] -translate-y-1/2 overflow-y-auto xl:block">
            <div className="mb-4 flex items-center gap-3">
              <Mascot mood="wave" size={48} />
              <p className="font-display text-[24px] font-semibold text-ink">
                Well<span className="text-leaf">Mate</span>
              </p>
            </div>
            {NAV_GROUPS.map((g) => (
              <div key={g.title} className="mb-3">
                <p className="mb-1 px-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-mist">{g.title}</p>
                {g.routes.map((r) => (
                  <button
                    key={r}
                    onClick={() => go(r)}
                    className={`block w-full rounded-full px-3 py-1.5 text-left text-[14px] font-extrabold transition ${route === r ? 'bg-ink text-white' : 'text-mist hover:bg-white hover:text-ink'}`}
                  >
                    {SCREENS[r].name}
                  </button>
                ))}
              </div>
            ))}
          </aside>
        )}

        {bare ? (
          <div className="w-full">{screen}</div>
        ) : (
          <div style={{ width: 415 * scale, height: 874 * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>{screen}</div>
          </div>
        )}
      </main>
    </AppCtx.Provider>
  )
}
