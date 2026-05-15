'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ChangelogEntry } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export function ChangelogManager({
  projectId,
  entries,
}: {
  projectId: string
  entries: ChangelogEntry[]
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isMilestone, setIsMilestone] = useState(false)
  const [adding, setAdding] = useState(false)
  const [openEntries, setOpenEntries] = useState<Set<string>>(new Set())

  function toggleEntry(id: string) {
    setOpenEntries(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setAdding(true)
    await fetch(`/api/projects/${projectId}/changelog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, isMilestone }),
    })
    setContent('')
    setIsMilestone(false)
    router.refresh()
    setAdding(false)
  }

  async function handleUpdate(
    entryId: string,
    data: { content: string; isMilestone: boolean; entryDate: string },
  ) {
    await fetch(`/api/changelog/${entryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
  }

  async function handleDelete(entryId: string) {
    await fetch(`/api/changelog/${entryId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <>
      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Add a changelog entry…"
          required
          className="flex-1 px-4 py-3 bg-secondary border border-border focus:border-accent outline-none transition-colors text-foreground text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
          <input
            type="checkbox"
            checked={isMilestone}
            onChange={e => setIsMilestone(e.target.checked)}
            className="accent-accent"
          />
          milestone
        </label>
        <button
          type="submit"
          disabled={adding}
          className="px-5 py-3 border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors text-sm whitespace-nowrap disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">No entries yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <EntryRow
              key={entry.Id}
              entry={entry}
              isOpen={openEntries.has(entry.Id)}
              onToggle={() => toggleEntry(entry.Id)}
              onUpdate={data => handleUpdate(entry.Id, data)}
              onDelete={() => handleDelete(entry.Id)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function EntryRow({
  entry,
  isOpen,
  onToggle,
  onUpdate,
  onDelete,
}: {
  entry: ChangelogEntry
  isOpen: boolean
  onToggle: () => void
  onUpdate: (data: { content: string; isMilestone: boolean; entryDate: string }) => void
  onDelete: () => void
}) {
  const [content, setContent] = useState(entry.Content)
  const [isMilestone, setIsMilestone] = useState(entry.IsMilestone)
  const [entryDate, setEntryDate] = useState(entry.CreatedAt.slice(0, 10))

  return (
    <div className="border border-border bg-secondary">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <span className={`shrink-0 mt-0.5 ${entry.IsMilestone ? 'text-accent' : 'text-muted-foreground'}`}>
          {entry.IsMilestone ? '✦' : '·'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">{entry.Content}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatDate(entry.CreatedAt)}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">edit ▾</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border focus:border-accent outline-none transition-colors text-foreground text-sm"
          />
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={entryDate}
              onChange={e => setEntryDate(e.target.value)}
              className="px-3 py-2 bg-background border border-border focus:border-accent outline-none transition-colors text-foreground text-sm [color-scheme:dark]"
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={isMilestone}
                onChange={e => setIsMilestone(e.target.checked)}
                className="accent-accent"
              />
              milestone
            </label>
            <button
              onClick={() => onUpdate({ content, isMilestone, entryDate })}
              className="px-4 py-2 bg-accent text-background text-xs hover:opacity-90 transition-opacity"
            >
              Save
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-red-500 hover:opacity-70 transition-opacity"
            >
              remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
