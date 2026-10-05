import { useEffect, useState } from 'react'
import { StickyBar } from '../components/plan/StickyBar'
import { PlanSetup } from '../components/plan/PlanSetup'
import { PhaseSection } from '../components/plan/PhaseSection'
import { Button } from '../components/ui/Button'
import { useTimer } from '../hooks/useTimer'
import type { Intake, Listing, Notes, Plan, ScoreKey, Signal } from '../lib/types'

interface Props {
  plan: Plan
  notes: Notes
  intake: Intake
  saveOk: boolean
  onNotesField: (path: string, value: unknown) => void
  onScore: (key: ScoreKey, value: number) => void
  onAddListing: (phaseId: string) => void
  onRemoveListing: (phaseId: string, index: number) => void
  onListingChange: (phaseId: string, index: number, patch: Partial<Listing>) => void
  onAddSignal: (phaseId: string) => void
  onRemoveSignal: (phaseId: string, index: number) => void
  onSignalChange: (phaseId: string, index: number, patch: Partial<Signal>) => void
  onEdit: () => void
  onReset: () => void
  setTimer: (t: Notes['timer']) => void
}

export function PlanPage(props: Props) {
  const { plan, notes, intake, saveOk, onNotesField, onScore, setTimer } = props

  const timer = useTimer({ plan, timer: notes.timer, setTimer })
  const [announce, setAnnounce] = useState('')

  useEffect(() => {
    if (timer.over) setAnnounce('Time is up.')
    else if (timer.started && timer.currentPhaseIndex >= 0) {
      setAnnounce(`Stop ${timer.currentPhaseIndex + 1}: ${plan.phases[timer.currentPhaseIndex].title}.`)
    }
  }, [timer.currentPhaseIndex, timer.over, timer.started, plan.phases])

  const toggleCheck = (key: string) => {
    onNotesField(`checks.${key}`, !notes.checks[key])
  }

  let firstMktSeen = false

  return (
    <div className="max-w-230 mx-auto px-4 pb-18">
      <StickyBar plan={plan} notes={notes} timer={timer} setTimer={setTimer} announce={announce} />

      <PlanSetup plan={plan} notes={notes} onNotesField={onNotesField} />

      {plan.phases.map((phase, i) => {
        const isFirstMkt = phase.kind === 'marketplace' && !firstMktSeen
        if (phase.kind === 'marketplace') firstMktSeen = true
        return (
          <PhaseSection
            key={phase.id}
            plan={plan}
            phase={phase}
            index={i}
            notes={notes}
            intake={intake}
            firstMarketplace={isFirstMkt}
            onToggleCheck={toggleCheck}
            onListingChange={(idx, patch) => props.onListingChange(phase.id, idx, patch)}
            onAddListing={() => props.onAddListing(phase.id)}
            onRemoveListing={idx => props.onRemoveListing(phase.id, idx)}
            onSignalChange={(idx, patch) => props.onSignalChange(phase.id, idx, patch)}
            onAddSignal={() => props.onAddSignal(phase.id)}
            onRemoveSignal={idx => props.onRemoveSignal(phase.id, idx)}
            onNotesField={onNotesField}
            onScore={onScore}
          />
        )
      })}

      <div className="mt-14 pt-4 border-t border-line flex flex-wrap gap-x-4 gap-y-2 items-center text-sm text-muted">
        <span>{saveOk ? 'Autosaved in this browser.' : 'Autosave is unavailable. Copy the Markdown export before you close the tab.'}</span>
        <div className="ml-auto flex gap-2">
          <Button variant="quiet" onClick={props.onEdit}>Edit my answers</Button>
          <ResetButton onReset={props.onReset} />
        </div>
      </div>
    </div>
  )
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const id = window.setTimeout(() => setArmed(false), 4000)
    return () => window.clearTimeout(id)
  }, [armed])

  return (
    <Button variant="quiet" onClick={() => (armed ? onReset() : setArmed(true))}>
      {armed ? 'Click again to erase all notes' : 'Clear everything'}
    </Button>
  )
}