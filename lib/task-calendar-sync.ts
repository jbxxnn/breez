import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { 
  getValidAccessToken, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from './google-calendar'
import type { Task } from '@/types/tasks'

export async function syncTaskWithCalendar(
  task: Partial<Task>,
  action: 'create' | 'update' | 'delete'
) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get Google Calendar integration
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('provider', 'google_calendar')
      .single()

    if (!integration) {
      console.log('No Google Calendar integration found')
      return null
    }

    const accessToken = await getValidAccessToken(integration)
    const calendarId = integration.settings?.breez_calendar_id

    if (!calendarId) {
      throw new Error('No breez calendar ID found')
    }

    switch (action) {
      case 'create': {
        const event = await createCalendarEvent(accessToken, calendarId, task)
        console.log('Calendar event created:', event)
        
        // Store the event ID
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ calendar_event_id: event.eventId })
          .eq('id', task.id)
        
        if (updateError) {
          console.error('Failed to update task with calendar event ID:', updateError)
        }
        return event
      }
      
      case 'update': {
        if (!task.calendar_event_id) {
          // If no event ID exists, create a new event
          const event = await createCalendarEvent(accessToken, calendarId, task)
          await supabase
            .from('tasks')
            .update({ calendar_event_id: event.eventId })
            .eq('id', task.id)
          return event
        }
        
        return await updateCalendarEvent(
          accessToken,
          calendarId,
          task.calendar_event_id,
          task
        )
      }
      
      case 'delete': {
        if (task.calendar_event_id) {
          await deleteCalendarEvent(
            accessToken,
            calendarId,
            task.calendar_event_id
          )
        }
        return true
      }
    }
  } catch (error) {
    console.error('Error syncing task with calendar:', error)
    throw error
  }
} 