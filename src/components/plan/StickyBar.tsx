import { Button } from '../ui/Button'
import { PhaseNav } from './PhaseNav'
import type { Plan } from '../../lib/types'
import type { TimerState } from '../../hooks/useTimer'
import { fmt, toggleTimer, resetTimer } from '../../hooks/useTimer'
import type { Notes } from '../../lib/types'

interface Props {
  plan: Plan
  notes: Notes
  timer: TimerState
  setTimer: (t: Notes['timer']) => void
  announce: string
}

export function StickyBar({ plan, notes, timer, setTimer, announce }: Props) {
  const btnLabel = timer.over ? 'Done' : timer.running ? 'Pause' : timer.started ? 'Resume' : 'Start'

  const note = timer.over
    ? 'Time is up. Score the idea and make the call.'
    : !timer.started
      ? 'Open the marketplaces and communities in other tabs, then press Start.'
      : `${timer.running ? 'Now' : 'Paused'} in: ${plan.phases[timer.currentPhaseIndex]?.title.split(':')[0] ?? ''}`

  return (
    <header className="sticky top-0 z-10 bg-bg border-b border-line px-4 pt-3 pb-2.5">
      <div className="max-w-230 mx-auto">
        <div className="flex flex-wrap items-center gap-x-4.5 gap-y-2">
          <h1 className="font-display font-bold text-[15px] leading-tight">
            Niche research plan builder
          </h1>
          <div className="font-display font-bold text-[38px] leading-none tabular-nums min-w-[4.6ch] sm:text-[46px]">
            {fmt(timer.remainingMs)}
          </div>
          <div className="ml-auto flex gap-2">
            <Button onClick={() => toggleTimer(notes.timer, setTimer)} disabled={timer.over}>
              {btnLabel}
            </Button>
            <Button variant="ghost" onClick={() => resetTimer(setTimer)}>Reset</Button>
          </div>
        </div>
        <p className="text-sm text-muted mt-1.5 min-h-[1.4em]">{note}</p>
        <PhaseNav plan={plan} timer={timer} />
        <div className="sr-only" aria-live="polite">{announce}</div>
      </div>
    </header>
  )
}