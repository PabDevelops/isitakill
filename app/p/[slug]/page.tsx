import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { computeVoteSummary } from '@/lib/votes'
import { Verdict, BOOST_ENABLED } from '@/lib/types'
import VotePanel from './VotePanel'
import ResultPanel from './ResultPanel'
import BoostPanel, { BoostBadge } from './BoostPanel'
import Nav from '@/components/Nav'
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />
      <ViewTracker projectId={project.id} />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero: thumbnail + overlapping logo */}
            <div>
              {isBoosted && (
                <div className="mb-3">
                  <BoostBadge until={project.boosted_until} />
                </div>
              )}
              {project.thumbnail_url ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.thumbnail_url}
                    alt={`${project.name} thumbnail`}
                    className="w-full aspect-[1.91/1] object-cover rounded-2xl border border-white/[0.08]"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {project.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.logo_url}
                      alt={`${project.name} logo`}
                      className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl object-cover border-4 border-[#0a0a0a] shadow-xl"
                    />
                  )}
                </div>
              ) : project.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.logo_url}
                  alt={`${project.name} logo`}
                  className="w-16 h-16 rounded-2xl object-cover border border-white/[0.08]"
                />
              ) : null}

              <div className={project.thumbnail_url && project.logo_url ? 'pt-10' : 'pt-4'}>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">{project.name}</h1>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-yellow-400 text-sm transition-colors"
                  >
                    {project.link} ↗
                  </a>
                )}

                {(project.categories?.length > 0 || project.pricing_tier) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.pricing_tier && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 capitalize">
                        {project.pricing_tier}
                      </span>
                    )}
                    {project.categories?.map((cat: string) => (
                      <span
                        key={cat}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.08] hover:border-white/[0.2] transition-colors"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {(project.creator_name || project.creator_twitter) && (
                  <p className="text-zinc-500 text-sm mt-3">
                    Built by{' '}
                    {project.creator_twitter ? (
                      <a
                        href={`https://x.com/${project.creator_twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-300 font-medium hover:text-yellow-400 transition-colors"
                      >
                        {project.creator_name || `@${project.creator_twitter}`}
                      </a>
                    ) : (
                      <span className="text-zinc-300 font-medium">{project.creator_name}</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Traction stats */}
            {(project.monthly_revenue != null ||
              project.users_count != null ||
              project.monthly_visits != null ||
              project.capital_invested != null) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {project.monthly_revenue != null && (
                  <StatCard
                    icon="💰"
                    label="Monthly Revenue"
                    value={`$${Number(project.monthly_revenue).toLocaleString()}`}
                    accent="border-green-500/40 bg-green-500/5"
                  />
                )}
                {project.users_count != null && (
                  <StatCard
                    icon="👥"
                    label="Users"
                    value={Number(project.users_count).toLocaleString()}
                    accent="border-blue-500/40 bg-blue-500/5"
                  />
                )}
                {project.monthly_visits != null && (
                  <StatCard
                    icon="📈"
                    label="Monthly Visits"
                    value={Number(project.monthly_visits).toLocaleString()}
                    accent="border-cyan-500/40 bg-cyan-500/5"
                  />
                )}
                {project.capital_invested != null && (
                  <StatCard
                    icon="💸"
                    label="Capital Invested"
                    value={`$${Number(project.capital_invested).toLocaleString()}`}
                    accent="border-orange-500/40 bg-orange-500/5"
                  />
                )}
              </div>
            )}

            {/* Screenshots */}
            {project.screenshot_urls && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.screenshot_urls
                  .split('\n')
                  .map((url: string) => url.trim())
                  .filter(Boolean)
                  .map((url: string, i: number) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`${project.name} screenshot ${i + 1}`}
                      className="w-full rounded-xl border border-white/[0.08] object-cover"
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Sidebar: builder's context + voting */}
          <div className="lg:sticky lg:top-8 space-y-6">
            {/* Builder's context */}
            <div
              className={`relative overflow-hidden bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-4 border-l-2 ${
                verdictColor === 'green' ? 'border-l-green-500/70' : 'border-l-red-500/70'
              }`}
            >
              <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap text-sm">
                {project.description}
              </p>
              <div className="pt-4 border-t border-white/[0.06] flex items-center gap-2">
                <span className="text-zinc-500 text-sm">The builder thinks:</span>
                <span
                  className={`font-semibold text-lg ${
                    verdictColor === 'green' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {project.builder_verdict === 'build' ? '🚀 BUILD' : '💀 KILL'}
                </span>
              </div>
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

            {BOOST_ENABLED && isOwner && !votingClosed && (
              <BoostPanel
                projectId={project.id}
                boostedUntil={project.boosted_until}
                boostType={project.boost_type}
                trialViews={project.trial_boost_views ?? 0}
                trialVotes={project.trial_boost_votes ?? 0}
              />
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
    <div className={`border rounded-xl p-4 ${accent}`}>
      <div className="text-lg mb-1">{icon}</div>
      <p className="text-zinc-500 text-[11px] uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-xl font-semibold text-zinc-100">{value}</p>
    </div>
  )
}
