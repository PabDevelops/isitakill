import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import DotGrid from '@/components/DotGrid'
import DeleteButton from './DeleteButton'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) notFound()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, slug, description, link, logo_url, thumbnail_url, creator_name, creator_twitter, created_at, user_id')
    .order('created_at', { ascending: false })

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <DotGrid variant="page" />
      <Nav />
      <div className="relative max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold text-zinc-100 mb-1">Admin</h1>
        <p className="text-zinc-500 text-sm mb-8">
          {projects?.length ?? 0} project{projects?.length === 1 ? '' : 's'} total.
        </p>

        <div className="space-y-3">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
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
          ))}
        </div>
      </div>
    </div>
  )
}
