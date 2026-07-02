import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { computeVoteSummary } from '@/lib/votes'
import { Verdict } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  const isPaid = profile?.subscription_status === 'active'

  const { data: projects } = await supabase
    .from('projects')
    .select('*, votes(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-100">Your Projects</h1>
            <p className="text-zinc-600 text-sm mt-1">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {isPaid ? (
              <span className="text-xs bg-yellow-400 text-black font-semibold px-3 py-1 rounded-full">
                PRO
              </span>
            ) : (
              <a
                href="/api/stripe/checkout"
                className="text-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 font-medium px-4 py-2 rounded-full transition-colors"
              >
                Upgrade to Pro →
              </a>
            )}
            <Link
              href="/new"
              className="text-sm bg-yellow-400 text-black font-medium px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors"
            >
              + New Project
            </Link>
          </div>
        </div>

        {!isPaid && (
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              <span className="text-zinc-200 font-medium">Free tier:</span> 1 active
              project at a time.
            </p>
            <a
              href="/api/stripe/checkout"
              className="text-sm text-yellow-400 font-medium hover:text-yellow-300"
            >
              Upgrade for $8/mo →
            </a>
          </div>
        )}

        {!projects?.length ? (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-5xl mb-4">🎯</p>
            <p className="text-lg font-semibold mb-2 text-zinc-300">No projects yet</p>
            <p className="mb-6 text-zinc-500">
              Submit your first project and let the internet decide.
            </p>
            <Link
              href="/new"
              className="inline-block bg-yellow-400 text-black font-semibold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors"
            >
              Submit Your Project →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const summary = computeVoteSummary(
                (project.votes ?? []) as { vote: Verdict }[],
                project.builder_verdict as Verdict
              )
              const votingClosed =
                project.voting_ends_at
                  ? new Date(project.voting_ends_at) < new Date()
                  : false

              return (
                <div
                  key={project.id}
                  className="bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.14] rounded-2xl p-6 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-100">{project.name}</h2>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            votingClosed
                              ? 'bg-white/[0.06] text-zinc-400'
                              : 'bg-green-500/10 text-green-400'
                          }`}
                        >
                          {votingClosed ? 'Closed' : 'Voting open'}
                        </span>
                        {summary.isFlipped && (
                          <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 font-medium px-2 py-0.5 rounded-full">
                            🔄 Flipped
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/p/${project.slug}`}
                      className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
                    >
                      View →
                    </Link>
                  </div>
                  <div className="flex rounded-full overflow-hidden h-1.5 bg-white/[0.05] mb-2">
                    <div
                      className="bg-green-500"
                      style={{ width: `${summary.buildPct}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${summary.killPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>{summary.buildPct}% BUILD</span>
                    <span>{summary.total} votes</span>
                    <span>{summary.killPct}% KILL</span>
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
