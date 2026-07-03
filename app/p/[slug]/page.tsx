import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { computeVoteSummary } from '@/lib/votes'
import { Verdict, BOOST_ENABLED } from '@/lib/types'
import VotePanel from './VotePanel'
import ResultPanel from './ResultPanel'
import BoostPanel, { BoostBadge } from './BoostPanel'
import Nav from '@/components/Nav'
import DotGrid from '@/components/DotGrid'
import ViewTracker from '@/components/ViewTracker'
import type { Metadata } from 'next'

export const revalidate = 10

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!project) return {}

  const { data: votes } = await supabase
    .from('votes')
    .select('vote')
    .eq('project_id', project.id)

  const summary = computeVoteSummary(
    (votes ?? []) as { vote: Verdict }[],
    project.builder_verdict as Verdict
  )

  const votingClosed = project.voting_ends_at
    ? new Date(project.voting_ends_at) < new Date()
    : false

  const title = votingClosed
    ? `${project.name} — Community says ${summary.communityVerdict?.toUpperCase()}${summary.isFlipped ? ' (FLIPPED!)' : ''}`
    : `${project.name} — Is it a BUILD or a KILL?`

  const description = votingClosed
    ? `The builder said ${project.builder_verdict.toUpperCase()}. The community voted ${summary.buildPct}% BUILD / ${summary.killPct}% KILL.`
    : project.description.slice(0, 150)

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!project) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = user?.id === project.user_id

  const { data: votes } = await supabase
    .from('votes')
    .select('vote')
    .eq('project_id', project.id)

  const summary = computeVoteSummary(
    (votes ?? []) as { vote: Verdict }[],
    project.builder_verdict as Verdict
  )

  const votingClosed = project.voting_ends_at
    ? new Date(project.voting_ends_at) < new Date()
    : false

  const verdictColor = project.builder_verdict === 'build' ? 'green' : 'red'
  const isBoosted =
    BOOST_ENABLED &&
    project.boosted_until &&
    new Date(project.boosted_until) > new Date()

  return (
    <div className="relative min-h-screen bg-[#060608] pb-16">
      <DotGrid variant="page" />
      <Nav />
      <ViewTracker projectId={project.id} />
      
      {/* Decorative top ambient glow */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-7xl h-[350px] pointer-events-none z-0">
        <div className={`absolute top-0 left-1/4 w-[350px] h-[350px] rounded-full filter blur-[100px] opacity-10 ${
          verdictColor === 'green' ? 'bg-emerald-500' : 'bg-rose-500'
        }`} />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full filter blur-[90px] opacity-[0.08] bg-yellow-500" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-10 z-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Project Main Showcase Card */}
            <div className="glass-card-no-hover rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
              
              {/* Cover Banner */}
              {project.thumbnail_url ? (
                <div className="relative h-[250px] sm:h-[320px] w-full overflow-hidden border-b border-white/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.thumbnail_url}
                    alt={`${project.name} cover`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  
                  {project.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.logo_url}
                      alt={`${project.name} logo`}
                      className="absolute -bottom-7 left-6 w-20 h-20 rounded-2xl object-cover border-4 border-[#0c0c0f] shadow-2xl z-20"
                    />
                  )}
                </div>
              ) : (
                <div className="h-28 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-white/[0.06] relative px-6 flex items-end pb-4">
                  {project.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.logo_url}
                      alt={`${project.name} logo`}
                      className="w-16 h-16 rounded-2xl object-cover border border-white/[0.1] shadow-2xl"
                    />
                  )}
                </div>
              )}

              {/* Title & Info */}
              <div className={`p-6 sm:p-8 space-y-6 ${project.thumbnail_url && project.logo_url ? 'pt-12' : 'pt-6'}`}>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">{project.name}</h1>
                    {isBoosted && (
                      <BoostBadge until={project.boosted_until} />
                    )}
                  </div>

                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-yellow-400 font-medium text-sm transition-colors"
                    >
                      {project.link.replace(/^https?:\/\/(www\.)?/, '')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    </a>
                  )}

                  {/* Creator */}
                  {(project.creator_name || project.creator_twitter) && (
                    <p className="text-zinc-500 text-xs">
                      Built by{' '}
                      {project.creator_twitter ? (
                        <a
                          href={`https://x.com/${project.creator_twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-300 font-semibold hover:text-yellow-400 transition-colors"
                        >
                          {project.creator_name || `@${project.creator_twitter}`}
                        </a>
                      ) : (
                        <span className="text-zinc-300 font-semibold">{project.creator_name}</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Categories & Price badges */}
                {(project.categories?.length > 0 || project.pricing_tier) && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-white/[0.04] pt-4">
                    {project.pricing_tier && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 capitalize">
                        {project.pricing_tier}
                      </span>
                    )}
                    {project.categories?.map((cat: string) => (
                      <span
                        key={cat}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.03] text-zinc-400 border border-white/[0.08]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description / The Pitch */}
                <div className="space-y-3 border-t border-white/[0.04] pt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">The Story & Pitch</h3>
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base font-normal">
                    {project.description}
                  </p>
                </div>

              </div>
            </div>

            {/* Traction stats */}
            {(project.monthly_revenue != null ||
              project.users_count != null ||
              project.monthly_visits != null ||
              project.capital_invested != null) && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pl-1">Key Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {project.monthly_revenue != null && (
                    <StatCard
                      icon="💰"
                      label="Monthly Revenue"
                      value={`$${Number(project.monthly_revenue).toLocaleString()}`}
                      accent="border-emerald-500/20 bg-emerald-500/[0.02] text-emerald-400"
                    />
                  )}
                  {project.users_count != null && (
                    <StatCard
                      icon="👥"
                      label="Active Users"
                      value={Number(project.users_count).toLocaleString()}
                      accent="border-blue-500/20 bg-blue-500/[0.02] text-blue-400"
                    />
                  )}
                  {project.monthly_visits != null && (
                    <StatCard
                      icon="📈"
                      label="Monthly Visits"
                      value={Number(project.monthly_visits).toLocaleString()}
                      accent="border-cyan-500/20 bg-cyan-500/[0.02] text-cyan-400"
                    />
                  )}
                  {project.capital_invested != null && (
                    <StatCard
                      icon="💸"
                      label="Capital Invested"
                      value={`$${Number(project.capital_invested).toLocaleString()}`}
                      accent="border-orange-500/20 bg-orange-500/[0.02] text-orange-400"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Screenshots Gallery */}
            {project.screenshot_urls && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pl-1">Project Screenshots</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.screenshot_urls
                    .split('\n')
                    .map((url: string) => url.trim())
                    .filter(Boolean)
                    .map((url: string, i: number) => (
                      <div key={i} className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.01]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`${project.name} screenshot ${i + 1}`}
                          className="w-full object-cover aspect-[4/3] hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-[90px] space-y-6">
            
            {/* Stance Card */}
            <div className={`glass-card-no-hover rounded-2xl p-6 border border-white/[0.08] border-l-4 ${
              verdictColor === 'green' ? 'border-l-green-500 bg-green-500/[0.01]' : 'border-l-red-500 bg-red-500/[0.01]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="text-sm text-zinc-400 font-semibold">Builder Stance:</div>
                <div className={`font-extrabold text-base tracking-wide uppercase ${
                  verdictColor === 'green' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {project.builder_verdict === 'build' ? '🚀 BUILD IT' : '💀 KILL IT'}
                </div>
              </div>
            </div>

            {/* Voting or Results */}
            <div className="glass-card-no-hover border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <div className="mb-4">
                <h3 className="font-bold text-zinc-200">
                  {votingClosed ? '📊 Final Verdict' : '🗳️ Cast Your Vote'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {votingClosed ? 'Voting is closed and the decision is locked.' : 'Unbiased and community-driven. Make your vote count.'}
                </p>
              </div>

              {votingClosed ? (
                <ResultPanel
                  summary={summary}
                  builderVerdict={project.builder_verdict as Verdict}
                  projectName={project.name}
                  slug={project.slug}
                />
              ) : (
                <VotePanel
                  projectId={project.id}
                  summary={summary}
                  votingEndsAt={project.voting_ends_at}
                  slug={project.slug}
                  projectName={project.name}
                  builderVerdict={project.builder_verdict as Verdict}
                />
              )}
            </div>

            {/* Boost Panel */}
            {BOOST_ENABLED && isOwner && !votingClosed && (
              <div className="glass-card-no-hover border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="font-bold text-zinc-200">🚀 Project Boost</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Promote this submission to the front page.</p>
                </div>
                <BoostPanel
                  projectId={project.id}
                  boostedUntil={project.boosted_until}
                  boostType={project.boost_type}
                  trialViews={project.trial_boost_views ?? 0}
                  trialVotes={project.trial_boost_votes ?? 0}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string
  label: string
  value: string
  accent: string
}) {
  return (
    <div className={`border rounded-2xl p-4 flex flex-col justify-between h-28 transition-colors ${accent}`}>
      <div className="text-2xl">{icon}</div>
      <div className="space-y-0.5">
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider leading-none">
          {label}
        </p>
        <p className="text-lg font-extrabold text-zinc-100 tracking-tight leading-tight">{value}</p>
      </div>
    </div>
  )
}
