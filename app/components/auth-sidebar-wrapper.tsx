import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Sidebar_07 } from "@/components/components-sidebar-07"

export async function AuthSidebarWrapper({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const userData = {
    name: user?.user_metadata?.full_name || 'User',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || '',
  }

  return (
    <Sidebar_07 user={userData}>
      {children}
    </Sidebar_07>
  )
} 