'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signupDone, setSignupDone] = useState(false)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.session) {
        router.push(next)
        router.refresh()
      } else {
        setSignupDone(true)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push(next)
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center text-2xl font-black mb-8">
          IsitA<span className="text-yellow-400">Kill</span>?
        </Link>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {signupDone ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <h2 className="text-xl font-black">Confirm your email</h2>
              <p className="text-zinc-400">
                We sent a confirmation link to <strong>{email}</strong>. Click
                it, then come back and sign in.
              </p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-6 bg-zinc-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                    mode === 'signin'
                      ? 'bg-yellow-400 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                    mode === 'signup'
                      ? 'bg-yellow-400 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sign up
                </button>
              </div>

              <h1 className="text-2xl font-black mb-2">
                {mode === 'signin' ? 'Welcome back' : 'Create an account'}
              </h1>
              <p className="text-zinc-400 text-sm mb-6">
                {mode === 'signin'
                  ? 'Sign in with your email and password.'
                  : 'Takes 10 seconds. No credit card needed.'}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition-colors"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition-colors"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? 'Please wait...'
                    : mode === 'signin'
                    ? 'Sign In →'
                    : 'Sign Up →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
