'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, ProjectStatus } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

type Filter = 'All' | ProjectStatus

const FILTERS: Filter[] = ['All', 'Planned', 'InProgress', 'Shipped', 'Paused']

export function ProjectsClient({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>('All')
  const router = useRouter()

  const filtered =
    filter === 'All' ? projects : projects.filter(p => p.Status === filter)

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
      <div className="mb-16">
        <h1 className="font-heading text-4xl md:text-6xl mb-6 tracking-tight">Projects</h1>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(project => (
            <div
              key={project.Id}
              onClick={() => router.push(`/projects/${project.Id}`)}
              className="p-6 bg-secondary border border-border hover:border-accent transition-colors flex flex-col cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-heading flex-1 group-hover:text-accent transition-colors">
                  {project.Title}
                </h3>
                <span
                  className="text-xs px-2 py-1 ml-3 flex-shrink-0 text-background"
                  style={{ backgroundColor: STATUS_COLORS[project.Status] }}
                >
                  {STATUS_LABELS[project.Status]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{project.Description}</p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tags.map(tag => (
                  <span
                    key={tag.Id}
                    className="text-xs px-2 py-1 bg-background text-muted-foreground border border-border"
                  >
                    {tag.Name}
                  </span>
                ))}
              </div>
              {(project.RepoUrl || project.LiveUrl) && (
                <div
                  className="flex gap-4 mt-4 pt-4 border-t border-border text-xs"
                  onClick={e => e.stopPropagation()}
                >
                  {project.RepoUrl && (
                    <a
                      href={project.RepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      repo →
                    </a>
                  )}
                  {project.LiveUrl && (
                    <a
                      href={project.LiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      live →
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
