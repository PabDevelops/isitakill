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

    if (session.metadata?.type === 'boost') {
      const projectId = session.metadata.project_id
      const days = parseInt(session.metadata.days ?? '0', 10)
      if (projectId && days > 0) {
        const { data: project } = await supabase
          .from('projects')
          .select('boosted_until')
          .eq('id', projectId)
          .single()

        const base =
          project?.boosted_until && new Date(project.boosted_until) > new Date()
            ? new Date(project.boosted_until)
            : new Date()
        const boosted_until = new Date(
          base.getTime() + days * 86400000
        ).toISOString()

        await supabase
          .from('projects')
          .update({ boosted_until, boost_type: 'paid' })
          .eq('id', projectId)
      }
    } else {
      const userId = session.metadata?.user_id
      if (userId) {
        await supabase
          .from('profiles')
          .upsert({ id: userId, subscription_status: 'active' })
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object
    const userId = sub.metadata?.user_id
    if (userId) {
      await supabase
        .from('profiles')
        .update({ subscription_status: sub.status })
        .eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    const userId = sub.metadata?.user_id
    if (userId) {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'canceled' })
        .eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
