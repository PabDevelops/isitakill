'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => setUser(data.user))
      const { data: listener } = supabase.auth.onAuthStateChange((_, session) =>
        setUser(session?.user ?? null)
      )
      
      const handleScroll = () => {
        setScrolled(window.scrollY > 10)
      }
      window.addEventListener('scroll', handleScroll)
      
      return () => {
        listener.subscription.unsubscribe()
        window.removeEventListener('scroll', handleScroll)
      }
    } catch {}
  }, [])

  const signOut = async () => {
    try { await createClient().auth.signOut() } catch {}
    window.location.href = '/'
  }

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 px-4 ${
      scrolled 
        ? 'py-3 bg-[#060608]/75 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]' 
        : 'py-5 bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-100 hover:opacity-90 transition-opacity">
          IsitA<span className="text-yellow-400">Kill</span>?
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/explore"
            className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Explore
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/new"
                className="text-sm font-semibold text-black bg-yellow-400 px-4 py-2 rounded-full hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all hover:scale-[1.03] active:scale-95"
              >
                + New Project
              </Link>
              <button
                onClick={signOut}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/new"
                className="text-sm font-semibold text-black bg-yellow-400 px-4 py-2 rounded-full hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.25)] transition-all hover:scale-[1.03] active:scale-95"
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
          className="sm:hidden text-zinc-400 hover:text-zinc-200 p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] transition-colors"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute left-0 right-0 top-full bg-[#060608]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-4 flex flex-col gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/explore"
            onClick={() => setMenuOpen(false)}
            className="py-2.5 px-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03] transition-all"
          >
            Explore
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03] transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/new"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-sm font-semibold text-black bg-yellow-400 text-center hover:bg-yellow-300 transition-all mt-2"
              >
                + New Project
              </Link>
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-left text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-all mt-1"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03] transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/new"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-sm font-semibold text-black bg-yellow-400 text-center hover:bg-yellow-300 transition-all mt-2"
              >
                Submit Project →
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
