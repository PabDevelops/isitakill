import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import DotGrid from '@/components/DotGrid'
import { computeVoteSummary } from '@/lib/votes'
import { Verdict, BOOST_ENABLED } from '@/lib/types'
import { BoostBadge } from '@/app/p/[slug]/BoostPanel'
import ExploreFilters from './ExploreFilters'

export const revalidate = 10

interface ExplorePageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    sort?: string
  }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { search, category, sort } = await searchParams
  const supabase = await createClient()

  // Query projects and their votes
  let query = supabase.from('projects').select('*, votes(*)')

  if (category) {
    query = query.contains('categories', [category])
  }

  const { data: rawProjects } = await query.order('created_at', { ascending: false })
  let projects = rawProjects ?? []

  // Perform search filter if query is set
  if (search) {
    const s = search.toLowerCase()
    projects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s)
    )
  }

  // Map with vote summaries
  const projectsWithSummary = projects.map((p) => {
    const summary = computeVoteSummary(
      (p.votes ?? []) as { vote: Verdict }[],
      p.builder_verdict as Verdict
    )
    return { ...p, summary }
  })

  // Sort projects
  if (sort === 'votes') {
    projectsWithSummary.sort((a, b) => b.summary.total - a.summary.total)
  } else if (sort === 'ending') {
    projectsWithSummary.sort((a, b) => {
      const aTime = a.voting_ends_at ? new Date(a.voting_ends_at).getTime() : Infinity
      const bTime = b.voting_ends_at ? new Date(b.voting_ends_at).getTime() : Infinity
      return aTime - bTime
    })
  } else {
    // Default: Sort by Boost rank first, then by created_at descending
    const boostRank = (p: typeof projects[0]) => {
      const active = p.boosted_until && new Date(p.boosted_until) > new Date()
      if (!active) return 2
      return p.boost_type === 'paid' ? 0 : p.boost_type === 'trial' ? 1 : 2
    }

    projectsWithSummary.sort((a, b) => {
      const rankA = boostRank(a)
      const rankB = boostRank(b)
      if (rankA !== rankB) return rankA - rankB
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  return (
    <div className="relative min-h-screen bg-[#060608]">
      <DotGrid variant="page" />
      <Nav />
      <div className="relative max-w-5xl mx-auto px-4 py-12 z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-100 tracking-tight">Explore Projects</h1>
            <p className="text-zinc-500 mt-1 text-sm">
              Discover and vote on projects submitted by developers worldwide.
            </p>
          </div>
          <Link
            href="/new"
            className="self-start md:self-auto text-sm bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)]"
          >
            + Submit Your Project
          </Link>
        </div>

        {/* Filters and Search Component */}
        <div className="bg-white/[0.01] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-md">
          <ExploreFilters
            currentSearch={search}
            currentCategory={category}
            currentSort={sort}
          />
        </div>

        {/* Projects Grid */}
        {!projectsWithSummary.length ? (
          <div className="text-center py-24 glass-card rounded-2xl space-y-4">
            <p className="text-6xl">🔍</p>
            <h2 className="text-xl font-bold text-zinc-200">No matching projects found</h2>
            <p className="text-zinc-500 max-w-sm mx-auto text-sm">
              Try adjusting your search criteria, category filters, or submit a new project yourself!
            </p>
            <div className="pt-2">
              <Link
                href="/new"
                className="inline-block bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-full hover:bg-yellow-300 transition-colors"
              >
                Submit Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsWithSummary.map((project) => {
              const summary = project.summary
              const votingClosed = project.voting_ends_at
                ? new Date(project.voting_ends_at) < new Date()
                : false

              const isBoosted =
                BOOST_ENABLED &&
                project.boosted_until &&
                new Date(project.boosted_until) > new Date()

              return (
                <Link
                  key={project.id}
                  href={`/p/${project.slug}`}
                  className={`glass-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                    isBoosted ? 'boosted-card-glow border-yellow-400/40 bg-yellow-400/[0.01]' : ''
                  }`}
                >
                  <div>
                    {project.thumbnail_url && (
                      <div className="relative aspect-[1.91/1] overflow-hidden border-b border-white/[0.06]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.thumbnail_url}
                          alt={`${project.name} thumbnail`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {project.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={project.logo_url}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover border border-white/[0.08]"
                            />
                          )}
                          <h2 className="font-bold text-lg text-zinc-100 truncate">
                            {project.name}
                          </h2>
                        </div>
                        {isBoosted && (
                          <span className="text-[9px] bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">
                            Boosted
                          </span>
                        )}
                      </div>

                      {isBoosted && (
                        <div className="text-[11px] pt-1">
                          <BoostBadge until={project.boosted_until} />
                        </div>
                      )}

                      <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>

                      {(project.categories && project.categories.length > 0 || project.pricing_tier) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.pricing_tier && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 capitalize">
                              {project.pricing_tier}
                            </span>
                          )}
                          {project.categories?.slice(0, 3).map((cat: string) => (
                            <span
                              key={cat}
                              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.03] text-zinc-400 border border-white/[0.08]"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 space-y-3">
                    <div className="flex items-center justify-between text-xs border-t border-white/[0.06] pt-4">
                      <span className="text-zinc-500">
                        Builder:{' '}
                        <span
                          className={
                            project.builder_verdict === 'build'
                              ? 'text-green-400 font-bold'
                              : 'text-red-400 font-bold'
                          }
                        >
                          {project.builder_verdict.toUpperCase()}
                        </span>
                      </span>
                      {votingClosed ? (
                        summary.isFlipped ? (
                          <span className="font-bold px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[10px]">
                            🔄 Flipped
                          </span>
                        ) : (
                          <span className="font-bold px-2.5 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400 border border-white/[0.06] text-[10px]">
                            ✓ Decided
                          </span>
                        )
                      ) : (
                        <span className="font-bold px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] animate-pulse">
                          Voting open
                        </span>
                      )}
                    </div>

                    <div className="flex rounded-full overflow-hidden h-2 bg-white/[0.05]">
                      <div
                        className="bg-green-500 transition-all duration-500"
                        style={{ width: `${summary.buildPct}%` }}
                      />
                      <div
                        className="bg-red-500 transition-all duration-500"
                        style={{ width: `${summary.killPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                      <span className="text-green-400">{summary.buildPct}% BUILD</span>
                      <span>{summary.total} votes</span>
                      <span className="text-red-400">{summary.killPct}% KILL</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
