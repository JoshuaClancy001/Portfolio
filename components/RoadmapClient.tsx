'use client'

import { useState } from 'react'
import type { Project, ProjectStatus, ChangelogEntry } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS, formatDate } from '@/lib/utils'

type Filter = 'All' | ProjectStatus

const FILTERS: Filter[] = ['All', 'InProgress', 'Planned', 'Shipped', 'Paused']

const STATUS_ORDER: Record<string, number> = {
  InProgress: 0,
  Planned: 1,
  Shipped: 2,
  Paused: 3,
}

type ProjectWithChangelog = Project & { changelog: ChangelogEntry[] }

export function RoadmapClient({ projects }: { projects: ProjectWithChangelog[] }) {
  const [filter, setFilter] = useState<Filter>('All')
  const [open, setOpen] = useState<Set<string>>(new Set())

  const sorted = [...projects].sort(
    (a, b) =>
      (STATUS_ORDER[a.Status] ?? 99) - (STATUS_ORDER[b.Status] ?? 99),
  )

  const filtered = filter === 'All' ? sorted : sorted.filter(p => p.Status === filter)

  function toggle(id: string) {
    setOpen(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-16">
      <div className="mb-16">
        <h1 className="font-heading text-4xl md:text-6xl mb-4 tracking-tight">Roadmap</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          A running log of what I&apos;m building, what I&apos;ve shipped, and what&apos;s coming next.
          Expand each project to see the full changelog.
        </p>
        <div className="flex gap-3 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 text-sm border transition-colors"
              style={{
                borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
                color: filter === f ? 'var(--accent)' : 'var(--muted-foreground)',
              }}
            >
              {f === 'All' ? 'All' : STATUS_LABELS[f as ProjectStatus]}
            </button>
          ))}
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet.</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-20 text-muted-foreground">No projects found.</p>
      ) : (
        <div className="space-y-0">
          {filtered.map(project => {
            const isOpen = open.has(project.Id)
            const dotColor = STATUS_COLORS[project.Status]

            return (
              <div
                key={project.Id}
                className="border-l-2 border-border pl-8 pb-12 relative"
              >
                <div
                  className="absolute left-0 top-0 w-4 h-4 rounded-full border-4 border-background"
                  style={{ backgroundColor: dotColor, transform: 'translateX(-0.5625rem)' }}
                />

                <div>
                  <button
                    onClick={() => toggle(project.Id)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm select-none">
                          {isOpen ? '▼' : '▶'}
                        </span>
                        <h3 className="font-heading group-hover:text-accent transition-colors">
                          {project.Title}
                        </h3>
                      </div>
                      <span
                        className="text-xs px-2 py-1 ml-3 flex-shrink-0 text-background"
                        style={{ backgroundColor: dotColor }}
                      >
                        {STATUS_LABELS[project.Status]}
                      </span>
                    </div>
                    {project.TargetDate && (
                      <div className="ml-7 text-xs text-muted-foreground">
                        {new Date(project.TargetDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                  </button>

                  {isOpen && (
                    <>
                      {project.Description && (
                        <p className="ml-7 mt-3 text-sm text-muted-foreground">
                          {project.Description}
                        </p>
                      )}
                      {project.changelog.length > 0 && (
                        <div className="ml-7 mt-6 space-y-3">
                          {project.changelog.map(entry => (
                            <div
                              key={entry.Id}
                              className={`pl-4 py-2 border-l-2 ${
                                entry.IsMilestone ? 'border-accent' : 'border-border'
                              }`}
                            >
                              <div className="text-xs text-muted-foreground mb-1">
                                {formatDate(entry.CreatedAt)}
                              </div>
                              <div
                                className={`text-sm ${entry.IsMilestone ? 'text-accent' : ''}`}
                              >
                                {entry.IsMilestone && '✦ '}
                                {entry.Content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
