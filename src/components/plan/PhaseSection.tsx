import { MarketplacePhase } from './MarketplacePhase'
import { CommunityPhase } from './CommunityPhase'
import { DecidePhase } from './DecidePhase'
import type { Intake, Listing, Notes, Phase, Plan, ScoreKey, Signal } from '../../lib/types'

interface Props {
  plan: Plan
  phase: Phase
  index: number
  notes: Notes
  intake: Intake
  firstMarketplace: boolean
  onToggleCheck: (key: string) => void
  onListingChange: (index: number, patch: Partial<Listing>) => void
  onAddListing: () => void
  onRemoveListing: (index: number) => void
  onSignalChange: (index: number, patch: Partial<Signal>) => void
  onAddSignal: () => void
  onRemoveSignal: (index: number) => void
  onNotesField: (path: string, value: unknown) => void
  onScore: (key: ScoreKey, value: number) => void
}

const PHASE_COLORS = ['var(--color-p1)', 'var(--color-p2)', 'var(--color-p3)', 'var(--color-p4)']

export function PhaseSection(props: Props) {
  const { plan, phase, index, notes, intake, firstMarketplace } = props
  const color = PHASE_COLORS[index % PHASE_COLORS.length]

  const checks = phase.checks.map((_, j) => `${phase.id}c${j}`)
  const done = checks.filter(k => notes.checks[k]).length
  const doneLabel = done === checks.length ? 'All done' : `${done} of ${checks.length} done`

  return (
    <section
      id={phase.id}
      aria-labelledby={`h-${phase.id}`}
      className="mt-14 pl-3.5 sm:pl-5 border-l-[6px]"
      style={{ borderLeftColor: `color-mix(in srgb, ${color} 45%, var(--color-bg))` }}
    >
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
        <h2 id={`h-${phase.id}`} className="text-[26px] sm:text-[30px] font-display font-bold leading-tight">
          {phase.title}
        </h2>
        <span className="font-semibold text-[15px]" style={{ color }}>
          Minutes {phase.from} to {phase.to}
        </span>
        <span className="ml-auto text-sm text-muted">{doneLabel}</span>
      </div>
      <p className="max-w-[62ch] mt-2 text-muted">{phase.intro}</p>

      {phase.kind === 'marketplace' && (
        <MarketplacePhase
          plan={plan}
          phase={phase}
          notes={notes}
          firstMarketplace={firstMarketplace}
          onToggleCheck={props.onToggleCheck}
          onListingChange={props.onListingChange}
          onAddListing={props.onAddListing}
          onRemoveListing={props.onRemoveListing}
          onNotesField={props.onNotesField}
        />
      )}

      {phase.kind === 'community' && (
        <CommunityPhase
          plan={plan}
          phase={phase}
          notes={notes}
          onToggleCheck={props.onToggleCheck}
          onSignalChange={props.onSignalChange}
          onAddSignal={props.onAddSignal}
          onRemoveSignal={props.onRemoveSignal}
          onNotesField={props.onNotesField}
        />
      )}

      {phase.kind === 'decide' && (
        <DecidePhase
          plan={plan}
          phase={phase}
          notes={notes}
          intake={intake}
          onToggleCheck={props.onToggleCheck}
          onNotesField={props.onNotesField}
          onScore={props.onScore}
        />
      )}
    </section>
  )
}