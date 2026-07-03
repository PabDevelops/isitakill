'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete "${projectName}"? This can't be undone.`)) return
    setLoading(true)
    const res = await fetch('/api/admin/delete-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      setLoading(false)
      alert('Failed to delete')
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
