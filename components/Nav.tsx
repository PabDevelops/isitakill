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
    <nav className="border-b border-zinc-800 px-4 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-tight">
          IsitA<span className="text-yellow-400">Kill</span>?
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Explore
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/new"
                className="text-sm bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
              >
                + New Project
              </Link>
              <button
                onClick={signOut}
                className="text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/new"
                className="text-sm bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
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
