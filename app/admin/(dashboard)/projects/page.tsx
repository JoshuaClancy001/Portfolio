import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllProjects } from '@/lib/db'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { DeleteProjectButton } from '@/components/admin/DeleteProjectButton'

export const metadata: Metadata = { title: 'Admin — Projects' }

export default async function AdminProjectsPage() {
  const projects = await getAllProjects()

  return (
    <>
      <div className="flex items-center justify-between mb-12">
        <h1 className="font-heading text-4xl">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="px-6 py-3 bg-accent text-background hover:opacity-90 transition-opacity text-sm"
        >
          + new project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet.</p>
      ) : (
        <div className="space-y-2">
          {projects.map(project => (
            <div
              key={project.Id}
              className="border border-border p-4 flex items-center gap-4 hover:border-muted-foreground transition-colors"
            >
              <div className="text-muted-foreground text-sm w-6 text-center shrink-0">
                {project.SortOrder}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-0.5 flex-wrap">
                  <span className="text-foreground">{project.Title}</span>
                  <span
                    className="text-xs px-2 py-0.5 text-background"
                    style={{ backgroundColor: STATUS_COLORS[project.Status] }}
                  >
                    {STATUS_LABELS[project.Status]}
                  </span>
                  {!project.IsPublic && (
                    <span className="text-xs px-2 py-0.5 border border-border text-muted-foreground">
                      hidden
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-xs truncate">{project.Description}</p>
              </div>
              <div className="flex gap-6 shrink-0 text-sm">
                <Link
                  href={`/admin/projects/${project.Id}/edit#changelog`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  changelog
                </Link>
                <Link
                  href={`/admin/projects/${project.Id}/edit`}
                  className="text-accent hover:opacity-70 transition-opacity"
                >
                  edit
                </Link>
                <DeleteProjectButton id={project.Id} title={project.Title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
