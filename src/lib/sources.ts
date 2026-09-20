import type { PhaseKind } from './types'

type SourceDef = {
  label: string
  kinds: PhaseKind[]
  url: (q: string) => string
}

export const SOURCES: Record<string, SourceDef> = {
  etsy:          { label: 'Etsy',          kinds: ['marketplace'], url: q => `https://www.etsy.com/search?q=${q}` },
  gumroad:       { label: 'Gumroad',       kinds: ['marketplace'], url: q => `https://gumroad.com/discover?query=${q}` },
  creativemarket:{ label: 'Creative Market', kinds: ['marketplace'], url: q => `https://creativemarket.com/search?q=${q}` },
  producthunt:   { label: 'Product Hunt',  kinds: ['marketplace'], url: q => `https://www.producthunt.com/search?q=${q}` },
  github:        { label: 'GitHub',        kinds: ['marketplace'], url: q => `https://github.com/search?type=repositories&q=${q}` },
  upwork:        { label: 'Upwork',        kinds: ['marketplace'], url: q => `https://www.upwork.com/nx/search/jobs/?q=${q}` },
  reddit:        { label: 'Reddit',        kinds: ['community'],   url: q => `https://www.reddit.com/search/?q=${q}` },
  x:             { label: 'X',             kinds: ['community'],   url: q => `https://x.com/search?f=live&q=${q}` },
  hackernews:    { label: 'Hacker News',   kinds: ['community'],   url: q => `https://hn.algolia.com/?q=${q}` },
  google:        { label: 'Google',        kinds: ['marketplace', 'community'], url: q => `https://www.google.com/search?q=${q}` },
}