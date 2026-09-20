import type { Plan, Phase, PhaseKind, ScoreKey } from './types'
import { SOURCES } from './sources'
import { str, strList, uniq } from './text'
import {
  DEFAULT_CHECKS,
  DEFAULT_INTRO,
  DEFAULT_PHRASES,
  DEFAULT_GOOD,
  DEFAULT_BAD,
  DEFAULT_SCORE_PROMPTS,
  DEFAULT_PAYOUT,
  normalizeMinutes,
} from './rulesPlan'

const KINDS: PhaseKind[] = ['marketplace', 'community', 'decide']
const SCORE_KEYS: ScoreKey[] = ['demand', 'money', 'build', 'reach']

function defaultTitle(kind: PhaseKind, src?: string): string {
  if (kind === 'decide') return 'Decide: go, pivot or drop'
  if (kind === 'community') return 'Communities: what are people asking for?'
  return `${src && SOURCES[src] ? SOURCES[src].label : 'Marketplace'}: what already sells?`
}

/**
 * Strict sanitizer for AI-generated plans.
 * Returns a normalized Plan, or null if the shape is invalid.
 * Caller falls back to rulesPlan() on null.
 */
export function cleanPlan(raw: unknown, source: 'rules' | 'ai'): Plan | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const keywords = strList(r.keywords, 60, 6)
  if (keywords.length < 2) return null

  const rawPhases = Array.isArray(r.phases) ? r.phases.slice(0, 4) : []
  if (rawPhases.length < 3) return null

  const phases: Phase[] = []
  let nDecide = 0
  let nMkt = 0
  let nComm = 0

  for (let i = 0; i < rawPhases.length; i++) {
    const p = rawPhases[i]
    if (!p || typeof p !== 'object') return null
    const po = p as Record<string, unknown>

    const kind = KINDS.includes(po.kind as PhaseKind) ? (po.kind as PhaseKind) : null
    if (!kind) return null

    // exactly one 'decide', and it must be last
    if (kind === 'decide') {
      nDecide++
      if (i !== rawPhases.length - 1) return null
    }
    if (kind === 'community') nComm++
    if (kind === 'marketplace') nMkt++

    // sources: allowlist only, must match the phase kind
    let srcs = (Array.isArray(po.sources) ? po.sources : [])
      .filter((s): s is string => typeof s === 'string' && Object.prototype.hasOwnProperty.call(SOURCES, s) && SOURCES[s].kinds.includes(kind))
      .filter(uniq)
      .slice(0, 2)

    if (kind === 'decide') {
      srcs = []
    } else if (!srcs.length) {
      // strict: missing sources is invalid, do not silently default
      return null
    }

    let checks = strList(po.checks, 120, 4)
    if (checks.length < 2) checks = DEFAULT_CHECKS[kind].slice()

    const rawMin = Math.round(Number(po.minutes))
    const mins = Number.isFinite(rawMin) && rawMin >= 1 ? Math.min(rawMin, 20) : kind === 'decide' ? 3 : 8

    phases.push({
      id: `p${i + 1}`,
      kind,
      title: str(po.title, 60) || defaultTitle(kind, srcs[0]),
      minutes: mins,
      from: 0,
      to: 0,
      intro: str(po.intro, 240) || DEFAULT_INTRO[kind],
      checks,
      sources: srcs,
    })
  }

  if (nDecide !== 1 || nMkt < 1 || nComm < 1) return null
  normalizeMinutes(phases)

  const rc = (r.communities && typeof r.communities === 'object' ? r.communities : {}) as Record<string, unknown>
  const subs = (Array.isArray(rc.subreddits) ? rc.subreddits : [])
    .map(s => str(s, 25).replace(/^\/?r\//i, ''))
    .filter(s => /^[A-Za-z0-9_]{2,21}$/.test(s))
    .filter(uniq)
    .slice(0, 5)
  let phrases = strList(rc.phrases, 60, 5)
  if (phrases.length < 2) phrases = DEFAULT_PHRASES.slice()

  const rf = (r.flags && typeof r.flags === 'object' ? r.flags : {}) as Record<string, unknown>
  let good = strList(rf.good, 140, 4)
  let bad = strList(rf.bad, 140, 4)
  if (good.length < 2) good = DEFAULT_GOOD.slice()
  if (bad.length < 2) bad = DEFAULT_BAD.slice()

  const rw = (r.score_weights && typeof r.score_weights === 'object' ? r.score_weights : {}) as Record<string, unknown>
  const rp = (r.score_prompts && typeof r.score_prompts === 'object' ? r.score_prompts : {}) as Record<string, unknown>
  const weights = {} as Record<ScoreKey, number>
  const prompts = {} as Record<ScoreKey, string>
  SCORE_KEYS.forEach(k => {
    const n = Math.round(Number(rw[k]))
    weights[k] = Number.isFinite(n) ? Math.min(3, Math.max(1, n)) : 2
    prompts[k] = str(rp[k], 120) || DEFAULT_SCORE_PROMPTS[k]
  })

  return {
    source: source === 'rules' ? 'rules' : 'ai',
    note: str(r.note, 200),
    summary: str(r.summary, 280),
    keywords,
    phases,
    communities: { subreddits: subs, phrases },
    flags: { good, bad },
    score_weights: weights,
    score_prompts: prompts,
    payout_note: str(r.payout_note, 240) || DEFAULT_PAYOUT,
    pricing_hint: str(r.pricing_hint, 160),
  }
}