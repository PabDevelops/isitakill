'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/types'
import { useState, useTransition, useEffect } from 'react'

export default function ExploreFilters({
  currentSearch = '',
  currentCategory = '',
  currentSort = 'recent',
}: {
  currentSearch?: string
  currentCategory?: string
  currentSort?: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSearch(currentSearch)
  }, [currentSearch])

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset search when shifting categories
    if (key === 'category') {
      params.delete('search')
      setSearch('')
    }
    startTransition(() => {
      router.push(`/explore?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <form onSubmit={(e) => { e.preventDefault(); updateFilters('search', search || null) }} className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] focus:border-yellow-400/50 rounded-full py-2.5 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
          </svg>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); updateFilters('search', null) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </form>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs text-zinc-500 font-medium">Sort by:</span>
          <select
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] rounded-full py-1.5 px-4 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-yellow-400/50 transition-colors"
          >
            <option value="recent">Most Recent</option>
            <option value="votes">Most Votes</option>
            <option value="ending">Ending Soonest</option>
          </select>
        </div>
      </div>

      {/* Category Horizontal Scrolling Pills */}
      <div className="space-y-2">
        <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Categories</div>
        <div className="flex flex-wrap gap-2 py-1 select-none">
          <button
            onClick={() => updateFilters('category', null)}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
              !currentCategory
                ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:border-white/[0.15] hover:text-zinc-200'
            }`}
          >
            All Projects
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilters('category', cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                currentCategory === cat
                  ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                  : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:border-white/[0.15] hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {isPending && (
        <div className="text-xs text-yellow-400/80 animate-pulse font-medium">Filtering results...</div>
      )}
    </div>
  )
}
