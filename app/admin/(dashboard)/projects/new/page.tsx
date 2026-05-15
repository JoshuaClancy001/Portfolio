import type { Metadata } from 'next'
import Link from 'next/link'
import { ProjectForm } from '@/components/admin/ProjectForm'

export const metadata: Metadata = { title: 'Admin — New Project' }

export default function NewProjectPage() {
  return (
    <>
      <div className="mb-10">
        <Link href="/admin/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← back
        </Link>
        <h1 className="font-heading text-4xl mt-2">New Project</h1>
      </div>
      <ProjectForm />
    </>
  )
}
