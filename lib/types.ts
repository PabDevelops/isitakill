export type Verdict = 'build' | 'kill'
export type PricingTier = 'free' | 'freemium' | 'paid'
export type BoostType = 'paid' | 'trial'

export interface BoostOption {
  days: number
  price: number
  label: string
}

export const BOOST_OPTIONS: BoostOption[] = [
  { days: 1, price: 3, label: 'Boost 1 day' },
  { days: 3, price: 7, label: 'Boost 3 days' },
  { days: 7, price: 12, label: 'Boost 7 days' },
  { days: 14, price: 20, label: 'Boost 14 days' },
]

export const TRIAL_BOOST_HOURS = 24

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
  boosted_until: string | null
  boost_type: BoostType | null
  trial_boost_views: number | null
  trial_boost_votes: number | null
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
