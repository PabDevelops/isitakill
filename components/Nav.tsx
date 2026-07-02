'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const [user, setUser] = useState<User | null>(null)

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
    <nav className="border-b border-white/[0.06] px-4 py-4 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-100">
          IsitA<span className="text-yellow-400">Kill</span>?
        </Link>
        <div className="flex items-center gap-6">
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
      </div>
    </nav>
  )
}
