'use client'
import { useState } from 'react'
import { VoteSummary, Verdict } from '@/lib/types'

interface Props {
  slug: string
  projectName: string
  summary: VoteSummary
  builderVerdict: Verdict
  isResult?: boolean
}

export default function ShareButtons({
  slug,
  projectName,
  summary,
  builderVerdict,
  isResult,
}: Props) {
  const [copied, setCopied] = useState(false)
  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/p/${slug}`
      : `/p/${slug}`

  const tweetText = isResult
    ? summary.isFlipped
      ? `I thought my project "${projectName}" was a ${builderVerdict.toUpperCase()}... but the internet voted ${summary.communityVerdict?.toUpperCase()}. FLIPPED. 🔄 See the verdict:`
      : `The community agrees: "${projectName}" should ${summary.communityVerdict?.toUpperCase()}. ${summary.buildPct}% BUILD / ${summary.killPct}% KILL. See the verdict:`
    : `Should I keep building or kill my project "${projectName}"? Vote here (${summary.total} votes so far):`

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText + ' ' + url
  )}`

  const imageUrl = `/p/${slug}/opengraph-image`

  return (
    <div className="space-y-3">
      <p className="text-zinc-600 text-xs font-medium uppercase tracking-widest">
        Share
      </p>
      <div className="flex gap-3">
        <button
          onClick={copyLink}
          className="flex-1 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 font-medium rounded-xl transition-colors text-sm"
        >
          {copied ? '✓ Copied!' : '🔗 Copy Link'}
        </button>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 font-medium rounded-xl transition-colors text-sm text-center"
        >
          𝕏 Share on X
        </a>
      </div>
      <a
        href={imageUrl}
        download={`${slug}.png`}
        className="block w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 font-medium rounded-xl transition-colors text-sm text-center"
      >
        🖼️ Download Image
      </a>
    </div>
  )
}
