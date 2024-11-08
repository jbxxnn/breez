import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Remove the integration from the database
    const { error } = await supabase
      .from('integrations')
      .delete()
      .match({ 
        user_id: user.id, 
        provider: 'google_calendar' 
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    )
  }
} 