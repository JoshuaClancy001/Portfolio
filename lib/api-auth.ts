import { cookies } from 'next/headers'
import { verifyToken } from './auth'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) {
    return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  try {
    await verifyToken(token)
    return { ok: true as const, res: null }
  } catch {
    return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
}
