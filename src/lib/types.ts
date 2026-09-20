export type PhaseKind = 'marketplace' | 'community' | 'decide'
export type ScoreKey = 'demand' | 'money' | 'build' | 'reach'
export type ProductType =
  | 'template' | 'uikit' | 'prompts' | 'ebook' | 'tool' | 'framer' | 'other'
export type Timeline = '72h' | '1w' | '2w'
export type Audience = 'none' | 'small' | 'medium' | 'large'
export type Platform = 'unsure' | 'etsy' | 'gumroad' | 'own'

export interface Intake {
  niche: string
  productType: ProductType | ''
  buyer: string
  skills: string
  timeline: Timeline
  audience: Audience
  country: string
  platform: Platform
}

export interface Phase {
  id: string
  kind: PhaseKind
  title: string
  minutes: number
  from: number
  to: number
  intro: string
  checks: string[]
  sources: string[]
}

export interface Plan {
  source: 'rules' | 'ai'
  note: string
  summary: string
  keywords: string[]
  phases: Phase[]
  communities: { subreddits: string[]; phrases: string[] }
  flags: { good: string[]; bad: string[] }
  score_weights: Record<ScoreKey, number>
  score_prompts: Record<ScoreKey, string>
  payout_note: string
  pricing_hint: string
}

export interface Listing {
  title: string
  url: string
  price: string
  reviews: string
  updated: string
  included: string
  strength: string
}

export interface Signal {
  link: string
  wording: string
}

export interface Notes {
  keywords: string
  payoutOk: boolean
  payoutPlatform: string
  checks: Record<string, boolean>
  listingLogs: Record<string, Listing[]>
  signalLogs: Record<string, Signal[]>
  complaints: string
  wishes: string
  pains: string
  gap: { stakes: string; nobody: string; edge: string }
  score: Record<ScoreKey, number>
  decision: '' | 'go' | 'pivot' | 'drop'
  promise: string
  title: string
  launch: string
  full: string
  features: string[]
  timer: { base: number; startedAt: number | null }
}

export interface AppState {
  view: 'intake' | 'plan'
  intake: Intake
  plan: Plan | null
  notes: Notes | null
}

export interface Config {
  webhookUrl: string
  timeoutMs: number
}