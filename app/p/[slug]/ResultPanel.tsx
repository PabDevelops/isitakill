'use client'
import { VoteSummary, Verdict } from '@/lib/types'
import ShareButtons from './ShareButtons'

interface Props {
  summary: VoteSummary
  builderVerdict: Verdict
  projectName: string
  slug: string
}

export default function ResultPanel({
  summary,
  builderVerdict,
  projectName,
  slug,
}: Props) {
  const { communityVerdict, isFlipped, buildPct, killPct, total } = summary

  return (
    <div className="space-y-6">
      {isFlipped && (
        <div className="flip-reveal bg-yellow-400 text-black rounded-2xl p-6 text-center space-y-2">
          <div className="text-5xl">🔄</div>
          <h2 className="text-2xl font-semibold">FLIPPED!</h2>
          <p className="font-medium opacity-80 text-sm">
            The builder thought{' '}
            <strong>{builderVerdict.toUpperCase()}</strong>, but the community
            says something else.
          </p>
        </div>
      )}

      <div
        className={`border rounded-2xl p-8 text-center space-y-3 ${
          communityVerdict === 'build'
            ? 'bg-green-500/[0.06] border-green-500/40'
            : communityVerdict === 'kill'
            ? 'bg-red-500/[0.06] border-red-500/40'
            : 'bg-white/[0.02] border-white/[0.08]'
        }`}
      >
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium">
          Community Verdict
        </p>
        <p
          className={`text-5xl font-semibold ${
            communityVerdict === 'build'
              ? 'text-green-400'
              : communityVerdict === 'kill'
              ? 'text-red-400'
              : 'text-zinc-400'
          }`}
        >
          {communityVerdict === 'build'
            ? '🚀 BUILD'
            : communityVerdict === 'kill'
            ? '💀 KILL'
            : 'No votes'}
        </p>
        <p className="text-zinc-600 text-sm">{total} total votes</p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 space-y-3">
        <div className="flex rounded-full overflow-hidden h-3 bg-white/[0.06]">
          <div className="bg-green-500" style={{ width: `${buildPct}%` }} />
          <div className="bg-red-500" style={{ width: `${killPct}%` }} />
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-green-400">🚀 {buildPct}% BUILD</span>
          <span className="text-red-400">💀 {killPct}% KILL</span>
        </div>
        <div className="flex justify-between text-xs text-zinc-500 pt-2 border-t border-white/[0.06]">
          <span>
            Builder said:{' '}
            <span
              className={
                builderVerdict === 'build' ? 'text-green-400' : 'text-red-400'
              }
            >
              {builderVerdict.toUpperCase()}
            </span>
          </span>
          {isFlipped ? (
            <span className="text-yellow-400 font-medium">FLIPPED ↔</span>
          ) : (
            <span className="text-zinc-500">Community agreed</span>
          )}
        </div>
      </div>

      <ShareButtons
        slug={slug}
        projectName={projectName}
        summary={summary}
        builderVerdict={builderVerdict}
        isResult
      />
    </div>
  )
}
