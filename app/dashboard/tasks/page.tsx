import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Sidebar_07 } from "@/components/components-sidebar-07"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
//   DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TaskFormDialog } from "./components/task-form-dialog"

export default async function TasksPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get current user (only need to fetch once)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch tasks from Supabase for the current user
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  // Prepare user data for sidebar
  const userData = {
    name: user?.user_metadata?.full_name || 'User',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url || '',
  }

  return (
    <Sidebar_07 user={userData}>
      <div className="flex flex-col h-full">
        <header className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Tasks</h1>
            <TaskFormDialog mode="create" />
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter tasks..."
              className="h-8 w-[150px] lg:w-[250px]"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Column visibility controls will be handled in data-table.tsx */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4">
          <DataTable columns={columns} data={tasks || []} />
        </main>
      </div>
    </Sidebar_07>
  )
} 