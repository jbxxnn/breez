import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DataTable } from "../data-table"
import { columns } from "../columns"
import { AuthSidebarWrapper } from "@/app/components/auth-sidebar-wrapper"
import { FloatingTaskPanel } from "../components/floating-task-panel"
import { startOfToday, endOfToday } from 'date-fns'

export default async function UpcomingTasksPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get today's date range
  const today = startOfToday()
  const todayEnd = endOfToday()

  // Fetch tasks from Supabase for the current user with today's date
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user?.id)
    .gte('due_date', today.toISOString())
    .lte('due_date', todayEnd.toISOString())
    .order('due_date', { ascending: true })

  return (
    <AuthSidebarWrapper>
      <div className="flex flex-col h-full">
        <header className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Upcoming Tasks</h1>
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