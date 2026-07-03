import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.isitakill.com'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  let projectUrls: { url: string; lastModified?: string | Date }[] = []

  try {
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data: projects } = await supabase
        .from('projects')
        .select('slug, created_at')
        .order('created_at', { ascending: false })

      if (projects) {
        projectUrls = projects.map((p) => ({
          url: `${baseUrl}/p/${p.slug}`,
          lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        }))
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error)
  }

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
    },
  ]

  return [...staticUrls, ...projectUrls]
}
