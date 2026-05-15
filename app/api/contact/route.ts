import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const { name, email, body } = await req.json()

  if (!name || !email || !body) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const { error } = await getSupabase().from('Messages').insert({
    Id: randomUUID(),
    Name: name,
    Email: email,
    Body: body,
    IsRead: false,
    CreatedAt: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
