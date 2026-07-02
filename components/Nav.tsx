'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => setUser(data.user))
      const { data: listener } = supabase.auth.onAuthStateChange((_, session) =>
        setUser(session?.user ?? null)
      )
      return () => listener.subscription.unsubscribe()
    } catch {}
  }, [])

  const signOut = async () => {
    try { await createClient().auth.signOut() } catch {}
    window.location.href = '/'
  }

  return (
    <nav className="border-b border-white/[0.06] px-4 py-4 backdrop-blur-sm relative">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-100">
          IsitA<span className="text-yellow-400">Kill</span>?
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/explore"
            className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            Explore
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/new"
                className="text-sm font-medium text-black bg-yellow-400/90 px-3.5 py-1.5 rounded-full hover:bg-yellow-400 transition-colors"
              >
                + New Project
              </Link>
              <button
                onClick={signOut}
                className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/new"
                className="text-sm font-medium text-black bg-yellow-400/90 px-3.5 py-1.5 rounded-full hover:bg-yellow-400 transition-colors"
              >
                Submit Project →
              </Link>
            </>
          )}
        </div>

        {/* Mobile: menu toggle */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          className="sm:hidden text-zinc-400 hover:text-zinc-200 p-1"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute left-0 right-0 top-full bg-[#0a0a0a] border-b border-white/[0.08] px-4 py-3 flex flex-col gap-1 z-50">
          <Link
            href="/explore"
            onClick={() => setMenuOpen(false)}
            className="py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Explore
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="py-2.5 text-sm text-left text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
