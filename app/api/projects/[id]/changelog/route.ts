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
    .from('ChangelogEntries')
    .select('*')
    .eq('ProjectId', id)
    .order('CreatedAt', { ascending: false })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const { content, isMilestone } = await req.json()
  const now = new Date().toISOString()

  const { error } = await getSupabase().from('ChangelogEntries').insert({
    Id: randomUUID(),
    ProjectId: id,
    Content: content,
    IsMilestone: isMilestone ?? false,
    CreatedAt: now,
    UpdatedAt: now,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
