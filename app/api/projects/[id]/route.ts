import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { getSupabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

interface Ctx {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const { data } = await getSupabase()
    .from('Projects')
    .select('*')
    .eq('Id', id)
    .eq('IsPublic', true)
    .maybeSingle()
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const body = await req.json()
  const supabase = getSupabase()

  const { error } = await supabase
    .from('Projects')
    .update({
      Title: body.title,
      Description: body.description,
      Summary: body.summary || null,
      Status: body.status,
      IsPublic: body.isPublic ?? false,
      SortOrder: body.sortOrder ?? 1,
      RepoUrl: body.repoUrl || null,
      LiveUrl: body.liveUrl || null,
      TargetDate: body.targetDate || null,
      UpdatedAt: new Date().toISOString(),
    })
    .eq('Id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await syncTags(supabase, id, body.tags ?? [])

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const { error } = await getSupabase().from('Projects').delete().eq('Id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
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
