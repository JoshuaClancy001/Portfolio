'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${title}"?`)) return
    setLoading(true)
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:opacity-70 transition-opacity disabled:opacity-50"
    >
      delete
    </button>
  )
}
