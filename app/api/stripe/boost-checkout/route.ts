import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { BOOST_OPTIONS } from '@/lib/types'

export async function GET(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(
      new URL('/login', process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const days = parseInt(searchParams.get('days') ?? '', 10)
  const option = BOOST_OPTIONS.find((o) => o.days === days)
  if (!option) {
    return NextResponse.json({ error: 'Invalid boost option' }, { status: 400 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, slug, user_id')
    .eq('id', projectId)
    .single()

  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: option.price * 100,
          product_data: {
            name: `${option.label} — IsitAKill?`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: 'boost',
      project_id: project.id,
      days: String(option.days),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/p/${project.slug}?boosted=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/p/${project.slug}`,
  })

  return NextResponse.redirect(session.url!)
}
