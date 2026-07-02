import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateSlug } from '@/lib/votes'
import { MAX_CATEGORIES, TRIAL_BOOST_HOURS } from '@/lib/types'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    name,
    link,
    description,
    builder_verdict,
    voting_days,
    screenshot_urls,
    monthly_revenue,
    users_count,
    monthly_visits,
    capital_invested,
    logo_url,
    thumbnail_url,
    categories,
    pricing_tier,
    creator_name,
    creator_twitter,
  } = body

  const toNumber = (v: unknown) =>
    v === undefined || v === null || v === '' ? null : Number(v)

  if (!name || !description || !builder_verdict) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check free tier limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, has_used_free_trial_boost')
    .eq('id', user.id)
    .single()

  const isPaid = profile?.subscription_status === 'active'
  if (!isPaid) {
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((count ?? 0) >= 1) {
      return NextResponse.json(
        { error: 'Free tier limit: upgrade to add more projects' },
        { status: 403 }
      )
    }
  }

  const slug = generateSlug(name)
  const voting_ends_at =
    voting_days && parseInt(voting_days) > 0
      ? new Date(Date.now() + parseInt(voting_days) * 86400000).toISOString()
      : null

  const grantTrialBoost = !profile?.has_used_free_trial_boost
  const boosted_until = grantTrialBoost
    ? new Date(Date.now() + TRIAL_BOOST_HOURS * 3600000).toISOString()
    : null
  const boost_type = grantTrialBoost ? 'trial' : null

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      link: link || null,
      description,
      builder_verdict,
      slug,
      voting_ends_at,
      screenshot_urls: screenshot_urls?.trim() || null,
      monthly_revenue: toNumber(monthly_revenue),
      users_count: toNumber(users_count),
      monthly_visits: toNumber(monthly_visits),
      capital_invested: toNumber(capital_invested),
      logo_url: logo_url?.trim() || null,
      thumbnail_url: thumbnail_url?.trim() || null,
      categories: Array.isArray(categories) ? categories.slice(0, MAX_CATEGORIES) : null,
      pricing_tier: pricing_tier || null,
      creator_name: creator_name?.trim() || null,
      creator_twitter: creator_twitter?.trim().replace(/^@/, '') || null,
      boosted_until,
      boost_type,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (grantTrialBoost) {
    await supabase
      .from('profiles')
      .update({ has_used_free_trial_boost: true })
      .eq('id', user.id)
  }

  return NextResponse.json(data)
}
