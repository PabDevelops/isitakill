import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    if (session.metadata?.type !== 'boost') {
      return NextResponse.json({ received: true })
    }

    const projectId = session.metadata.project_id
    const days = parseInt(session.metadata.days ?? '0', 10)
    if (projectId && days > 0) {
      const { data: project } = await supabase
        .from('projects')
        .select('voting_ends_at')
        .eq('id', projectId)
        .single()

      // Boosting only extends a still-live listing — once it's closed, it's closed.
      const stillLive =
        project?.voting_ends_at && new Date(project.voting_ends_at) > new Date()
      if (stillLive) {
        const base = new Date(project.voting_ends_at)
        const newEnd = new Date(base.getTime() + days * 86400000).toISOString()

        await supabase
          .from('projects')
          .update({ voting_ends_at: newEnd, boosted_until: newEnd, boost_type: 'paid' })
          .eq('id', projectId)

        await supabase.from('boost_purchases').insert({
          project_id: projectId,
          days,
          amount_cents: session.amount_total ?? 0,
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
