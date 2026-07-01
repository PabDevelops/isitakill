'use client'
import { useState, useEffect, useCallback } from 'react'
import { VoteSummary, Verdict } from '@/lib/types'
import { computeVoteSummary } from '@/lib/votes'
import ShareButtons from './ShareButtons'

const FINGERPRINT_KEY = 'bod_fp'

function getFingerprint(): string {
  if (typeof window === 'undefined') return ''
  let fp = localStorage.getItem(FINGERPRINT_KEY)
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(FINGERPRINT_KEY, fp)
  }
  return fp
}

interface Props {
  projectId: string
  summary: VoteSummary
  votingEndsAt: string | null
  slug: string
  projectName: string
  builderVerdict: Verdict
}

export default function VotePanel({
  projectId,
  summary: initialSummary,
  votingEndsAt,
  slug,
  projectName,
  builderVerdict,
}: Props) {
  const [voted, setVoted] = useState<Verdict | null>(null)
  const [summary, setSummary] = useState(initialSummary)
  const [loading, setLoading] = useState<Verdict | null>(null)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const fp = getFingerprint()
    const stored = localStorage.getItem(`voted_${projectId}`)
    if (stored) setVoted(stored as Verdict)
  }, [projectId])

  useEffect(() => {
    if (!votingEndsAt) return
    const update = () => {
      const diff = new Date(votingEndsAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Voting closed'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setTimeLeft(`${d}d ${h}h ${m}m left`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [votingEndsAt])

  const castVote = async (vote: Verdict) => {
    if (voted || loading) return
    const fp = getFingerprint()
    setLoading(vote)
    setError('')
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, vote, voter_fingerprint: fp }),
    })
    if (res.ok || res.status === 409) {
      setVoted(vote)
      localStorage.setItem(`voted_${projectId}`, vote)
      // Optimistically update
      const newVotes = [
        ...Array(summary.build).fill({ vote: 'build' }),
        ...Array(summary.kill).fill({ vote: 'kill' }),
        { vote },
      ] as { vote: Verdict }[]
      setSummary(computeVoteSummary(newVotes, builderVerdict))
    } else {
      const data = await res.json()
      setError(data.error ?? 'Vote failed')
    }
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Live bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm font-medium">
            {summary.total} {summary.total === 1 ? 'vote' : 'votes'}
          </span>
          {timeLeft && (
            <span className="text-zinc-500 text-xs">{timeLeft}</span>
          )}
        </div>
        <div className="flex rounded-full overflow-hidden h-4 bg-zinc-800">
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${summary.buildPct}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${summary.killPct}%` }}
          />
        </div>
        <div className="flex justify-between text-sm font-bold">
          <span className="text-green-400">🚀 {summary.buildPct}% BUILD</span>
          <span className="text-red-400">💀 {summary.killPct}% KILL</span>
        </div>
      </div>

      {/* Vote buttons */}
      {voted ? (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center">
            <p className="text-zinc-400 mb-1 text-sm">You voted</p>
            <p
              className={`text-3xl font-black ${
                voted === 'build' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {voted === 'build' ? '🚀 BUILD' : '💀 KILL'}
            </p>
          </div>
          <ShareButtons
            slug={slug}
            projectName={projectName}
            summary={summary}
            builderVerdict={builderVerdict}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => castVote('build')}
            disabled={!!loading}
            className="btn-build py-6 bg-green-500 hover:bg-green-400 text-white font-black text-2xl rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading === 'build' ? '...' : '🚀 BUILD'}
          </button>
          <button
            onClick={() => castVote('kill')}
            disabled={!!loading}
            className="btn-kill py-6 bg-red-500 hover:bg-red-400 text-white font-black text-2xl rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading === 'kill' ? '...' : '💀 KILL'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
    </div>
  )
}
