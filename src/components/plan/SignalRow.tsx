import { Button } from '../ui/Button'
import type { Signal } from '../../lib/types'

interface Props {
  index: number
  signal: Signal
  onChange: (patch: Partial<Signal>) => void
  onRemove: () => void
}

export function SignalRow({ index, signal, onChange, onRemove }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-x-3 gap-y-2.5 py-3.5 border-t border-line">
      <div className="sm:col-span-6 flex items-center justify-between">
        <span className="font-display font-bold text-[15px]">Signal {index + 1}</span>
        <Button variant="quiet" onClick={onRemove} aria-label={`Remove signal ${index + 1}`}>
          Remove
        </Button>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-[13px] font-semibold text-muted mb-1.5" htmlFor={`sg-${index}-link`}>
          Link
        </label>
        <input
          id={`sg-${index}-link`}
          type="text"
          value={signal.link}
          placeholder="Thread or post URL"
          onChange={e => onChange({ link: e.target.value })}
          className="w-full text-base text-ink bg-field border border-line rounded-md px-2.5 py-2"
        />
      </div>
      <div className="sm:col-span-4">
        <label className="block text-[13px] font-semibold text-muted mb-1.5" htmlFor={`sg-${index}-words`}>
          What they asked for
        </label>
        <textarea
          id={`sg-${index}-words`}
          rows={2}
          value={signal.wording}
          placeholder="Paste their exact words"
          onChange={e => onChange({ wording: e.target.value })}
          className="w-full text-base text-ink bg-field border border-line rounded-md px-2.5 py-2 min-h-21 resize-y"
        />
      </div>
    </div>
  )
}