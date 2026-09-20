import type { Notes, Plan, ScoreKey } from './types'

export const SCORE_KEYS: ScoreKey[] = ['demand', 'money', 'build', 'reach']

export const SCORE_LABELS: Record<ScoreKey, string> = {
  demand: 'Proof of demand',
  money: 'Buyer has money',
  build: 'Buildable in your time frame',
  reach: 'Reachable with your audience',
}

export const money = (n: number) => `$${Math.round(n * 100) / 100}`

export function phasesOf(plan: Plan, kind: Plan['phases'][number]['kind']) {
  return plan.phases.filter(p => p.kind === kind)
}

export function priceList(plan: Plan, notes: Notes): number[] {
  const out: number[] = []
  phasesOf(plan, 'marketplace').forEach(p => {
    ;(notes.listingLogs[p.id] || []).forEach(l => {
      const n = parseFloat(String(l.price).replace(/[^0-9.]/g, ''))
      if (Number.isFinite(n) && n > 0) out.push(n)
    })
  })
  return out
}

export function listingCount(plan: Plan, notes: Notes): number {
  let c = 0
  phasesOf(plan, 'marketplace').forEach(p => {
    ;(notes.listingLogs[p.id] || []).forEach(l => {
      if (l.title.trim() || l.url.trim() || String(l.price).trim()) c++
    })
  })
  return c
}

export function signalCount(plan: Plan, notes: Notes): number {
  let c = 0
  phasesOf(plan, 'community').forEach(p => {
    ;(notes.signalLogs[p.id] || []).forEach(s => {
      if (s.wording.trim() || s.link.trim()) c++
    })
  })
  return c
}

function mode(a: number[]): { v: number; n: number } | null {
  const c: Record<number, number> = {}
  a.forEach(v => { c[v] = (c[v] || 0) + 1 })
  let best: { v: number; n: number } | null = null
  Object.keys(c).forEach(k => {
    const n = c[+k]
    const v = +k
    if (n >= 2 && (!best || n > best.n || (n === best.n && v < best.v))) best = { v, n }
  })
  return best
}

export function glanceText(plan: Plan, notes: Notes): string {
  const n = listingCount(plan, notes)
  const ps = priceList(plan, notes)
  const sig = signalCount(plan, notes)
  const parts: string[] = []

  if (!n) {
    parts.push('No listings logged yet.')
  } else {
    let s = `${n} ${n === 1 ? 'listing' : 'listings'} logged`
    if (ps.length) {
      const lo = Math.min(...ps)
      const hi = Math.max(...ps)
      s += `, priced ${money(lo)}${hi !== lo ? ` to ${money(hi)}` : ''}`
      const m = mode(ps)
      if (m) s += ` (most common ${money(m.v)})`
    }
    parts.push(s + '.')
  }
  parts.push(`${sig} of 3 demand signals found${sig >= 3 ? ', enough to count.' : '.'}`)
  return parts.join(' ')
}

export interface Verdict {
  total: number
  cls: '' | 'go' | 'narrow' | 'pivot'
  t: string
  b: string
}

export function scoreTotal(plan: Plan, notes: Notes): { total: number; all: boolean } {
  let sumW = 0
  let sum = 0
  let all = true
  SCORE_KEYS.forEach(k => {
    const w = plan.score_weights[k]
    const v = notes.score[k]
    sumW += w
    if (v) sum += v * w
    else all = false
  })
  return { total: Math.round((sum / (5 * sumW)) * 20), all }
}

export function verdictFor(plan: Plan, notes: Notes): Verdict {
  const st = scoreTotal(plan, notes)
  const total = st.total
  const sig = signalCount(plan, notes)

  if (!st.all) {
    return { total, cls: '', t: 'Score all four criteria', b: 'The verdict appears once every slider is above zero.' }
  }
  if (total >= 15 && sig >= 3) {
    return { total, cls: 'go', t: 'Go', b: `Score ${total} with ${sig} demand signals. Move to the pre-sell test: a one-page landing page, then 20 to 30 direct messages.` }
  }
  if (total >= 15) {
    return { total, cls: 'narrow', t: 'Almost: find more demand signals', b: `Score ${total}, but you have ${sig} of 3 real requests. Go back to the community stop before you build anything.` }
  }
  if (total >= 12) {
    return { total, cls: 'narrow', t: 'Narrow the niche', b: `Score ${total}. Pick a tighter buyer or a more specific problem, then rerun a 10 minute search.` }
  }
  return { total, cls: 'pivot', t: 'Pivot to your runner-up', b: `Score ${total}, below 12. Build a new plan for your next idea.` }
}