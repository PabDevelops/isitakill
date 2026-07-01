import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import { computeVoteSummary } from '@/lib/votes'
import { Verdict } from '@/lib/types'

export const revalidate = 10

export default async function ExplorePage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, votes(*)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black">Explore Projects</h1>
            <p className="text-zinc-400 mt-1">
              Vote BUILD or KILL on projects from the community.
            </p>
          </div>
          <Link
            href="/new"
            className="text-sm bg-yellow-400 text-black font-black px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap"
          >
            + Submit Yours
          </Link>
        </div>

        {!projects?.length ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-bold mb-2">No projects yet</p>
            <p className="mb-6">Be the first to submit one.</p>
            <Link
              href="/new"
              className="inline-block bg-yellow-400 text-black font-black px-8 py-3 rounded-xl hover:bg-yellow-300 transition-colors"
            >
              Submit Your Project →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const summary = computeVoteSummary(
                (project.votes ?? []) as { vote: Verdict }[],
                project.builder_verdict as Verdict
              )
              const votingClosed = project.voting_ends_at
                ? new Date(project.voting_ends_at) < new Date()
                : false

              return (
                <Link
                  key={project.id}
                  href={`/p/${project.slug}`}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-colors"
                >
                  {project.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.thumbnail_url}
                      alt={`${project.name} thumbnail`}
                      className="w-full aspect-[1.91/1] object-cover"
                    />
                  )}
                  <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {project.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.logo_url}
                          alt=""
                          className="w-6 h-6 rounded-md object-cover shrink-0"
                        />
                      )}
                      <h2 className="font-black text-lg truncate">
                        {project.name}
                      </h2>
                    </div>
                    {summary.isFlipped && votingClosed && (
                      <span className="text-xs bg-yellow-400 text-black font-black px-2 py-0.5 rounded shrink-0 ml-2">
                        🔄 FLIPPED
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-sm line-clamp-2">
                    {project.description}
                  </p>
                  {(project.categories?.length > 0 || project.pricing_tier) && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.pricing_tier && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 capitalize">
                          {project.pricing_tier}
                        </span>
                      )}
                      {project.categories?.slice(0, 3).map((cat: string) => (
                        <span
                          key={cat}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      Builder:{' '}
                      <span
                        className={
                          project.builder_verdict === 'build'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      >
                        {project.builder_verdict.toUpperCase()}
                      </span>
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        votingClosed
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {votingClosed ? 'Closed' : 'Voting open'}
                    </span>
                  </div>
                  <div className="flex rounded-full overflow-hidden h-2 bg-zinc-800">
                    <div
                      className="bg-green-500"
                      style={{ width: `${summary.buildPct}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${summary.killPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{summary.buildPct}% BUILD</span>
                    <span>{summary.total} votes</span>
                    <span>{summary.killPct}% KILL</span>
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
