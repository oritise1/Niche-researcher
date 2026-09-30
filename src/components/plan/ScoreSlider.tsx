import type { ScoreKey } from '../../lib/types'
import { SCORE_LABELS } from '../../lib/scoring'

interface Props {
  scoreKey: ScoreKey
  weight: number
  prompt: string
  value: number
  onChange: (v: number) => void
}

export function ScoreSlider({ scoreKey, weight, prompt, value, onChange }: Props) {
  const id = `s-${scoreKey}`
  const extra = weight === 3 ? ' Counts extra for you.' : weight === 1 ? ' Counts less for you.' : ''

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_7.5em] gap-x-4 gap-y-2 items-center py-3 border-t border-line">
      <div>
        <label className="font-semibold" htmlFor={id}>{SCORE_LABELS[scoreKey]}</label>
        <p className="text-sm text-muted">{prompt}{extra}</p>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={5}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-(--color-p4)"
      />
      <output htmlFor={id} className="tabular-nums text-muted sm:text-right">
        {value ? `${value} of 5` : 'not scored'}
      </output>
    </div>
  )
}