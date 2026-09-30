import { TextField, TextArea } from '../ui/Field'
import { ScoreSlider } from './ScoreSlider'
import { Verdict } from './verdict'
import { ExportPanel } from './ExportPanel'
import { SCORE_KEYS, glanceText, scoreTotal } from '../../lib/scoring'
import type { Intake, Notes, Phase, Plan } from '../../lib/types'

interface Props {
  plan: Plan
  phase: Phase
  notes: Notes
  intake: Intake
  onToggleCheck: (key: string) => void
  onNotesField: (path: string, value: unknown) => void
  onScore: (key: (typeof SCORE_KEYS)[number], value: number) => void
}

export function DecidePhase({
  plan, phase, notes, intake,
  onToggleCheck, onNotesField, onScore,
}: Props) {
  const st = scoreTotal(plan, notes)

  return (
    <>
      <p className="text-lg leading-relaxed max-w-[58ch] mt-4">{glanceText(plan, notes)}</p>

      <ul className="list-none mt-4 p-0 grid gap-2">
        {phase.checks.map((c, j) => {
          const key = `${phase.id}c${j}`
          return (
            <li key={key}>
              <label className="flex gap-2.5 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!notes.checks[key]}
                  onChange={() => onToggleCheck(key)}
                  className="mt-0.5 w-4.5 h-4.5 shrink-0 accent-p4"
                />
                <span>{c}</span>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="grid gap-4 mt-4">
        <TextArea
          id="stakes"
          label="What every competitor offers (table stakes)"
          value={notes.gap.stakes}
          onChange={e => onNotesField('gap.stakes', e.target.value)}
        />
        <TextArea
          id="nobody"
          label="What nobody does well (my angle)"
          value={notes.gap.nobody}
          onChange={e => onNotesField('gap.nobody', e.target.value)}
        />
        <TextArea
          id="edge"
          label="My unfair advantage"
          placeholder="Skills or access that competitors do not have"
          value={notes.gap.edge}
          onChange={e => onNotesField('gap.edge', e.target.value)}
        />
      </div>

      <h3 className="mt-9 text-[22px] font-display font-bold">Score the idea</h3>
      <div className="mt-3">
        {SCORE_KEYS.map(k => (
          <ScoreSlider
            key={k}
            scoreKey={k}
            weight={plan.score_weights[k]}
            prompt={plan.score_prompts[k]}
            value={notes.score[k]}
            onChange={v => onScore(k, v)}
          />
        ))}
      </div>
      <p className="font-display font-bold text-[22px] leading-tight mt-3">
        Total: {st.total} of 20
      </p>
      <Verdict plan={plan} notes={notes} />

      <div className="grid gap-4 mt-7">
        <fieldset>
          <legend className="font-semibold mb-2">My decision</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {(['go', 'pivot', 'drop'] as const).map(v => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  value={v}
                  checked={notes.decision === v}
                  onChange={() => onNotesField('decision', v)}
                />
                {v === 'go' ? 'Go' : v === 'pivot' ? 'Pivot to runner-up' : 'Drop'}
              </label>
            ))}
          </div>
        </fieldset>

        <TextField
          id="promise"
          label="One-line product promise"
          placeholder="Who it is for, and what it saves them"
          value={notes.promise}
          onChange={e => onNotesField('promise', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextField id="ptitle" label="Working title" labelClass="block text-[13px] font-semibold text-[var(--color-muted)] mb-1.5" value={notes.title} onChange={e => onNotesField('title', e.target.value)} />
          <TextField id="launch" label="Launch price" labelClass="block text-[13px] font-semibold text-[var(--color-muted)] mb-1.5" placeholder="$29" value={notes.launch} onChange={e => onNotesField('launch', e.target.value)} />
          <TextField id="full" label="Full price" labelClass="block text-[13px] font-semibold text-[var(--color-muted)] mb-1.5" placeholder="$39" value={notes.full} onChange={e => onNotesField('full', e.target.value)} />
        </div>

        {plan.pricing_hint && (
          <p className="text-sm text-muted">
            Starting point for pricing: {plan.pricing_hint} Check it against the prices you logged.
          </p>
        )}

        <div>
          <span className="text-[15px] font-semibold block mb-1.5">Top 3 features to build first</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map(n => (
              <input
                key={n}
                type="text"
                aria-label={`Feature ${n + 1}`}
                value={notes.features[n] ?? ''}
                onChange={e => {
                  const next = [...notes.features]
                  next[n] = e.target.value
                  onNotesField('features', next)
                }}
                className="w-full text-base text-ink bg-field border border-line rounded-md px-2.5 py-2"
              />
            ))}
          </div>
        </div>
      </div>

      <ExportPanel plan={plan} notes={notes} intake={intake} />
    </>
  )
}