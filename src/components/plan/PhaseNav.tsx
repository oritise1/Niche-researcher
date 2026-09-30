import type { Plan } from '../../lib/types'
import type { TimerState } from '../../hooks/useTimer'

interface Props {
  plan: Plan
  timer: TimerState
}

const PHASE_COLORS = ['var(--color-p1)', 'var(--color-p2)', 'var(--color-p3)', 'var(--color-p4)']

export function PhaseNav({ plan, timer }: Props) {
  const min = timer.elapsedMs / 60_000

  return (
    <nav className="flex gap-1 mt-2" aria-label="Research stops">
      {plan.phases.map((p, i) => {
        const pct = Math.min(1, Math.max(0, (min - p.from) / (p.to - p.from)))
        const color = PHASE_COLORS[i % PHASE_COLORS.length]
        const current = i === timer.currentPhaseIndex

        return (
          <a
            key={p.id}
            href={`#${p.id}`}
            onClick={e => {
              e.preventDefault()
              document.getElementById(p.id)?.scrollIntoView({ block: 'start' })
            }}
            aria-current={current ? 'step' : undefined}
            aria-label={`Stop ${i + 1}, ${p.title}, minutes ${p.from} to ${p.to}`}
            className={`relative flex-1 min-w-0 rounded px-2 pt-1.5 pb-2 text-[13px] font-semibold leading-tight no-underline text-ink overflow-hidden ${
              current ? 'outline-2 -outline-offset-2' : ''
            }`}
            style={{
              flexGrow: p.minutes,
              flexBasis: 0,
              background: `color-mix(in srgb, ${color} 14%, var(--color-track))`,
              outlineColor: current ? color : undefined,
            }}
          >
            <i
              className="absolute inset-y-0 left-0 pointer-events-none"
              style={{ width: `${pct * 100}%`, background: `color-mix(in srgb, ${color} 38%, transparent)` }}
            />
            <span className="relative hidden sm:block whitespace-nowrap overflow-hidden text-ellipsis">
              {p.title.split(':')[0]}
            </span>
            <span className="relative block text-center sm:hidden">{i + 1}</span>
            <small className="relative hidden sm:block font-normal text-muted">
              {p.minutes} min
            </small>
          </a>
        )
      })}
    </nav>
  )
}