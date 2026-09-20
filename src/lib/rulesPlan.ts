import type { Intake, Plan, Phase } from './types'
import { SOURCES } from './sources'
import { str, strList, uniq, shortWords } from './text'

export const DEFAULT_CHECKS: Record<Phase['kind'], string[]> = {
  marketplace: [
    'Open the top 5 to 8 listings for each keyword',
    'Log price, reviews, last updated and what each one includes',
    'Read the 2 and 3 star reviews and note repeated complaints',
  ],
  community: [
    'Search the phrases below and read at least 10 threads',
    'Copy 3 or more real requests word for word',
    'Tally the pain points that repeat',
  ],
  decide: [
    'Fill in the gap analysis',
    'Score all four criteria',
    'Write the one-line promise and both prices',
  ],
}

export const DEFAULT_INTRO: Record<Phase['kind'], string> = {
  marketplace: 'Open the top 5 to 8 listings for each keyword. You want the price range, proof that people buy, and what buyers say is missing.',
  community: 'Search for real requests from your buyer. Copy the exact words people use, because you will reuse them in your listing copy.',
  decide: 'Fill the gaps, score honestly, and let the verdict guide the call.',
}

export const DEFAULT_PHRASES = ['is there a template for', 'how do you track', "I'd pay for", 'what do you use for']
export const DEFAULT_GOOD = [
  'Several listings with dozens or hundreds of reviews',
  'The same complaint shows up across competitors',
  'Prices cluster at a level you would be happy to charge',
  'People ask for this in threads and get answers like "I built my own"',
]
export const DEFAULT_BAD = [
  'Everything is priced very low and looks identical',
  'One seller dominates with thousands of reviews',
  'You cannot find anyone asking for this',
  'The only complaints are about limits you cannot fix',
]
export const DEFAULT_SCORE_PROMPTS = {
  demand: 'Are similar products already selling?',
  money: 'Does this buyer pay for solutions, or expect free?',
  build: 'Can you ship a polished version in your time frame?',
  reach: 'Can you get in front of 30 buyers directly?',
}
export const DEFAULT_PAYOUT =
  "Before you build, confirm that a payout method works in your country. Platforms and payout options differ by country and change over time, so check the platform's current payout country list."

const TYPES = {
  template: { label: 'template', word: 'template', src: ['etsy', 'gumroad'], subs: ['Notion', 'Airtable'], phrases: DEFAULT_PHRASES,
    price: 'Start around $19 to $49 for a multi-page system, and test higher for a full CRM or business suite.' },
  uikit: { label: 'UI kit or code starter', word: 'ui kit', src: ['gumroad', 'github'], subs: ['reactjs', 'webdev', 'SideProject'], phrases: ['looking for a starter for', 'best boilerplate for', 'has anyone built', "I'd pay for a kit"],
    price: 'Start around $39 to $99, with a higher commercial-license tier.' },
  prompts: { label: 'AI prompt or workflow pack', word: 'prompts', src: ['gumroad', 'etsy'], subs: ['PromptEngineering', 'ChatGPT'], phrases: ['best prompts for', 'how do you use AI for', 'workflow for', "I'd pay for"],
    price: 'Start around $19 to $49 for a focused, role-specific pack.' },
  ebook: { label: 'ebook or guide', word: 'guide', src: ['gumroad', 'etsy'], subs: ['Entrepreneur', 'SideProject'], phrases: ['best guide to', 'how do I', 'any good resources on', "I'd pay for"],
    price: 'Start around $15 to $39 for a narrow, actionable guide.' },
  tool: { label: 'small web tool', word: 'calculator', src: ['producthunt', 'github'], subs: ['SideProject', 'webdev', 'startups'], phrases: ['is there a tool for', 'how do you calculate', 'I wish there was', "I'd pay for"],
    price: 'Start around $29 to $79 one-time, or a low monthly fee if it saves recurring work.' },
  framer: { label: 'Framer, Webflow or Figma template', word: 'template', src: ['gumroad', 'creativemarket'], subs: ['webflow', 'framer', 'FigmaDesign'], phrases: ['looking for a template for', 'best template for', 'anyone know a template for', "I'd pay for"],
    price: 'Start around $49 to $99 for a polished, niche-specific template.' },
  other: { label: 'digital product', word: 'digital product', src: ['gumroad', 'etsy'], subs: ['Entrepreneur', 'SideProject'], phrases: DEFAULT_PHRASES,
    price: 'Use the price cluster you find in your research as the anchor.' },
} as const

const TIMELINES: Record<string, string> = { '72h': '72 hours', '1w': 'about a week', '2w': 'two weeks or more' }

const BUYER_SUBS: [RegExp, string[]][] = [
  [/freelanc|agency|agencies|consult/i, ['freelance', 'Entrepreneur', 'smallbusiness']],
  [/develop|engineer|coder|programmer/i, ['webdev', 'reactjs', 'SideProject']],
  [/design|ux|\bui\b/i, ['web_design', 'UI_Design', 'FigmaDesign']],
  [/student|study/i, ['GetStudying', 'studytips', 'college']],
  [/job|career|resume/i, ['jobs', 'resumes', 'careerguidance']],
  [/creator|youtube|content|social/i, ['NewTubers', 'content_marketing', 'socialmedia']],
  [/small business|owner|shop|store|ecommerce/i, ['smallbusiness', 'Entrepreneur', 'ecommerce']],
]

export function normalizeMinutes(ph: Phase[]): void {
  const sum = ph.reduce((a, p) => a + p.minutes, 0)
  const raw = ph.map(p => (p.minutes * 30) / sum)
  const fl = raw.map(x => Math.max(1, Math.floor(x)))
  let diff = 30 - fl.reduce((a, b) => a + b, 0)
  const order = raw.map((x, i) => ({ i, r: x - Math.floor(x) })).sort((a, b) => b.r - a.r)
  let k = 0
  while (diff > 0) { fl[order[k % order.length].i]++; diff--; k++ }
  while (diff < 0) {
    const mi = fl.indexOf(Math.max(...fl))
    if (fl[mi] > 1) { fl[mi]--; diff++ } else break
  }
  let t = 0
  ph.forEach((p, i) => { p.minutes = fl[i]; p.from = t; t += p.minutes; p.to = t })
}

export function rulesPlan(i: Intake): Plan {
  const T = TYPES[(i.productType || 'other') as keyof typeof TYPES] || TYPES.other
  let srcs = T.src.slice()
  if (i.platform === 'etsy' || i.platform === 'gumroad') {
    srcs = [i.platform, ...srcs.filter(x => x !== i.platform)]
  }
  srcs = srcs.slice(0, 2)
  const niche = shortWords(i.niche, 6) || 'your niche'
  const buyer = shortWords(i.buyer, 4) || 'your buyer'
  const keywords = [niche, `${niche} ${T.word}`, `${buyer} ${T.word}`, `${T.word} for ${buyer}`]
    .map(s => str(s, 60)).filter(uniq)
  let subs: string[] = []
  BUYER_SUBS.forEach(b => { if (b[0].test(i.buyer || '')) subs = subs.concat(b[1]) })
  subs = subs.concat(T.subs as unknown as string[])
  if (!subs.length) subs = ['Entrepreneur', 'SideProject']
  const timeline = TIMELINES[i.timeline] || TIMELINES['72h']
  const s2 = srcs[1] || 'google'
  const second: Record<string, string> = {
    marketplace: 'Same job, different crowd. Focus on tiers, bundles and how the best products present themselves.',
    github: 'Look for free and open-source alternatives. Your paid version has to clearly beat them.',
    producthunt: 'See who has launched something similar, what people said in comments, and what they asked for next.',
  }
  const secondChecks = s2 === 'github'
    ? ['Search for free or open-source alternatives', 'Note stars, last commit and open issues', 'Decide what a paid version must add']
    : s2 === 'producthunt'
      ? ['Find launches that solve a similar problem', 'Read the comments for complaints and feature requests', 'Note upvotes and how the maker positioned it']
      : ['Check tiers, bundles and price anchors', 'Compare screenshots, demo and preview quality', 'Note how top products are named and positioned']

  const reachPrompt = i.audience === 'none'
    ? 'Can you get in front of 30 buyers directly without an audience?'
    : 'Can your audience plus direct outreach reach 30 buyers?'
  const country = str(i.country, 60)

  const phases: Phase[] = [
    { id: 'p1', kind: 'marketplace', title: `${SOURCES[srcs[0]].label}: what already sells?`, minutes: 10, from: 0, to: 0, intro: DEFAULT_INTRO.marketplace, checks: DEFAULT_CHECKS.marketplace.slice(), sources: [srcs[0]] },
    { id: 'p2', kind: 'marketplace', title: `${SOURCES[s2].label}: ${s2 === 'github' ? 'what free alternatives exist?' : s2 === 'producthunt' ? 'who else is launching this?' : 'how do serious sellers position this?'}`, minutes: 7, from: 0, to: 0, intro: second[s2] || second.marketplace, checks: secondChecks, sources: [s2] },
    { id: 'p3', kind: 'community', title: 'Communities: what are people asking for?', minutes: 10, from: 0, to: 0, intro: `Search for real requests from ${buyer}. Copy the exact words people use, because you will reuse them in your listing copy.`, checks: DEFAULT_CHECKS.community.slice(), sources: ['reddit', 'x'] },
    { id: 'p4', kind: 'decide', title: 'Decide: go, pivot or drop', minutes: 3, from: 0, to: 0, intro: DEFAULT_INTRO.decide, checks: DEFAULT_CHECKS.decide.slice(), sources: [] },
  ]
  normalizeMinutes(phases)

  return {
    source: 'rules',
    note: 'This plan comes from built-in rules.',
    summary: `A 30 minute check of whether "${niche}" has proven demand among ${buyer}, tuned for a ${T.label} you can ship in ${timeline}.`,
    keywords,
    phases,
    communities: { subreddits: subs.filter(uniq).slice(0, 5), phrases: (T.phrases as unknown as string[]).slice() },
    flags: { good: DEFAULT_GOOD.slice(), bad: DEFAULT_BAD.slice() },
    score_weights: { demand: 3, money: 2, build: i.timeline === '72h' ? 3 : 2, reach: i.audience === 'none' ? 3 : i.audience === 'large' ? 1 : 2 },
    score_prompts: {
      demand: `Are similar products already selling to ${buyer}?`,
      money: `Does ${buyer} pay for solutions, or expect free?`,
      build: `Can you ship a polished version in ${timeline}?`,
      reach: reachPrompt,
    },
    payout_note: country
      ? `Before you build, confirm that a payout method works in ${country}. Platforms and payout options differ by country and change over time, so check the platform's current payout country list.`
      : DEFAULT_PAYOUT,
    pricing_hint: T.price,
  }
}
export const TYPES_FOR_EXPORT = TYPES