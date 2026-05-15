import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { getSupabase } from '@/lib/supabase'

interface Ctx {
  params: Promise<{ entryId: string }>
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const { entryId } = await params
  const { content, isMilestone, entryDate } = await req.json()

  const update: Record<string, unknown> = {
    Content: content,
    IsMilestone: isMilestone ?? false,
    UpdatedAt: new Date().toISOString(),
  }
  if (entryDate) update.CreatedAt = new Date(entryDate).toISOString()

  const { error } = await getSupabase()
    .from('ChangelogEntries')
    .update(update)
    .eq('Id', entryId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const { entryId } = await params
  const { error } = await getSupabase().from('ChangelogEntries').delete().eq('Id', entryId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
