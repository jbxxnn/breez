import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DataTable } from "../data-table"
import { columns } from "../columns"
import { AuthSidebarWrapper } from "@/app/components/auth-sidebar-wrapper"
import { FloatingTaskPanel } from "../components/floating-task-panel"

export default async function CanceledTasksPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch tasks from Supabase for the current user with canceled status
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user?.id)
    .eq('status', 'canceled')
    .order('created_at', { ascending: false })

  return (
    <AuthSidebarWrapper>
      <div className="flex flex-col h-full">
        <header className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Canceled Tasks</h1>
          </div>
          <div className="flex items-center gap-2">
            <FloatingTaskPanel />
          </div>
        </header>
        <main className="flex-1 p-4">
          <DataTable columns={columns} data={tasks || []} />
        </main>
      </div>
    </AuthSidebarWrapper>
  )
} 