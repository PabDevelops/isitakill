import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import GlowOrb from '@/components/GlowOrb'
import DotGrid from '@/components/DotGrid'
import { computeVoteSummary } from '@/lib/votes'
import { Verdict } from '@/lib/types'

export const revalidate = 10

export default async function Home() {
  const supabase = await createClient()

  // Fetch all projects to calculate real-time stats
  const { data: rawProjects } = await supabase
    .from('projects')
    .select('*, votes(vote)')
    .order('created_at', { ascending: false })

  const projects = rawProjects ?? []
  
  // Real-time live stats calculation
  const totalProjects = projects.length
  const totalVotes = projects.reduce((acc, p) => acc + (p.votes?.length ?? 0), 0)
  const totalFlips = projects.filter((p) => {
    const votingClosed = p.voting_ends_at ? new Date(p.voting_ends_at) < new Date() : false
    if (!votingClosed) return false
    const summary = computeVoteSummary(p.votes ?? [], p.builder_verdict as Verdict)
    return summary.isFlipped
  }).length

  // Filter out the 3 most recently submitted projects currently active
  let displayProjects = projects
    .filter((p) => !p.voting_ends_at || new Date(p.voting_ends_at) > new Date())
    .slice(0, 3)

  // If there are fewer than 3 active projects, pad it with recently decided/completed ones
  if (displayProjects.length < 3) {
    const closedProjects = projects
      .filter((p) => p.voting_ends_at && new Date(p.voting_ends_at) <= new Date())
      .slice(0, 3 - displayProjects.length)
    displayProjects = [...displayProjects, ...closedProjects]
  }

  const hasActiveProjects = displayProjects.some(
    (p) => !p.voting_ends_at || new Date(p.voting_ends_at) > new Date()
  )

  return (
    <div className="min-h-screen bg-[#060608] overflow-x-hidden relative">
      <Nav />

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-4 pt-28 pb-20 text-center z-10">
        <div className="absolute left-1/2 top-8 -translate-x-1/2 pointer-events-none">
          <GlowOrb size={500} />
        </div>
        <DotGrid className="opacity-80" />

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.02] backdrop-blur-md text-zinc-400 text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Brutal honesty required
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] text-zinc-100 max-w-4xl mx-auto">
            Is your project worth <span className="text-gradient-gold font-black">saving</span>?
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            You built it. You&apos;re not sure if it&apos;s worth the server cost. Let
            strangers decide — and find out if you were wrong.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/new"
              className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-[0_0_30px_rgba(250,204,21,0.25)]"
            >
              Submit your project →
            </Link>
            <Link
              href="#how"
              className="px-8 py-4 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.2] text-zinc-300 font-semibold rounded-full transition-all"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Row */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-3 gap-0.5 bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
          {[
            { label: 'Side Projects Submitted', value: totalProjects, icon: '🚀' },
            { label: 'Votes Cast by Hackers', value: totalVotes, icon: '🗳️' },
            { label: 'Projects Flipped', value: totalFlips, icon: '🔄' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#0b0b0e]/80 backdrop-blur-md p-6 text-center space-y-1">
              <div className="text-xl sm:text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl sm:text-4xl font-extrabold text-zinc-100">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live / Example cards */}
      <section className="max-w-5xl mx-auto px-4 pb-24 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">
              {hasActiveProjects ? '🔥 On the Chopping Block' : '⚡ Recent Submissions'}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {hasActiveProjects ? 'Vote now to decide the fate of these projects.' : 'Decided community verdicts and past submissions.'}
            </p>
          </div>
          <Link href="/explore" className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">
            View all projects →
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {displayProjects.length > 0 ? (
            displayProjects.map((project) => {
              const summary = computeVoteSummary(
                (project.votes ?? []) as { vote: Verdict }[],
                project.builder_verdict as Verdict
              )
              const killPct = 100 - summary.buildPct
              const isBoosted = project.boosted_until && new Date(project.boosted_until) > new Date()
              const votingClosed = project.voting_ends_at
                ? new Date(project.voting_ends_at) < new Date()
                : false
              return (
                <Link
                  key={project.id}
                  href={`/p/${project.slug}`}
                  className={`glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 ${
                    isBoosted ? 'boosted-card-glow border-yellow-400/40 bg-yellow-400/[0.02]' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {project.logo_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={project.logo_url} alt="" className="w-6 h-6 rounded-md object-cover" />
                        )}
                        <h3 className="font-bold text-lg text-zinc-100 truncate">{project.name}</h3>
                      </div>
                      {isBoosted ? (
                        <span className="text-[9px] bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">
                          Boosted
                        </span>
                      ) : votingClosed && summary.isFlipped ? (
                        <span className="text-[9px] bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">
                          🔄 Flipped
                        </span>
                      ) : votingClosed ? (
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">
                          ✓ Decided
                        </span>
                      ) : null}
                    </div>
                    <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed">{project.description}</p>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs border-t border-white/[0.06] pt-3">
                      <span className="text-zinc-500">
                        Builder: <span className={project.builder_verdict === 'build' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>{project.builder_verdict.toUpperCase()}</span>
                      </span>
                      <span className="text-zinc-500">{summary.total} {summary.total === 1 ? 'vote' : 'votes'}</span>
                    </div>

                    <div className="flex rounded-full overflow-hidden h-2 bg-white/[0.05]">
                      <div className="bg-green-500 transition-all duration-500" style={{ width: `${summary.buildPct}%` }} />
                      <div className="bg-red-500 transition-all duration-500" style={{ width: `${killPct}%` }} />
                    </div>

                    <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                      <span className="text-green-400/80">{summary.buildPct}% BUILD</span>
                      <span className="text-red-400/80">{killPct}% KILL</span>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-3 text-center py-20 glass-card rounded-2xl space-y-4">
              <p className="text-5xl">🔭</p>
              <h3 className="text-xl font-bold text-zinc-300">No projects submitted yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto text-sm">
                Put your project on the chopping block first and let the community decide!
              </p>
              <div className="pt-2">
                <Link
                  href="/new"
                  className="inline-block bg-yellow-400 text-black font-semibold px-6 py-2.5 rounded-full hover:bg-yellow-300 transition-colors"
                >
                  Submit Your Project
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="border-t border-white/[0.06] max-w-5xl mx-auto px-4 py-24 relative z-10"
      >
        <h2 className="text-3xl font-extrabold text-center mb-4 text-zinc-100">
          How it works
        </h2>
        <p className="text-zinc-400 text-center max-w-md mx-auto mb-16">
          Decision paralysis is real. Let a jury of fellow builders inspect your statistics and make the hard call.
        </p>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'You submit the data',
              body: 'Tell the community about your project, metrics (revenue, DAUs, cost), and your own honest verdict.',
              gradient: 'from-amber-500/10 to-yellow-400/5'
            },
            {
              step: '02',
              title: 'Strangers vote',
              body: 'The community votes BUILD or KILL blind to your opinion. You get unbiased, unfiltered feedback.',
              gradient: 'from-emerald-500/10 to-teal-400/5'
            },
            {
              step: '03',
              title: 'The flip happens',
              body: 'After 14 days, the vote locks. If the community disagrees with you, the project is officially flipped.',
              gradient: 'from-rose-500/10 to-red-400/5'
            },
          ].map(({ step, title, body, gradient }) => (
            <div key={step} className={`glass-card rounded-2xl p-8 space-y-4 border-t-2 relative overflow-hidden bg-gradient-to-br ${gradient}`}>
              <div className="text-5xl font-black text-white/5 absolute right-4 top-4 select-none">{step}</div>
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-sm font-bold text-yellow-400">
                {step}
              </div>
              <h3 className="text-xl font-bold text-zinc-100 pt-2">{title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grid background / CTA Section */}
      <section className="relative border-t border-white/[0.06] py-24 text-center overflow-hidden z-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <GlowOrb size={600} />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 space-y-6">
          <h2 className="text-4xl font-extrabold mb-3 text-zinc-100">
            Is your project worth saving?
          </h2>
          <p className="text-zinc-400 text-lg max-w-md mx-auto">
            Let the hacker community guide your next move. Takes 2 minutes.
          </p>
          <div className="pt-4">
            <Link
              href="/new"
              className="inline-block px-10 py-4 bg-yellow-400 text-black font-bold text-lg rounded-full hover:bg-yellow-300 transition-all hover:scale-[1.03] active:scale-95 shadow-[0_0_30px_rgba(250,204,21,0.25)]"
            >
              Submit your project →
            </Link>
          </div>
        </div>
      </section>

      <div className="wave-line" />
      
      <footer className="text-center py-12 text-zinc-500 text-sm space-y-4 relative z-10">
        <p className="max-w-md mx-auto leading-relaxed">
          Built for indie hackers who build too much and kill too late — or too early.
        </p>
        <div className="flex items-center justify-center gap-6 text-xs font-semibold">
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">
            Terms
          </Link>
          <Link href="/refunds" className="hover:text-zinc-300 transition-colors">
            Refunds
          </Link>
        </div>
      </footer>
    </div>
  )
}
