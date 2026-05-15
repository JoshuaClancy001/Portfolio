import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { getSupabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function GET() {
  const { data } = await getSupabase()
    .from('Projects')
    .select('*')
    .eq('IsPublic', true)
    .order('SortOrder')
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const body = await req.json()
  const supabase = getSupabase()
  const now = new Date().toISOString()

  const projectId = randomUUID()
  const { error } = await supabase.from('Projects').insert({
    Id: projectId,
    Title: body.title,
    Description: body.description,
    Summary: body.summary || null,
    Status: body.status,
    IsPublic: body.isPublic ?? false,
    SortOrder: body.sortOrder ?? 1,
    RepoUrl: body.repoUrl || null,
    LiveUrl: body.liveUrl || null,
    TargetDate: body.targetDate || null,
    CreatedAt: now,
    UpdatedAt: now,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await syncTags(supabase, projectId, body.tags ?? [])

  return NextResponse.json({ id: projectId }, { status: 201 })
}

async function syncTags(
  supabase: ReturnType<typeof getSupabase>,
  projectId: string,
  tagNames: string[],
) {
  await supabase.from('ProjectTags').delete().eq('ProjectId', projectId)
  if (!tagNames.length) return

  for (const name of tagNames) {
    const trimmed = name.trim()
    if (!trimmed) continue

    const { data: existing } = await supabase
      .from('Tags')
      .select('Id')
      .eq('Name', trimmed)
      .maybeSingle()

    const tagId = existing?.Id ?? randomUUID()

    if (!existing) {
      await supabase.from('Tags').insert({ Id: tagId, Name: trimmed })
    }

    await supabase.from('ProjectTags').insert({ ProjectId: projectId, TagId: tagId })
  }
}
