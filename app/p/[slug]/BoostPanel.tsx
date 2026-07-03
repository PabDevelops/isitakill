'use client'
import { useState, useEffect } from 'react'
import { BOOST_OPTIONS } from '@/lib/types'

function useCountdown(until: string | null) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    if (!until) return
    const update = () => {
      const diff = new Date(until).getTime() - Date.now()
      if (diff <= 0) {
        setLabel('')
        return
      }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setLabel(d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m left`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [until])
  return label
}

export function BoostBadge({ until }: { until: string | null }) {
  const label = useCountdown(until)
  if (!until || !label) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-400/10 text-orange-400 border border-orange-400/30 whitespace-nowrap">
      🔥 Boosted <span className="text-orange-400/70">· {label}</span>
    </span>
  )
}

export default function BoostPanel({
  projectId,
  boostedUntil,
  boostType,
  trialViews,
  trialVotes,
}: {
  projectId: string
  boostedUntil: string | null
  boostType: string | null
  trialViews: number
  trialVotes: number
}) {
  const [open, setOpen] = useState(false)
  const isActive = boostedUntil && new Date(boostedUntil) > new Date()
  const trialJustEnded =
    boostType === 'trial' && boostedUntil && new Date(boostedUntil) <= new Date()

  return (
    <div className="space-y-3">
      {trialJustEnded && (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-5 space-y-1">
          <p className="text-zinc-100 font-semibold text-sm">
            Your free boost has ended.
          </p>
          <p className="text-zinc-400 text-sm">
            In the last 24h you got{' '}
            <span className="text-zinc-100 font-medium">{trialViews} views</span> and{' '}
            <span className="text-zinc-100 font-medium">{trialVotes} votes</span>.
            Want to keep that going?
          </p>
        </div>
      )}

      {isActive ? (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4">
          <BoostBadge until={boostedUntil} />
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors shrink-0"
          >
            Extend boost
          </button>
        </div>
      ) : (
        !open && (
          <button
            onClick={() => setOpen(true)}
            className="w-full py-3 bg-orange-400/10 border border-orange-400/30 text-orange-400 font-medium rounded-xl hover:bg-orange-400/15 transition-colors text-sm"
          >
            🔥 Boost this project
          </button>
        )
      )}

      {(open || trialJustEnded) && (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {BOOST_OPTIONS.map((opt) => (
              <a
                key={opt.days}
                href={`/api/stripe/boost-checkout?projectId=${projectId}&days=${opt.days}`}
                className="text-center py-3 bg-white/[0.03] border border-white/[0.08] hover:border-orange-400/40 rounded-xl transition-colors"
              >
                <p className="font-semibold text-zinc-100 text-sm">{opt.label}</p>
                <p className="text-orange-400 font-semibold">${opt.price}</p>
              </a>
            ))}
          </div>
          <p className="text-zinc-600 text-xs text-center leading-relaxed">
            Boosting increases visibility, not votes — the verdict is always 100%
            organic.
          </p>
        </div>
      )}
    </div>
  )
}
