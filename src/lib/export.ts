import type { Notes, Plan, Intake } from './types'
import { SCORE_KEYS, SCORE_LABELS, glanceText, verdictFor } from './scoring'
import { TYPES_FOR_EXPORT } from './rulesPlan'

export const today = () => new Date().toISOString().slice(0, 10)

function cell(s: unknown): string {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim()
}

export function toMarkdown(plan: Plan, notes: Notes, intake: Intake): string {
  const L: string[] = []
  const T = TYPES_FOR_EXPORT[(intake.productType || 'other') as keyof typeof TYPES_FOR_EXPORT] || TYPES_FOR_EXPORT.other

  L.push(`# Research log: ${intake.niche || 'untitled niche'}`)
  L.push('')
  L.push(`Product: ${T.label} for ${intake.buyer || 'unspecified buyer'}`)
  L.push(`Date: ${today()}`)
  L.push(`Keywords searched: ${notes.keywords}`)
  L.push(`Payout confirmed: ${notes.payoutOk ? 'yes' : 'no'}${notes.payoutPlatform ? ` (${notes.payoutPlatform})` : ''}`)
  L.push('')

  let firstMkt = true
  plan.phases.forEach((ph, i) => {
    L.push(`## ${i + 1}. ${ph.title}`)
    L.push('')

    if (ph.kind === 'marketplace') {
      L.push('| Title | URL | Price | Reviews or sales | Last updated | Included | Standout strength |')
      L.push('|---|---|---|---|---|---|---|')
      ;(notes.listingLogs[ph.id] || []).forEach(l => {
        if (!(l.title || l.url || l.price || l.reviews || l.updated || l.included || l.strength)) return
        L.push(`| ${cell(l.title)} | ${cell(l.url)} | ${cell(l.price)} | ${cell(l.reviews)} | ${cell(l.updated)} | ${cell(l.included)} | ${cell(l.strength)} |`)
      })
      L.push('')
      if (firstMkt) {
        firstMkt = false
        L.push('Complaints that repeat:')
        L.push(notes.complaints || '(none recorded)')
        L.push('')
        L.push('Features people wished for:')
        L.push(notes.wishes || '(none recorded)')
        L.push('')
      }
    } else if (ph.kind === 'community') {
      const sigs = (notes.signalLogs[ph.id] || []).filter(s => s.wording.trim() || s.link.trim())
      if (!sigs.length) L.push('(none recorded)')
      sigs.forEach(s => L.push(`- ${cell(s.wording)}${s.link ? ` (${cell(s.link)})` : ''}`))
      L.push('')
      L.push('Pain points that repeat:')
      L.push(notes.pains || '(none recorded)')
      L.push('')
    } else {
      L.push(glanceText(plan, notes))
      L.push('')
      L.push(`Table stakes: ${notes.gap.stakes || '(blank)'}`)
      L.push('')
      L.push(`What nobody does well: ${notes.gap.nobody || '(blank)'}`)
      L.push('')
      L.push(`My unfair advantage: ${notes.gap.edge || '(blank)'}`)
      L.push('')
      SCORE_KEYS.forEach(k => L.push(`- ${SCORE_LABELS[k]}: ${notes.score[k]}/5 (weight ${plan.score_weights[k]})`))
      const v = verdictFor(plan, notes)
      L.push(`- Total: ${v.total}/20. ${v.t}.`)
      L.push('')
      const names: Record<string, string> = { go: 'Go', pivot: 'Pivot to runner-up', drop: 'Drop' }
      L.push(`Decision: ${names[notes.decision] || '(not chosen)'}`)
      L.push(`Promise: ${notes.promise || '(blank)'}`)
      L.push(`Working title: ${notes.title || '(blank)'}`)
      L.push(`Launch price: ${notes.launch || '(blank)'}   Full price: ${notes.full || '(blank)'}`)
      L.push('')
      L.push('Top 3 features to build first:')
      notes.features.slice(0, 3).forEach((f, n) => L.push(`${n + 1}. ${f || '(blank)'}`))
      L.push('')
    }
  })

  return L.join('\n')
}