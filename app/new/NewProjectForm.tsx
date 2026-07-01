'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Verdict, PricingTier, CATEGORIES, MAX_CATEGORIES } from '@/lib/types'
import ImageUpload from '@/components/ImageUpload'

export default function NewProjectForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    link: '',
    description: '',
    builder_verdict: '' as Verdict | '',
    voting_days: '7',
    screenshot_urls: '',
    monthly_revenue: '',
    users_count: '',
    monthly_visits: '',
    capital_invested: '',
    logo_url: '',
    thumbnail_url: '',
    pricing_tier: '' as PricingTier | '',
    creator_name: '',
    creator_twitter: '',
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const toggleCategory = (cat: string) => {
    setCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat)
      if (prev.length >= MAX_CATEGORIES) return prev
      return [...prev, cat]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.builder_verdict) {
      setError('Pick your verdict — build or kill.')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, categories }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }
    router.push(`/p/${data.slug}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold mb-2">Project Name *</label>
        <input
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. MarkdownMail"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          Project URL <span className="text-zinc-500 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          value={form.link}
          onChange={(e) => set('link', e.target.value)}
          placeholder="https://yourproject.com"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ImageUpload
          label="Logo"
          hint="Square works best."
          value={form.logo_url}
          onChange={(url) => set('logo_url', url)}
          aspect="aspect-square"
        />
        <ImageUpload
          label="Thumbnail"
          hint="1200×630px (1.91:1) recommended."
          value={form.thumbnail_url}
          onChange={(url) => set('thumbnail_url', url)}
          aspect="aspect-[1.91/1]"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          Context & Traction *
        </label>
        <p className="text-zinc-500 text-xs mb-2">
          What does it do? Current metrics? Why are you on the fence? Be honest.
        </p>
        <textarea
          required
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={5}
          placeholder="e.g. 'It's a markdown-to-email tool. 3 paying customers at $7/mo after 8 months. Growth has stalled and I'm losing motivation. Built it for fun but not sure if there's a real market.'"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          Traction Numbers <span className="text-zinc-500 font-normal">(optional)</span>
        </label>
        <p className="text-zinc-500 text-xs mb-2">
          Cold, hard data. Leave blank whatever doesn't apply.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">
              Monthly revenue ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monthly_revenue}
              onChange={(e) => set('monthly_revenue', e.target.value)}
              placeholder="0"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">
              Users / customers
            </label>
            <input
              type="number"
              min="0"
              value={form.users_count}
              onChange={(e) => set('users_count', e.target.value)}
              placeholder="0"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">
              Monthly visits
            </label>
            <input
              type="number"
              min="0"
              value={form.monthly_visits}
              onChange={(e) => set('monthly_visits', e.target.value)}
              placeholder="0"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">
              Capital invested ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.capital_invested}
              onChange={(e) => set('capital_invested', e.target.value)}
              placeholder="0"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          Screenshots <span className="text-zinc-500 font-normal">(optional)</span>
        </label>
        <p className="text-zinc-500 text-xs mb-2">
          Paste image URLs, one per line (e.g. from Imgur or your own hosting).
        </p>
        <textarea
          value={form.screenshot_urls}
          onChange={(e) => set('screenshot_urls', e.target.value)}
          rows={3}
          placeholder={'https://i.imgur.com/abc123.png\nhttps://i.imgur.com/def456.png'}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          Categories <span className="text-zinc-500 font-normal">(optional, max {MAX_CATEGORIES})</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const selected = categories.includes(cat)
            const disabled = !selected && categories.length >= MAX_CATEGORIES
            return (
              <button
                key={cat}
                type="button"
                disabled={disabled}
                onClick={() => toggleCategory(cat)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                  selected
                    ? 'bg-yellow-400 border-yellow-400 text-black'
                    : disabled
                    ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          Pricing Tier <span className="text-zinc-500 font-normal">(optional)</span>
        </label>
        <select
          value={form.pricing_tier}
          onChange={(e) => set('pricing_tier', e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
        >
          <option value="">Not specified</option>
          <option value="free">Free — always free</option>
          <option value="freemium">Freemium — free + paid tiers</option>
          <option value="paid">Paid — paid only</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-bold mb-2">
            Creator Name <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <input
            value={form.creator_name}
            onChange={(e) => set('creator_name', e.target.value)}
            placeholder="Your name"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">
            X / Twitter <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-xl px-4 focus-within:border-yellow-400 transition-colors">
            <span className="text-zinc-500">@</span>
            <input
              value={form.creator_twitter}
              onChange={(e) => set('creator_twitter', e.target.value.replace(/^@/, ''))}
              placeholder="yourhandle"
              className="w-full bg-transparent py-3 pl-1 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">
          Your Honest Verdict *
        </label>
        <p className="text-zinc-500 text-xs mb-3">
          What do YOU think right now? The flip is more dramatic if you're
          honest.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['build', 'kill'] as Verdict[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set('builder_verdict', v)}
              className={`py-4 rounded-xl font-black text-lg border-2 transition-all ${
                form.builder_verdict === v
                  ? v === 'build'
                    ? 'bg-green-500 border-green-400 text-white scale-105'
                    : 'bg-red-500 border-red-400 text-white scale-105'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {v === 'build' ? '🚀 BUILD' : '💀 KILL'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">Voting Window</label>
        <select
          value={form.voting_days}
          onChange={(e) => set('voting_days', e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
        >
          <option value="3">3 days</option>
          <option value="7">7 days (recommended)</option>
          <option value="14">14 days</option>
          <option value="0">No deadline</option>
        </select>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 text-black font-black text-lg py-4 rounded-xl hover:bg-yellow-300 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
      >
        {loading ? 'Submitting...' : 'Submit & Get the Verdict →'}
      </button>
    </form>
  )
}
