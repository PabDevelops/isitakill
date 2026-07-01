import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewProjectForm from './NewProjectForm'
import Nav from '@/components/Nav'

export default async function NewPage() {
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https')

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Nav />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-black mb-2">Submit Your Project</h1>
          <p className="text-zinc-400 mb-10">
            Be brutally honest. The internet can handle it.
          </p>
          <NewProjectForm />
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/new')

  const { count } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  const isPaid = profile?.subscription_status === 'active'
  const canCreate = isPaid || (count ?? 0) < 1

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-2">Submit Your Project</h1>
        <p className="text-zinc-400 mb-10">
          Be brutally honest. The internet can handle it.
        </p>
        {!canCreate ? (
          <div className="bg-zinc-900 border border-yellow-400/30 rounded-2xl p-8 text-center space-y-4">
            <div className="text-3xl">🔒</div>
            <h2 className="text-xl font-black">Free tier limit reached</h2>
            <p className="text-zinc-400">
              You already have an active project. Upgrade to submit unlimited
              projects at the same time.
            </p>
            <a
              href="/api/stripe/checkout"
              className="inline-block bg-yellow-400 text-black font-black px-8 py-3 rounded-xl hover:bg-yellow-300 transition-colors"
            >
              Upgrade for $8/month →
            </a>
          </div>
        ) : (
          <NewProjectForm />
        )}
      </div>
    </div>
  )
}
