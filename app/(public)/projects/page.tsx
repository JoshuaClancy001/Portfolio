export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getPublicProjects } from '@/lib/db'
import { ProjectsClient } from '@/components/ProjectsClient'

export const metadata: Metadata = { title: 'Projects' }

export default async function ProjectsPage() {
  const projects = await getPublicProjects()
  return <ProjectsClient projects={projects} />
}
