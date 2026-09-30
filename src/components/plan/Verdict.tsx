import { verdictFor } from '../../lib/scoring'
import type { Notes, Plan } from '../../lib/types'

interface Props {
  plan: Plan
  notes: Notes
}

const CLS_BORDER: Record<string, string> = {
  '': 'border-l-[var(--color-muted)]',
  go: 'border-l-[var(--color-go)]',
  narrow: 'border-l-[var(--color-narrow)]',
  pivot: 'border-l-[var(--color-pivot)]',
}

const CLS_TITLE: Record<string, string> = {
  '': '',
  go: 'text-[var(--color-go)]',
  narrow: 'text-[var(--color-narrow)]',
  pivot: 'text-[var(--color-pivot)]',
}

export function Verdict({ plan, notes }: Props) {
  const v = verdictFor(plan, notes)

  return (
    <div
      role="status"
      className={`mt-3.5 max-w-[62ch] border-l-[6px] px-4 py-3.5 bg-[color-mix(in_srgb,var(--color-ink)_5%,var(--color-bg))] ${
        CLS_BORDER[v.cls]
      }`}
    >
      <span className={`font-display font-bold text-xl leading-tight block ${CLS_TITLE[v.cls]}`}>
        {v.t}
      </span>
      <span className="block mt-1">{v.b}</span>
    </div>
  )
}