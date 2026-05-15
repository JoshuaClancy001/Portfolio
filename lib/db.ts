import { getSupabase } from './supabase'
import type { Project, Tag, ProjectImage, ChangelogEntry, Message, ProjectStatus } from './types'

interface RawProject {
  Id: string
  Title: string
  Description: string
  Summary: string | null
  Status: string
  IsPublic: boolean
  SortOrder: number
  RepoUrl: string | null
  LiveUrl: string | null
  TargetDate: string | null
  CreatedAt: string
  UpdatedAt: string
}

async function enrichProjects(raw: RawProject[]): Promise<Project[]> {
  if (!raw.length) return []
  const supabase = getSupabase()
  const ids = raw.map(p => p.Id)

  const [ptResult, imgResult] = await Promise.all([
    supabase.from('ProjectTags').select('ProjectId, TagId').in('ProjectId', ids),
    supabase.from('ProjectImages').select('*').in('ProjectId', ids).order('SortOrder'),
  ])

  const ptRows = (ptResult.data ?? []) as { ProjectId: string; TagId: string }[]
  const tagIds = [...new Set(ptRows.map(pt => pt.TagId))]

  let tagRows: Tag[] = []
  if (tagIds.length) {
    const { data } = await supabase.from('Tags').select('Id, Name').in('Id', tagIds)
    tagRows = (data ?? []) as Tag[]
  }

  const tagMap = new Map(tagRows.map(t => [t.Id, t]))
  const tagsByProject = new Map<string, Tag[]>()
  ptRows.forEach(pt => {
    const tag = tagMap.get(pt.TagId)
    if (tag) {
      const arr = tagsByProject.get(pt.ProjectId) ?? []
      arr.push(tag)
      tagsByProject.set(pt.ProjectId, arr)
    }
  })

  const images = (imgResult.data ?? []) as ProjectImage[]

  return raw.map(p => ({
    ...p,
    Status: p.Status as ProjectStatus,
    tags: tagsByProject.get(p.Id) ?? [],
    images: images.filter(img => img.ProjectId === p.Id),
  }))
}

export async function getPublicProjects(): Promise<Project[]> {
  const { data } = await getSupabase()
    .from('Projects')
    .select('*')
    .eq('IsPublic', true)
    .order('SortOrder')
  return enrichProjects((data ?? []) as RawProject[])
}

export async function getAllProjects(): Promise<Project[]> {
  const { data } = await getSupabase().from('Projects').select('*').order('SortOrder')
  return enrichProjects((data ?? []) as RawProject[])
}

export async function getProjectById(id: string, adminAccess = false): Promise<Project | null> {
  let query = getSupabase().from('Projects').select('*').eq('Id', id)
  if (!adminAccess) query = query.eq('IsPublic', true)
  const { data } = await query.maybeSingle()
  if (!data) return null
  const [project] = await enrichProjects([data as RawProject])
  return project ?? null
}

export async function getProjectChangelog(projectId: string): Promise<ChangelogEntry[]> {
  const { data } = await getSupabase()
    .from('ChangelogEntries')
    .select('*')
    .eq('ProjectId', projectId)
    .order('CreatedAt', { ascending: false })
  return (data ?? []) as ChangelogEntry[]
}

export async function getAllProjectsWithChangelog(): Promise<(Project & { changelog: ChangelogEntry[] })[]> {
  const projects = await getPublicProjects()
  if (!projects.length) return []

  const ids = projects.map(p => p.Id)
  const { data } = await getSupabase()
    .from('ChangelogEntries')
    .select('*')
    .in('ProjectId', ids)
    .order('CreatedAt', { ascending: false })

  const byProject = new Map<string, ChangelogEntry[]>()
  ;((data ?? []) as ChangelogEntry[]).forEach(e => {
    const arr = byProject.get(e.ProjectId) ?? []
    arr.push(e)
    byProject.set(e.ProjectId, arr)
  })

  return projects.map(p => ({ ...p, changelog: byProject.get(p.Id) ?? [] }))
}

export async function getMessages(): Promise<Message[]> {
  const { data } = await getSupabase()
    .from('Messages')
    .select('*')
    .order('CreatedAt', { ascending: false })
  return (data ?? []) as Message[]
}

export async function getDashboardStats() {
  const [total, pub, unread] = await Promise.all([
    getSupabase().from('Projects').select('*', { count: 'exact', head: true }),
    getSupabase().from('Projects').select('*', { count: 'exact', head: true }).eq('IsPublic', true),
    getSupabase().from('Messages').select('*', { count: 'exact', head: true }).eq('IsRead', false),
  ])
  return {
    totalProjects: total.count ?? 0,
    publicProjects: pub.count ?? 0,
    unreadMessages: unread.count ?? 0,
  }
}
