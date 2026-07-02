'use client'
import { useEffect } from 'react'

export default function ViewTracker({ projectId }: { projectId: string }) {
  useEffect(() => {
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    }).catch(() => {})
  }, [projectId])

  return null
}
