import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import DotGrid from '@/components/DotGrid'
import { computeVoteSummary } from '@/lib/votes'
import { Verdict } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: projects } = await supabase
    .from('projects')
    .select('*, votes(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="relative min-h-screen bg-[#060608]">
      <DotGrid variant="page" />
      <Nav />
      
      <div className="relative max-w-4xl mx-auto px-4 py-12 z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Your Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">{user.email}</p>
          </div>
          <Link
            href="/new"
            className="text-sm bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-2.5 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(250,204,21,0.25)] whitespace-nowrap self-start sm:self-auto"
          >
            + New Submission
          </Link>
        </div>

        {/* Projects list */}
        {!projects?.length ? (
          <div className="text-center py-24 glass-card rounded-3xl space-y-4">
            <p className="text-6xl">🎯</p>
            <h2 className="text-xl font-bold text-zinc-200">No submissions yet</h2>
            <p className="text-zinc-500 max-w-sm mx-auto text-sm">
              Ready to find out if the internet believes in your side project? Submit your first project now.
            </p>
            <div className="pt-2">
              <Link
                href="/new"
                className="inline-block bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-300 hover:scale-[1.02] transition-colors"
              >
                Submit Your Project →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const summary = computeVoteSummary(
                (project.votes ?? []) as { vote: Verdict }[],
                project.builder_verdict as Verdict
              )
              const votingClosed =
                project.voting_ends_at
                  ? new Date(project.voting_ends_at) < new Date()
                  : false
              const isBoosted = project.boosted_until && new Date(project.boosted_until) > new Date()

              return (
                <div
                  key={project.id}
                  className={`glass-card rounded-2xl p-6 flex flex-col justify-between space-y-6 ${
                    isBoosted ? 'boosted-card-glow border-yellow-400/40 bg-yellow-400/[0.01]' : ''
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-zinc-100 truncate">{project.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {votingClosed ? (
                            summary.isFlipped ? (
                              <span className="text-[10px] bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                🔄 Flipped • {summary.total} {summary.total === 1 ? 'vote' : 'votes'}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-white/[0.03] text-zinc-400 border border-white/[0.08] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                ✓ Confirmed • {summary.total} {summary.total === 1 ? 'vote' : 'votes'}
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full animate-pulse whitespace-nowrap">
                              Voting open • {summary.total} {summary.total === 1 ? 'vote' : 'votes'}
                            </span>
                          )}
                          {isBoosted && (
                            <span className="text-[10px] bg-orange-400/10 text-orange-400 border border-orange-400/20 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                              🔥 Boosted
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                    <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
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
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold uppercase tracking-wider pt-1">
                      <Link
                        href={`/p/${project.slug}`}
                        title="View project details"
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-yellow-400 bg-white/[0.03] hover:bg-yellow-400/10 border border-white/[0.06] hover:border-yellow-400/20 transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400">{summary.buildPct}% BUILD</span>
                        <span className="text-red-400">{summary.killPct}% KILL</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
