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
  console.log('Creating calendar event with params:', {
    calendarId,
    taskId: task.id,
    title: task.title,
    dueDate: task.due_date
  })
  
  try {
    // Create start date from due_date and start_time
    const startDate = new Date(task.due_date!)
    if (task.start_time) {
      const [startHours, startMinutes] = task.start_time.split(':')
      startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0)
    }
    console.log('Calculated start date:', startDate)

    // Create end date from due_date and end_time
    const endDate = new Date(task.due_date!)
    if (task.end_time) {
      const [endHours, endMinutes] = task.end_time.split(':')
      endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0)
    } else {
      // If no end time, make it 1 hour after start
      endDate.setHours(startDate.getHours() + 1, startDate.getMinutes(), 0)
    }
    console.log('Calculated end date:', endDate)

    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }
    
    console.log('Calendar event payload:', event)
    console.log('Request URL:', `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`)
    console.log('Access token (first 10 chars):', accessToken.substring(0, 10))

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

    console.log('Calendar API response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Google Calendar API error response:', errorData)
      throw new Error(`Calendar API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('Calendar event created successfully:', {
      eventId: data.id,
      htmlLink: data.htmlLink,
      status: data.status
    })
    
    return {
      eventId: data.id,
      htmlLink: data.htmlLink
    }
  } catch (error) {
    console.error('Error in createCalendarEvent:', error)
    console.error('Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    })
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

export async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  task: Partial<Task>
) {
  console.log('Updating calendar event:', eventId)
  
  try {
    // Create start date from due_date and start_time
    const startDate = new Date(task.due_date!)
    if (task.start_time) {
      const [startHours, startMinutes] = task.start_time.split(':')
      startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0)
    }

    // Create end date from due_date and end_time
    const endDate = new Date(task.due_date!)
    if (task.end_time) {
      const [endHours, endMinutes] = task.end_time.split(':')
      endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0)
    } else {
      endDate.setHours(startDate.getHours() + 1, startDate.getMinutes(), 0)
    }

    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'PATCH',
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
    console.log('Calendar event updated:', data)
    return data
  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw error
  }
}

export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
) {
  console.log('Deleting calendar event:', eventId)
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Google Calendar API error:', errorData)
      throw new Error(`Calendar API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    console.log('Calendar event deleted successfully')
    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    throw error
  }
} 