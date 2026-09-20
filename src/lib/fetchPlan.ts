import type { Config, Intake, Plan } from './types'
import { cleanPlan } from './cleanPlan'

export const CONFIG: Config = {
  // Paste your n8n production webhook URL here. Leave empty to use rules only.
  webhookUrl: '',
  timeoutMs: 45_000,
}

interface WebhookResponse {
  ok?: boolean
  plan?: unknown
}

/**
 * POSTs the intake to the n8n webhook and returns a validated Plan.
 * Throws on network error, timeout, non-2xx, ok:false, or invalid plan.
 */
export async function fetchPlan(intake: Intake, honeypot: string): Promise<Plan> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), CONFIG.timeoutMs)

  try {
    const r = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ v: 1, hp: honeypot, intake }),
      signal: ctrl.signal,
    })
    if (!r.ok) throw new Error(`http ${r.status}`)
    const j = (await r.json()) as WebhookResponse
    if (!j || j.ok !== true) throw new Error('rejected')
    const plan = cleanPlan(j.plan, 'ai')
    if (!plan) throw new Error('invalid plan')
    return plan
  } finally {
    clearTimeout(timer)
  }
}