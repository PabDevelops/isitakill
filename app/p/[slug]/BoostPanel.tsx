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
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 whitespace-nowrap shadow-[0_0_15px_rgba(249,115,22,0.05)]">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
      </span>
      <span>Boosted</span>
      <span className="text-orange-400/50">•</span>
      <span className="font-bold text-orange-300">{label}</span>
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
    <div className="space-y-4">
      {/* Free Trial Ended Summary */}
      {trialJustEnded && (
        <div className="bg-yellow-400/[0.02] border border-yellow-400/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-sm">📈</span>
            <p className="text-zinc-100 font-bold text-xs uppercase tracking-wider">
              Free Trial Boost Ended
            </p>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            During your 24h trial, your project generated{' '}
            <span className="text-zinc-100 font-semibold">{trialViews} views</span> and{' '}
            <span className="text-zinc-100 font-semibold">{trialVotes} votes</span>.
            Extend the boost now to maintain visibility!
          </p>
        </div>
      )}

      {/* Active Boost Header */}
      {isActive ? (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-orange-500/[0.01] border border-orange-500/10 rounded-xl p-3">
          <BoostBadge until={boostedUntil} />
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-orange-400 bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/20 px-2.5 py-1.5 rounded-full transition-all shrink-0 cursor-pointer"
          >
            <span>Extend boost</span>
            <svg
              className={`w-3 h-3 text-zinc-500 hover:text-orange-400 transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      ) : (
        !open && (
          <button
            onClick={() => setOpen(true)}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(249,115,22,0.12)] flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <span>🔥</span>
            <span>Boost This Project</span>
          </button>
        )
      )}

      {/* Boost Options Panel */}
      {(open || trialJustEnded || !isActive) && (
        <div className={`space-y-4 ${isActive ? 'pt-2' : ''}`}>
          <div className="grid grid-cols-2 gap-3">
            {BOOST_OPTIONS.map((opt) => {
              const isPopular = opt.days === 3
              const isBestValue = opt.days === 7
              
              let tagLabel = ''
              let tagColorClass = ''
              let description = ''
              
              if (opt.days === 1) {
                description = 'Quick test'
              } else if (opt.days === 3) {
                tagLabel = 'Popular'
                tagColorClass = 'bg-orange-500 text-black'
                description = 'Best to validate'
              } else if (opt.days === 7) {
                tagLabel = 'Best Value'
                tagColorClass = 'bg-amber-400 text-black'
                description = 'Maximum traction'
              } else if (opt.days === 14) {
                description = 'Ultimate exposure'
              }

              return (
                <a
                  key={opt.days}
                  href={`/api/stripe/boost-checkout?projectId=${projectId}&days=${opt.days}`}
                  className={`relative text-left p-4 rounded-xl border bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 group flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isPopular
                      ? 'border-orange-500/40 hover:border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.05)]'
                      : isBestValue
                      ? 'border-amber-400/40 hover:border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.05)]'
                      : 'border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  {tagLabel && (
                    <span className={`absolute top-0 right-0 text-[8px] font-extrabold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider ${tagColorClass}`}>
                      {tagLabel}
                    </span>
                  )}
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
                      {opt.days} {opt.days === 1 ? 'day' : 'days'}
                    </p>
                    <p className="text-zinc-400 text-[11px] mt-0.5 leading-tight font-medium">
                      {description}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-zinc-100 group-hover:text-orange-400 transition-colors mt-3">
                    ${opt.price}
                  </p>
                </a>
              )
            })}
          </div>

          <div className="flex items-start gap-2 bg-white/[0.01] border border-white/[0.06] rounded-xl p-3">
            <span className="text-xs shrink-0 select-none">🛡️</span>
            <p className="text-zinc-500 text-[10px] leading-relaxed">
              Boosting increases visibility across the platform. It does <span className="text-zinc-400 font-medium">not buy or impact votes</span>. The final verdict is always 100% organic and decided by the community.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
