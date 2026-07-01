import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()
  const { project_id, vote, voter_fingerprint } = body

  if (!project_id || !vote || !voter_fingerprint) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (vote !== 'build' && vote !== 'kill') {
    return NextResponse.json({ error: 'Invalid vote' }, { status: 400 })
  }

  // Check project exists and voting is open
  const { data: project } = await supabase
    .from('projects')
    .select('id, voting_ends_at')
    .eq('id', project_id)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  if (project.voting_ends_at && new Date(project.voting_ends_at) < new Date()) {
    return NextResponse.json({ error: 'Voting has closed' }, { status: 403 })
  }

  // Check duplicate
  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('project_id', project_id)
    .eq('voter_fingerprint', voter_fingerprint)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already voted' }, { status: 409 })
  }

  const { error } = await supabase.from('votes').insert({
    project_id,
    vote,
    voter_fingerprint,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
