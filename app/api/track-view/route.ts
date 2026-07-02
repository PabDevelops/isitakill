import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { project_id } = await req.json()
  if (!project_id) return NextResponse.json({ error: 'Missing project_id' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: project } = await supabase
    .from('projects')
    .select('boost_type, boosted_until, trial_boost_views')
    .eq('id', project_id)
    .single()

  const trialActive =
    project?.boost_type === 'trial' &&
    project.boosted_until &&
    new Date(project.boosted_until) > new Date()

  if (trialActive) {
    await supabase
      .from('projects')
      .update({ trial_boost_views: (project.trial_boost_views ?? 0) + 1 })
      .eq('id', project_id)
  }

  return NextResponse.json({ success: true })
}
