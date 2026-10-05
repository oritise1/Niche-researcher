import { usePlanState } from './hooks/usePlanState'
import { useAutosave } from './hooks/useAutosave'
import { IntakePage } from './pages/IntakePage'
import { PlanPage } from './pages/PlanPage'

export default function App() {
  const s = usePlanState()
  const saveOk = useAutosave(s.state)

  const inPlan = s.state.view === 'plan' && s.state.plan && s.state.notes

  return (
    <main className="max-w-230 mx-auto px-4 pb-18">
      <noscript>
        <p className="mt-3.5 text-muted">This page needs JavaScript.</p>
      </noscript>

      {!inPlan ? (
        <IntakePage
          intake={s.state.intake}
          hasExistingPlan={!!s.state.plan}
          onIntakeField={s.setIntakeField}
          onBuild={plan => s.buildPlan(plan)}
          onBack={() => s.setView('plan')}
        />
      ) : (
        <PlanPage
          plan={s.state.plan!}
          notes={s.state.notes!}
          intake={s.state.intake}
          saveOk={saveOk}
          onNotesField={s.setNotesField}
          onScore={s.setScore}
          onAddListing={s.addListing}
          onRemoveListing={s.removeListing}
          onListingChange={s.patchListing}
          onAddSignal={s.addSignal}
          onRemoveSignal={s.removeSignal}
          onSignalChange={s.patchSignal}
          onEdit={() => s.setView('intake')}
          onReset={s.reset}
          setTimer={s.setTimer}
        />
      )}
    </main>
  )
}