import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewProjectForm from './NewProjectForm'
import Nav from '@/components/Nav'
import DotGrid from '@/components/DotGrid'

export default async function NewPage() {
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https')

  if (isConfigured) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login?next=/new')
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <DotGrid variant="page" />
      <Nav />
      <div className="relative max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-semibold mb-2 text-zinc-100">Submit Your Project</h1>
        <p className="text-zinc-500 mb-10">
          Be brutally honest. The internet can handle it.
        </p>
        <NewProjectForm />
      </div>
    </div>
  )
}
