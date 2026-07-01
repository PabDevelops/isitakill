import { VoteSummary, Verdict } from './types'

export function computeVoteSummary(
  votes: { vote: Verdict }[],
  builderVerdict: Verdict
): VoteSummary {
  const build = votes.filter((v) => v.vote === 'build').length
  const kill = votes.filter((v) => v.vote === 'kill').length
  const total = votes.length
  const buildPct = total > 0 ? Math.round((build / total) * 100) : 0
  const killPct = total > 0 ? 100 - buildPct : 0
  const communityVerdict: Verdict | null =
    total === 0 ? null : build >= kill ? 'build' : 'kill'
  const isFlipped =
    communityVerdict !== null && communityVerdict !== builderVerdict
  return { build, kill, total, buildPct, killPct, communityVerdict, isFlipped }
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
  const random = Math.random().toString(36).slice(2, 7)
  return `${base}-${random}`
}
