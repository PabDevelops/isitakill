export type Verdict = 'build' | 'kill'
export type PricingTier = 'free' | 'freemium' | 'paid'

export const CATEGORIES = [
  'Analytics',
  'Artificial Intelligence',
  'Automation',
  'Career',
  'Community',
  'Design Tools',
  'Developer Tools',
  'Education',
  'Finance',
  'Growth',
  'Health',
  'HR',
  'Marketing',
  'Monetization',
  'Newsletters',
  'Open Source',
  'Other',
  'Productivity',
  'SaaS',
  'Sales',
  'SEO',
  'Social Media',
  'Startups',
] as const

export const MAX_CATEGORIES = 3

export interface Project {
  id: string
  user_id: string
  name: string
  link: string | null
  description: string
  builder_verdict: Verdict
  slug: string
  created_at: string
  voting_ends_at: string | null
  screenshot_urls: string | null
  monthly_revenue: number | null
  users_count: number | null
  monthly_visits: number | null
  capital_invested: number | null
  logo_url: string | null
  thumbnail_url: string | null
  categories: string[] | null
  pricing_tier: PricingTier | null
  creator_name: string | null
  creator_twitter: string | null
}

export interface Vote {
  id: string
  project_id: string
  vote: Verdict
  voter_fingerprint: string
  created_at: string
}

export interface VoteSummary {
  build: number
  kill: number
  total: number
  buildPct: number
  killPct: number
  communityVerdict: Verdict | null
  isFlipped: boolean
}
