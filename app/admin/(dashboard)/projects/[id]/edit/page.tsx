import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getProjectById, getProjectChangelog } from '@/lib/db'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { ImageManager } from '@/components/admin/ImageManager'
import { ChangelogManager } from '@/components/admin/ChangelogManager'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Admin — Edit Project' }

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const [project, changelog] = await Promise.all([
    getProjectById(id, true),
    getProjectChangelog(id),
  ])

  if (!project) notFound()

  return (
    <>
      <div className="mb-10">
        <Link href="/admin/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← back
        </Link>
        <h1 className="font-heading text-4xl mt-2">Edit Project</h1>
      </div>

      <ProjectForm project={project} />

      <section className="mt-16 max-w-2xl">
        <h2 className="font-heading text-2xl mb-6">Screenshots</h2>
        <ImageManager projectId={project.Id} images={project.images} />
      </section>

      <section id="changelog" className="mt-8 max-w-2xl">
        <h2 className="font-heading text-2xl mb-6">Changelog</h2>
        <ChangelogManager projectId={project.Id} entries={changelog} />
      </section>
    </>
  )
}
