import { Sidebar_07 } from "@/components/components-sidebar-07"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth')
  }

  // Get user profile data from your profiles table if you have one
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .eq('id', session.user.id)
  //   .single()

  const user = {
    name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
    avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '/avatars/default.jpg'
  }

  return (
    <main className="min-h-screen">
      <Sidebar_07 user={user}>
        <div>
          <h1>Dashboard</h1>
        </div>
      </Sidebar_07>
    </main>
  )
} 