'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, ProjectStatus } from '@/lib/types'

const inputClass =
  'w-full px-4 py-3 bg-secondary border border-border focus:border-accent outline-none transition-colors text-foreground'

interface Props {
  project?: Project
}

export function ProjectForm({ project }: Props) {
  const router = useRouter()
  const isEdit = !!project

  const [title, setTitle] = useState(project?.Title ?? '')
  const [description, setDescription] = useState(project?.Description ?? '')
  const [summary, setSummary] = useState(project?.Summary ?? '')
  const [status, setStatus] = useState<ProjectStatus>(project?.Status ?? 'Planned')
  const [sortOrder, setSortOrder] = useState(project?.SortOrder ?? 1)
  const [repoUrl, setRepoUrl] = useState(project?.RepoUrl ?? '')
  const [liveUrl, setLiveUrl] = useState(project?.LiveUrl ?? '')
  const [targetDate, setTargetDate] = useState(
    project?.TargetDate ? project.TargetDate.slice(0, 10) : '',
  )
  const [tags, setTags] = useState(project?.tags.map(t => t.Name).join(', ') ?? '')
  const [isPublic, setIsPublic] = useState(project?.IsPublic ?? false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const body = {
      title,
      description,
      summary,
      status,
      sortOrder,
      repoUrl: repoUrl || null,
      liveUrl: liveUrl || null,
      targetDate: targetDate || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isPublic,
    }

    const res = await fetch(
      isEdit ? `/api/projects/${project.Id}` : '/api/projects',
      {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )

    if (res.ok) {
      router.push('/admin/projects')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div>
        <label className="block text-sm text-muted-foreground mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-2">
          Description <span className="opacity-50">(short — shown on project cards)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          required
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-2">
          Summary <span className="opacity-50">(full write-up — shown on detail page)</span>
        </label>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={6}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as ProjectStatus)}
            className={inputClass}
          >
            <option value="Planned">Planned</option>
            <option value="InProgress">In Progress</option>
            <option value="Shipped">Shipped</option>
            <option value="Paused">Paused</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Sort Order</label>
          <input
            type="number"
            min={1}
            value={sortOrder}
            onChange={e => setSortOrder(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Repo URL</label>
          <input
            type="url"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Live URL</label>
          <input
            type="url"
            value={liveUrl}
            onChange={e => setLiveUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-2">
          Date <span className="opacity-50">(shown on roadmap)</span>
        </label>
        <input
          type="date"
          value={targetDate}
          onChange={e => setTargetDate(e.target.value)}
          className={`${inputClass} [color-scheme:dark]`}
        />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-2">
          Tags <span className="opacity-50">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="React, TypeScript, PostgreSQL"
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={e => setIsPublic(e.target.checked)}
          className="w-4 h-4 accent-accent"
        />
        <label htmlFor="isPublic" className="text-sm text-muted-foreground">
          Visible to public
        </label>
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-accent text-background hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
        >
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/projects')}
          className="px-8 py-3 border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
