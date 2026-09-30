import { TextField } from '../ui/Field'
import { Hint } from '../ui/Hint'
import type { Notes, Plan } from '../../lib/types'

interface Props {
  plan: Plan
  notes: Notes
  onNotesField: (path: string, value: unknown) => void
}

export function PlanSetup({ plan, notes, onNotesField }: Props) {
  return (
    <section aria-labelledby="h-setup" className="mt-7">
      <h2 id="h-setup" className="text-[26px] sm:text-[30px] font-display font-bold leading-tight">
        Your research plan
      </h2>
      <p className="max-w-[62ch] mt-3.5 text-muted">
        {plan.summary || 'A 30 minute check of your niche.'}
      </p>
      <Hint>
        {plan.source === 'ai' ? 'Plan written by AI from your answers.' : plan.note || 'This plan comes from built-in rules.'}
      </Hint>

      <div className="grid gap-4 mt-4">
        <TextField
          id="keywords"
          label="Search keywords, separated by commas"
          hint="These turn into search links in each stop below. Edit them anytime."
          value={notes.keywords}
          onChange={e => onNotesField('keywords', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex gap-2.5 items-start cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={notes.payoutOk}
              onChange={e => onNotesField('payoutOk', e.target.checked)}
              className="mt-0.5 w-4.5 h-4.5 accent-p4"
            />
            <span>I confirmed a payout method works in my country</span>
          </label>
          <TextField
            id="payplat"
            label="Which platform?"
            labelClass="block text-[13px] font-semibold text-muted mb-1.5"
            placeholder="Gumroad, Lemon Squeezy, Payhip"
            value={notes.payoutPlatform}
            onChange={e => onNotesField('payoutPlatform', e.target.value)}
          />
        </div>

        <p className="text-sm text-muted">{plan.payout_note}</p>
      </div>

      <details className="mt-4.5">
        <summary className="cursor-pointer font-semibold">What good and bad signals look like</summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2.5">
          <div>
            <h3 className="text-base font-display font-bold mb-1">Good signs</h3>
            <ul className="m-0 pl-4.5 list-disc">
              {plan.flags.good.map((t, i) => <li key={i} className="mb-1">{t}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-base font-display font-bold mb-1">Bad signs</h3>
            <ul className="m-0 pl-4.5 list-disc">
              {plan.flags.bad.map((t, i) => <li key={i} className="mb-1">{t}</li>)}
            </ul>
          </div>
        </div>
      </details>
    </section>
  )
}