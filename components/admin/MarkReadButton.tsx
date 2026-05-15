'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    await fetch(`/api/messages/${id}/read`, { method: 'PATCH' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-accent hover:opacity-70 transition-opacity disabled:opacity-50"
    >
      mark read
    </button>
  )
}
