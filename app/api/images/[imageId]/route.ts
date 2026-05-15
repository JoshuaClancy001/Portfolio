import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { getSupabase } from '@/lib/supabase'

const BUCKET = 'project-images'

interface Ctx {
  params: Promise<{ imageId: string }>
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const { imageId } = await params
  const supabase = getSupabase()

  const { data: image } = await supabase
    .from('ProjectImages')
    .select('Url')
    .eq('Id', imageId)
    .maybeSingle()

  if (image?.Url) {
    const supabaseUrl = process.env.SUPABASE_URL!
    const prefix = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`
    if (image.Url.startsWith(prefix)) {
      const path = image.Url.slice(prefix.length)
      await supabase.storage.from(BUCKET).remove([path])
    }
  }

  const { error } = await supabase.from('ProjectImages').delete().eq('Id', imageId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
