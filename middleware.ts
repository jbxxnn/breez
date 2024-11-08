import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If accessing auth page with a session, redirect to dashboard
  if (session && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If accessing protected routes without a session, redirect to auth
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return res
}

export const config = {
  matcher: ['/auth', '/dashboard/:path*']
} 