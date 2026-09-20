import type { AppState, Intake, Notes, Plan, Listing, Signal } from './types'
import { cleanPlan } from './cleanPlan'

export const STORAGE_KEY = 'niche-plan-app-v1'

export function defaultIntake(): Intake {
  return {
    niche: '', productType: '', buyer: '', skills: '',
    timeline: '72h', audience: 'none', country: '', platform: 'unsure',
  }
}

export function blankListing(): Listing {
  return { title: '', url: '', price: '', reviews: '', updated: '', included: '', strength: '' }
}

export function blankSignal(): Signal {
  return { link: '', wording: '' }
}

export function defaultNotes(plan: Plan): Notes {
  const listingLogs: Record<string, Listing[]> = {}
  const signalLogs: Record<string, Signal[]> = {}
  plan.phases.forEach(p => {
    if (p.kind === 'marketplace') listingLogs[p.id] = [blankListing()]
    if (p.kind === 'community') signalLogs[p.id] = [blankSignal(), blankSignal(), blankSignal()]
  })
  return {
    keywords: plan.keywords.join(', '),
    payoutOk: false,
    payoutPlatform: '',
    checks: {},
    listingLogs,
    signalLogs,
    complaints: '',
    wishes: '',
    pains: '',
    gap: { stakes: '', nobody: '', edge: '' },
    score: { demand: 0, money: 0, build: 0, reach: 0 },
    decision: '',
    promise: '',
    title: '',
    launch: '',
    full: '',
    features: ['', '', ''],
    timer: { base: 0, startedAt: null },
  }
}

function merge<T>(base: T, saved: unknown): T {
  if (!saved || typeof saved !== 'object') return base
  const s = saved as Record<string, unknown>
  const b = base as Record<string, unknown>
  const out: Record<string, unknown> = { ...b }
  Object.keys(b).forEach(k => {
    if (!(k in s)) return
    const bv = b[k]
    const sv = s[k]
    if (Array.isArray(bv)) {
      if (Array.isArray(sv)) out[k] = sv
    } else if (bv && typeof bv === 'object') {
      out[k] = Object.keys(bv).length ? merge(bv, sv) : sv
    } else if (bv === null || typeof bv === typeof sv) {
      out[k] = sv
    }
  })
  return out as T
}

export function loadState(): AppState {
  const st: AppState = { view: 'intake', intake: defaultIntake(), plan: null, notes: null }
  let raw: string | null = null
  try { raw = localStorage.getItem(STORAGE_KEY) } catch { /* ignore */ }
  if (!raw) return st
  try {
    const sv = JSON.parse(raw) as { view?: string; intake?: unknown; plan?: unknown; notes?: unknown }
    st.intake = merge(defaultIntake(), sv.intake)
    const plan = sv.plan ? cleanPlan(sv.plan, (sv.plan as { source?: 'rules' | 'ai' }).source === 'rules' ? 'rules' : 'ai') : null
    if (plan) {
      st.plan = plan
      st.notes = merge(defaultNotes(plan), sv.notes)
      st.view = sv.view === 'intake' ? 'intake' : 'plan'
    }
  } catch { /* ignore */ }
  return st
}

export function persist(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}