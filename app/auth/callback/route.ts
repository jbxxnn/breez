import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      await supabase.auth.exchangeCodeForSession(code)

      // Redirect to the dashboard after successful authentication
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    console.error('No code provided in callback')
    return NextResponse.redirect(new URL('/auth', request.url))
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/auth', request.url))
  }
} 