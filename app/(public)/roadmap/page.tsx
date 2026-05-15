export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getAllProjectsWithChangelog } from '@/lib/db'
import { RoadmapClient } from '@/components/RoadmapClient'

export const metadata: Metadata = { title: 'Roadmap' }

export default async function RoadmapPage() {
  const projects = await getAllProjectsWithChangelog()
  return <RoadmapClient projects={projects} />
}
