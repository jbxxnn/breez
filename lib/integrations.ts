import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Integration } from '@/types/integrations'

export async function refreshGoogleToken(integration: Integration) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: integration.refresh_token!,
        grant_type: 'refresh_token',
      }),
    })

    const tokens = await response.json()
    
    // Update the token in the database
    const supabase = createClientComponentClient()
    await supabase
      .from('integrations')
      .update({
        access_token: tokens.access_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      })
      .eq('id', integration.id)

    return tokens.access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    throw error
  }
} 