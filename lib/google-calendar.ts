// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Integration } from '@/types/integrations'
import type { Task } from '@/types/tasks'

console.log('Environment check:', {
  hasClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  clientIdPrefix: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 5),
})

export async function getValidAccessToken(integration: Integration) {
  console.log('Getting valid access token for integration:', integration.id)
  
  const expiresAt = new Date(integration.expires_at)
  const now = new Date()
  
  console.log('Token expires at:', expiresAt)
  console.log('Current time:', now)
  
  if (expiresAt <= now) {
    console.log('Token expired, refreshing...')
    try {
      const newToken = await refreshGoogleToken(integration)
      console.log('Token refreshed successfully')
      return newToken
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }
  
  console.log('Using existing valid token')
  return integration.access_token
}

export async function fetchCalendarEvents(accessToken: string) {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?' +
    new URLSearchParams({
      timeMin: new Date().toISOString(),
      maxResults: '10',
      singleEvents: 'true',
      orderBy: 'startTime',
    }),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events')
  }

  return response.json()
}

export async function createCalendarEvent(accessToken: string, calendarId: string, task: Partial<Task>) {
  console.log('Creating calendar event in calendar:', calendarId)
  
  try {
    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: task.due_date,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: task.due_date,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }
    
    console.log('Calendar event payload:', event)
    console.log('Using calendar ID:', calendarId)

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Google Calendar API error:', errorData)
      throw new Error(`Calendar API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('Calendar event created:', data)
    return data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    throw error
  }
}

export async function refreshGoogleToken(integration: Integration) {
  console.log('Refreshing token for integration:', integration.id)
  
  try {
    const response = await fetch('/api/auth/google/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        integrationId: integration.id,
        refreshToken: integration.refresh_token,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Token refresh failed:', data)
      throw new Error(`Token refresh failed: ${data.error || 'Unknown error'}`)
    }

    console.log('Token refreshed successfully')
    return data.access_token
  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
} 