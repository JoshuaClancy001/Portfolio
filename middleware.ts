import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  const token = request.cookies.get('admin_token')?.value
  if (!token) return NextResponse.redirect(new URL('/admin/login', request.url))

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = { matcher: ['/admin/:path*'] }
