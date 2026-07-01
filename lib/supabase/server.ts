import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const STUB_URL = 'https://placeholder.supabase.co'
const STUB_KEY = 'placeholder'

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const safeUrl = url?.startsWith('http') ? url : STUB_URL
  const safeKey = key && key !== 'your_supabase_anon_key' ? key : STUB_KEY

  return createServerClient(
    safeUrl,
    safeKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
