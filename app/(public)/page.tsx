export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Metadata } from 'next'
import { getPublicProjects } from '@/lib/db'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

export const metadata: Metadata = { title: 'Josh Clancy' }

export default async function HomePage() {
  const projects = await getPublicProjects()
  const featured = projects.filter(p => p.Status === 'InProgress').slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12">
      <section className="py-24 md:py-32">
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl mb-8 tracking-tight">
          Joshua Clancy
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
          Full-stack software engineer building practical applications, backend services, and tools
          that solve real problems.
        </p>
      </section>

      <section className="py-16 border-t border-border">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">About</h2>
            <p className="text-base leading-relaxed mb-4">
              I build full-stack applications with a strong focus on backend systems, APIs, and
              product functionality. My experience includes developing production tools, integrating
              third-party services, debugging live systems, and shipping software quickly in
              fast-moving environments.
            </p>
          </div>
          <div>
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
              Currently Building
            </h2>
            {featured.length === 0 ? (
              <p className="text-muted-foreground text-sm">No projects yet.</p>
            ) : (
              <div className="space-y-4">
                {featured.map(project => (
                  <Link
                    key={project.Id}
                    href="/projects"
                    className="block p-6 bg-secondary border border-border hover:border-accent transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-heading group-hover:text-accent transition-colors flex-1">
                        {project.Title}
                      </h3>
                      <span
                        className="text-xs px-2 py-1 ml-3 flex-shrink-0 text-background"
                        style={{ backgroundColor: STATUS_COLORS[project.Status] }}
                      >
                        {STATUS_LABELS[project.Status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.Description}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
