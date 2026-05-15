import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const { data } = await getSupabase()
    .from('Messages')
    .select('*')
    .order('CreatedAt', { ascending: false })
  return NextResponse.json(data ?? [])
}
