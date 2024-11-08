import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Verify user is authenticated
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Google OAuth configuration
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = `${new URL(request.url).origin}/api/auth/google_calendar/callback`
    
    // Define the scopes you need
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ]
    
    if (!clientId) {
      throw new Error('Missing Google client ID')
    }

    // Construct Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes.join(' '))}` +
      `&access_type=offline` +
      `&prompt=consent`

    return NextResponse.redirect(googleAuthUrl)
  } catch (error) {
    console.error('Authorization error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/auth/integrations?error=authorization_failed', request.url)
    )
  }
} 