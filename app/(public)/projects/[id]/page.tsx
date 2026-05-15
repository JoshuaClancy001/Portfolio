export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getProjectById, getProjectChangelog } from '@/lib/db'
import { STATUS_COLORS, STATUS_LABELS, formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const project = await getProjectById(id)
  return { title: project?.Title ?? 'Project' }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const [project, changelog] = await Promise.all([
    getProjectById(id),
    getProjectChangelog(id),
  ])

  if (!project) notFound()

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-16">
      <div className="mb-4">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Projects
        </Link>
      </div>

      <div className="mb-10">
        <div className="flex items-start gap-4 flex-wrap mb-4">
          <h1 className="font-heading text-4xl md:text-5xl flex-1">{project.Title}</h1>
          <span
            className="text-sm px-3 py-1 text-background mt-1"
            style={{ backgroundColor: STATUS_COLORS[project.Status] }}
          >
            {STATUS_LABELS[project.Status]}
          </span>
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed">{project.Description}</p>
      </div>

      {(project.RepoUrl || project.LiveUrl) && (
        <div className="flex gap-6 mb-10">
          {project.RepoUrl && (
            <a
              href={project.RepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors text-sm"
            >
              View Repo →
            </a>
          )}
          {project.LiveUrl && (
            <a
              href={project.LiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-accent text-background hover:opacity-90 transition-opacity text-sm"
            >
              Live Site →
            </a>
          )}
        </div>
      )}

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {project.tags.map(tag => (
            <span key={tag.Id} className="text-xs px-3 py-1.5 bg-secondary border border-border text-muted-foreground">
              {tag.Name}
            </span>
          ))}
        </div>
      )}

      {project.Summary && (
        <section className="mb-12">
          <h2 className="font-heading text-2xl mb-6">Overview</h2>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.Summary}</div>
        </section>
      )}

      {project.images.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-2xl mb-6">Screenshots</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {project.images.map(image => (
              <div key={image.Id} className="border border-border overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.Url} alt={image.AltText ?? project.Title} className="w-full object-cover" />
                {image.AltText && (
                  <p className="text-xs text-muted-foreground px-4 py-2">{image.AltText}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {changelog.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-2xl mb-6">Changelog</h2>
          <div className="space-y-3">
            {changelog.map(entry => (
              <div
                key={entry.Id}
                className={`flex items-start gap-3 ${entry.IsMilestone ? 'border-l-2 border-accent pl-4' : 'pl-5'}`}
              >
                <span className={`shrink-0 mt-0.5 ${entry.IsMilestone ? 'text-accent' : 'text-muted-foreground'}`}>
                  {entry.IsMilestone ? '✦' : '·'}
                </span>
                <div>
                  <p className="text-sm text-foreground">{entry.Content}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.CreatedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
