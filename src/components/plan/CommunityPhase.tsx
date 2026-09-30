import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { TextArea } from '../ui/Field'
import { SignalRow } from './SignalRow'
import { SOURCES } from '../../lib/sources'
import type { Notes, Phase, Plan, Signal } from '../../lib/types'

interface Props {
  plan: Plan
  phase: Phase
  notes: Notes
  onToggleCheck: (key: string) => void
  onSignalChange: (index: number, patch: Partial<Signal>) => void
  onAddSignal: () => void
  onRemoveSignal: (index: number) => void
  onNotesField: (path: string, value: unknown) => void
}

export function CommunityPhase({
  plan, phase, notes,
  onToggleCheck, onSignalChange, onAddSignal, onRemoveSignal, onNotesField,
}: Props) {
  const keywords = notes.keywords.split(',').map(s => s.trim()).filter(Boolean)
  const topic = keywords[0] ?? ''
  const signals = notes.signalLogs[phase.id] ?? []

  return (
    <>
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

      <div className="grid gap-2 mt-4">
        {plan.communities.phrases.map(p => (
          <div key={p} className="flex flex-wrap gap-2 items-center">
            <span className="text-[15px] basis-full sm:basis-auto sm:min-w-[12.5em]">{p}...</span>
            {phase.sources.map(sid => {
              const src = SOURCES[sid]
              if (!src) return null
              const q = `"${p}" ${topic}`
              return <Chip key={sid} label={src.label} href={src.url(encodeURIComponent(q))} />
            })}
          </div>
        ))}
      </div>

      {plan.communities.subreddits.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="font-semibold text-sm mr-1">Search inside communities</span>
          {plan.communities.subreddits.map(s => (
            <Chip
              key={s}
              label={`r/${s}`}
              href={`https://www.reddit.com/r/${s}/search/?q=${encodeURIComponent(topic)}&restrict_sr=1`}
            />
          ))}
        </div>
      )}

      <div className="mt-4">
        {signals.map((s, i) => (
          <SignalRow
            key={i}
            index={i}
            signal={s}
            onChange={patch => onSignalChange(i, patch)}
            onRemove={() => onRemoveSignal(i)}
          />
        ))}
      </div>
      <Button variant="ghost" className="mt-1" onClick={onAddSignal}>Add a demand signal</Button>

      <div className="mt-6">
        <TextArea
          id="pains"
          label="Pain points that repeat"
          placeholder="Tally repeats, like: writing proposals x4, chasing invoices x2"
          value={notes.pains}
          onChange={e => onNotesField('pains', e.target.value)}
        />
      </div>
    </>
  )
}