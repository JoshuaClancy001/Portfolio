import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { getSupabase } from '@/lib/supabase'

interface Ctx {
  params: Promise<{ id: string }>
}

export async function PATCH(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const { error } = await getSupabase()
    .from('Messages')
    .update({ IsRead: true })
    .eq('Id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
