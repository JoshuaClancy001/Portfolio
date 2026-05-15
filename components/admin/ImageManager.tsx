'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ProjectImage } from '@/lib/types'

export function ImageManager({
  projectId,
  images: initial,
}: {
  projectId: string
  images: ProjectImage[]
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [altText, setAltText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const form = new FormData()
    form.append('file', file)
    form.append('projectId', projectId)
    form.append('altText', altText)

    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (res.ok) {
      if (fileRef.current) fileRef.current.value = ''
      setAltText('')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Upload failed')
    }
    setUploading(false)
  }

  async function handleDelete(imageId: string) {
    await fetch(`/api/images/${imageId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <>
      <form onSubmit={handleUpload} className="flex gap-3 mb-8 flex-wrap">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required
          className="flex-1 min-w-0 px-4 py-3 bg-secondary border border-border text-muted-foreground text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-background file:text-muted-foreground file:text-xs"
        />
        <input
          type="text"
          value={altText}
          onChange={e => setAltText(e.target.value)}
          placeholder="Alt text (optional)"
          className="px-4 py-3 bg-secondary border border-border focus:border-accent outline-none transition-colors text-foreground text-sm w-48"
        />
        <button
          type="submit"
          disabled={uploading}
          className="px-5 py-3 border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors text-sm whitespace-nowrap disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {initial.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {initial.map(image => (
            <div key={image.Id} className="relative group border border-border bg-secondary overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.Url} alt={image.AltText ?? ''} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(image.Id)}
                  className="text-xs text-red-500 hover:opacity-70 transition-opacity px-3 py-1 border border-red-500"
                >
                  remove
                </button>
              </div>
              {image.AltText && (
                <p className="text-xs text-muted-foreground px-3 py-2 truncate">{image.AltText}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm mb-8">No screenshots yet.</p>
      )}
    </>
  )
}
