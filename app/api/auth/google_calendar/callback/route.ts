import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function createOrGetBreezCalendar(accessToken: string) {
  try {
    // First, list all calendars to check if 'breez' exists
    const listResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const calendars = await listResponse.json()
    const breezCalendar = calendars.items?.find(
      (cal: { summary: string }) => cal.summary === 'breez'
    )

    if (breezCalendar) {
      return breezCalendar.id
    }

    // If 'breez' calendar doesn't exist, create it
    const createResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: 'breez',
          description: 'Calendar created by breez application',
          timeZone: 'UTC' // You might want to use the user's timezone
        })
      }
    )

    if (!createResponse.ok) {
      throw new Error('Failed to create breez calendar')
    }

    const newCalendar = await createResponse.json()
    return newCalendar.id
  } catch (error) {
    console.error('Error managing breez calendar:', error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')

    if (error) {
      throw new Error(`OAuth error: ${error}`)
    }

    if (!code) {
      throw new Error('No code provided')
    }

    // Verify required environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Missing required environment variables')
    }

    // Exchange the code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${requestUrl.origin}/api/auth/google_calendar/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      throw new Error(`Token exchange failed: ${JSON.stringify(errorData)}`)
    }

    const tokens = await tokenResponse.json()

    // Create or get the breez calendar
    const breezCalendarId = await createOrGetBreezCalendar(tokens.access_token)

    // Get the current user
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('No authenticated user')
    }

    // Store integration details including the breez calendar ID
    const { error: integrationError } = await supabase
      .from('integrations')
      .upsert({
        user_id: user.id,
        provider: 'google_calendar',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        settings: {
          breez_calendar_id: breezCalendarId
        }
      })

    if (integrationError) {
      throw integrationError
    }

    // Redirect back to integrations page
    return NextResponse.redirect(
      new URL('/dashboard/auth/integrations?success=true', request.url)
    )
  } catch (error) {
    console.error('Google Calendar callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/auth/integrations?error=callback_failed', request.url)
    )
  }
} 