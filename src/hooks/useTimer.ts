import { useEffect, useRef, useState } from 'react'
import type { Plan } from '../lib/types'

export interface Timer {
  base: number
  startedAt: number | null
}

interface UseTimerArgs {
  plan: Plan | null
  timer: Timer | null
  setTimer: (t: Timer) => void
}

export interface TimerState {
  elapsedMs: number
  remainingMs: number
  running: boolean
  started: boolean
  over: boolean
  currentPhaseIndex: number
}

const TOTAL = 30 * 60_000

export function useTimer({ plan, timer, setTimer }: UseTimerArgs): TimerState {
  const [now, setNow] = useState(() => Date.now())
  const lastPhaseRef = useRef(-2)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])

  if (!plan || !timer) {
    return { elapsedMs: 0, remainingMs: TOTAL, running: false, started: false, over: false, currentPhaseIndex: -1 }
  }

  const raw = timer.base + (timer.startedAt ? now - timer.startedAt : 0)
  const elapsedMs = Math.min(raw, TOTAL)
  const over = elapsedMs >= TOTAL

  // Snap base to TOTAL once we cross the line, so a reload doesn't re-run past 0
  if (over && timer.startedAt) {
    setTimer({ base: TOTAL, startedAt: null })
  }

  const min = elapsedMs / 60_000
  let currentPhaseIndex = -1
  plan.phases.forEach((p, i) => {
    if (min >= p.from && min < p.to) currentPhaseIndex = i
  })

  const running = !!timer.startedAt
  const started = elapsedMs > 0

  // Announce phase change (kept out of the render loop by using a ref)
  if (currentPhaseIndex !== lastPhaseRef.current) {
    lastPhaseRef.current = currentPhaseIndex
  }

  return {
    elapsedMs,
    remainingMs: TOTAL - elapsedMs,
    running,
    started,
    over,
    currentPhaseIndex,
  }
}

export function fmt(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function toggleTimer(timer: Timer, setTimer: (t: Timer) => void) {
  if (timer.startedAt) {
    const elapsed = timer.base + (Date.now() - timer.startedAt)
    setTimer({ base: Math.min(elapsed, TOTAL), startedAt: null })
  } else {
    if (timer.base >= TOTAL) return
    setTimer({ base: timer.base, startedAt: Date.now() })
  }
}

export function resetTimer(setTimer: (t: Timer) => void) {
  setTimer({ base: 0, startedAt: null })
}