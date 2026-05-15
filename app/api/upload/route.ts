import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { getSupabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

const BUCKET = 'project-images'
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.res

  const form = await req.formData()
  const file = form.get('file') as File | null
  const projectId = form.get('projectId') as string | null
  const altText = (form.get('altText') as string) || null

  if (!file || !projectId) {
    return NextResponse.json({ error: 'file and projectId required' }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and GIF allowed' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${projectId}/${randomUUID()}.${ext}`

  const supabase = getSupabase()
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const url = urlData.publicUrl

  const { data: existing } = await supabase
    .from('ProjectImages')
    .select('SortOrder')
    .eq('ProjectId', projectId)
    .order('SortOrder', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (existing?.SortOrder ?? 0) + 1

  await supabase.from('ProjectImages').insert({
    Id: randomUUID(),
    ProjectId: projectId,
    Url: url,
    AltText: altText,
    SortOrder: sortOrder,
    CreatedAt: new Date().toISOString(),
  })

  return NextResponse.json({ url }, { status: 201 })
}
