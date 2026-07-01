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
          <h2 className="text-3xl font-black">FLIPPED!</h2>
          <p className="font-bold opacity-80">
            The builder thought{' '}
            <strong>{builderVerdict.toUpperCase()}</strong>, but the community
            says something else.
          </p>
        </div>
      )}

      <div
        className={`border-2 rounded-2xl p-8 text-center space-y-3 ${
          communityVerdict === 'build'
            ? 'bg-green-500/10 border-green-500'
            : communityVerdict === 'kill'
            ? 'bg-red-500/10 border-red-500'
            : 'bg-zinc-900 border-zinc-700'
        }`}
      >
        <p className="text-zinc-400 text-sm uppercase tracking-widest font-bold">
          Community Verdict
        </p>
        <p
          className={`text-6xl font-black ${
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
        <p className="text-zinc-500 text-sm">{total} total votes</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
        <div className="flex rounded-full overflow-hidden h-4 bg-zinc-800">
          <div className="bg-green-500" style={{ width: `${buildPct}%` }} />
          <div className="bg-red-500" style={{ width: `${killPct}%` }} />
        </div>
        <div className="flex justify-between text-sm font-bold">
          <span className="text-green-400">🚀 {buildPct}% BUILD</span>
          <span className="text-red-400">💀 {killPct}% KILL</span>
        </div>
        <div className="flex justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800">
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
            <span className="text-yellow-400 font-bold">FLIPPED ↔</span>
          ) : (
            <span className="text-zinc-400">Community agreed</span>
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
