import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { computeVoteSummary } from '@/lib/votes'
import { Verdict } from '@/lib/types'

export const runtime = 'nodejs'
export const alt = 'Project verdict'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BG = '#0a0a0a'
const YELLOW = '#facc15'
const GREEN = '#4ade80'
const RED = '#f87171'
const GRAY = '#a1a1aa'

function Stamp({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top: 60,
        right: 60,
        transform: 'rotate(-10deg)',
        border: `6px solid ${color}`,
        borderRadius: 16,
        padding: '14px 28px',
        color,
        fontSize: 52,
        fontWeight: 900,
        letterSpacing: 4,
        background: 'rgba(10,10,10,0.55)',
      }}
    >
      {label}
    </div>
  )
}

export default async function Image({
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

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: BG,
            color: 'white',
            fontSize: 48,
            fontWeight: 900,
          }}
        >
          IsitAKill?
        </div>
      ),
      size
    )
  }

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

  const stampVerdict = votingClosed
    ? summary.communityVerdict
    : (project.builder_verdict as Verdict)
  const stampColor = stampVerdict === 'build' ? GREEN : RED
  const stampLabel = stampVerdict === 'build' ? 'BUILD' : 'KILL'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: BG,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Thumbnail background */}
        {project.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail_url}
            width={size.width}
            height={size.height}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Dark gradient overlay for legibility */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: project.thumbnail_url
              ? 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0.25) 100%)'
              : BG,
          }}
        />

        {/* Stamp */}
        <Stamp label={stampLabel} color={stampColor} />
        {votingClosed && summary.isFlipped && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'absolute',
              top: 190,
              right: 68,
              transform: 'rotate(-10deg)',
              background: YELLOW,
              color: '#000',
              fontWeight: 900,
              fontSize: 24,
              padding: '6px 16px',
              borderRadius: 999,
            }}
          >
            🔄 FLIPPED
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: 64, paddingBottom: 0 }}>
          <span style={{ fontSize: 28, fontWeight: 900 }}>
            IsitA<span style={{ color: YELLOW }}>Kill</span>?
          </span>
        </div>

        {/* Footer: name + vote bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 64,
            paddingTop: 0,
          }}
        >
          <span
            style={{
              fontSize: 60,
              fontWeight: 900,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            {project.name}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: 20,
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', width: `${summary.buildPct}%`, background: GREEN }} />
              <div style={{ display: 'flex', width: `${summary.killPct}%`, background: RED }} />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              <span style={{ color: GREEN }}>{summary.buildPct}% BUILD</span>
              <span style={{ color: GRAY, fontWeight: 600 }}>
                {summary.total} {summary.total === 1 ? 'vote' : 'votes'}
              </span>
              <span style={{ color: RED }}>{summary.killPct}% KILL</span>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
