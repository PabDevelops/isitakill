import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import DotGrid from '@/components/DotGrid'
import DeleteButton from './DeleteButton'
import BarChart from './BarChart'

const DAYS_BACK = 14

function emptyDayBuckets(): { label: string; value: number; key: string }[] {
  const days: { label: string; value: number; key: string }[] = []
  for (let i = DAYS_BACK - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: 0,
    })
  }
  return days
}

function dailySeries(dates: string[]): { label: string; value: number }[] {
  const days = emptyDayBuckets()
  const byKey = new Map(days.map((d) => [d.key, d]))
  for (const iso of dates) {
    const bucket = byKey.get(iso.slice(0, 10))
    if (bucket) bucket.value += 1
  }
  return days.map(({ label, value }) => ({ label, value }))
}

function dailySum(
  rows: { created_at: string; amount_cents: number }[]
): { label: string; value: number }[] {
  const days = emptyDayBuckets()
  const byKey = new Map(days.map((d) => [d.key, d]))
  for (const row of rows) {
    const bucket = byKey.get(row.created_at.slice(0, 10))
    if (bucket) bucket.value += (row.amount_cents ?? 0) / 100
  }
  return days.map(({ label, value }) => ({ label, value }))
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) notFound()

  const admin = createAdminClient()
  const since = new Date(Date.now() - DAYS_BACK * 86400000).toISOString()
  const nowIso = new Date().toISOString()

  const [
    { data: usersData },
    { count: totalProjects },
    { count: activeProjects },
    { count: totalVotes },
    { count: totalBoosts },
    { data: recentVotes },
    { data: recentBoosts },
    { data: allBoostAmounts },
    { data: projects },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('projects').select('id', { count: 'exact', head: true }),
    admin
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .or(`voting_ends_at.is.null,voting_ends_at.gt.${nowIso}`),
    admin.from('votes').select('id', { count: 'exact', head: true }),
    admin.from('boost_purchases').select('id', { count: 'exact', head: true }),
    admin.from('votes').select('created_at').gte('created_at', since),
    admin.from('boost_purchases').select('created_at, amount_cents').gte('created_at', since),
    admin.from('boost_purchases').select('amount_cents'),
    admin
      .from('projects')
      .select(
        'id, name, slug, description, link, logo_url, thumbnail_url, creator_name, creator_twitter, created_at, user_id, boost_type, boosted_until'
      )
      .order('created_at', { ascending: false }),
  ])

  const totalUsers = usersData?.users?.length ?? 0
  const closedProjects = (totalProjects ?? 0) - (activeProjects ?? 0)
  const totalRevenueCents = (allBoostAmounts ?? []).reduce((s, b) => s + (b.amount_cents ?? 0), 0)

  const signupsSeries = dailySeries((usersData?.users ?? []).map((u) => u.created_at))
  const votesSeries = dailySeries((recentVotes ?? []).map((v) => v.created_at))
  const revenueByDay = dailySum(recentBoosts ?? [])

  const stats = [
    { label: 'Users', value: totalUsers.toLocaleString() },
    {
      label: 'Projects',
      value: `${totalProjects ?? 0}`,
      sub: `${activeProjects ?? 0} active · ${closedProjects} closed`,
    },
    { label: 'Votes', value: (totalVotes ?? 0).toLocaleString() },
    {
      label: 'Boosts purchased',
      value: (totalBoosts ?? 0).toLocaleString(),
      sub: `$${(totalRevenueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} total`,
    },
  ]

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <DotGrid variant="page" />
      <Nav />
      <div className="relative max-w-4xl mx-auto px-4 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-100 mb-1">Admin</h1>
          <p className="text-zinc-500 text-sm">Overview & moderation.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-zinc-100">{s.value}</p>
              {s.sub && <p className="text-zinc-600 text-xs mt-1">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid sm:grid-cols-2 gap-4">
          <BarChart title={`Signups — last ${DAYS_BACK} days`} data={signupsSeries} color="#facc15" />
          <BarChart title={`Votes — last ${DAYS_BACK} days`} data={votesSeries} color="#4ade80" />
        </div>
        <BarChart
          title={`Boost revenue — last ${DAYS_BACK} days`}
          data={revenueByDay}
          color="#fb923c"
          formatValue={(v) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        />

        {/* Project list */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">
            Projects ({projects?.length ?? 0})
          </h2>
          <div className="space-y-3">
            {projects?.map((project) => {
              const isBoosted =
                project.boosted_until && new Date(project.boosted_until) > new Date()
              return (
                <div
                  key={project.id}
                  className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`/p/${project.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-zinc-100 hover:text-yellow-400 transition-colors"
                      >
                        {project.name}
                      </a>
                      <span className="text-xs text-zinc-600">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      {isBoosted && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-400/10 text-orange-400 border border-orange-400/30">
                          🔥 {project.boost_type}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 text-sm line-clamp-2 mt-1">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-600 mt-2">
                      {project.link && <span>Link: {project.link}</span>}
                      {project.creator_name && <span>By: {project.creator_name}</span>}
                      {project.creator_twitter && <span>@{project.creator_twitter}</span>}
                      <span className="font-mono">{project.user_id.slice(0, 8)}</span>
                    </div>
                  </div>
                  <DeleteButton projectId={project.id} projectName={project.name} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
