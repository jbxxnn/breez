"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
// import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash, ChevronsUpDown, ArrowUp, ArrowDown, CircleX, CircleCheck, CircleHelp, Timer, ArrowRight, Edit } from "lucide-react"
import { format } from 'date-fns'
import { TaskFormDialog } from "./components/task-form-dialog"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import FloatingPanel from "@/components/ui/floating-panel"
import { TaskPreviewPanel } from "./components/task-preview-panel"
import { useState } from "react"
import { deleteCalendarEvent } from '@/lib/google-calendar'
import { getValidAccessToken } from '@/lib/google-calendar'

export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "done" | "canceled"
  priority: "low" | "medium" | "high"
  due_date?: string
  start_time?: string
  end_time?: string
  user_id: string
  created_at: string
  calendar_event_id?: string
}

const ActionCell = ({ row }: { row: Row<Task> }) => {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const task = row.original
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleDelete = async () => {
    try {
      // Delete from Google Calendar if event exists
      if (task.calendar_event_id) {
        const { data: integration } = await supabase
          .from('integrations')
          .select('*')
          .eq('provider', 'google_calendar')
          .single()

        if (integration) {
          try {
            const accessToken = await getValidAccessToken(integration)
            const calendarId = integration.settings?.breez_calendar_id
            await deleteCalendarEvent(
              accessToken,
              calendarId,
              task.calendar_event_id
            )
          } catch (calendarError) {
            console.error('Failed to delete calendar event:', calendarError)
          }
        }
      }

      // Delete the task
      await supabase
        .from("tasks")
        .delete()
        .eq("id", task.id)

      router.refresh()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(task.id)}>
          Copy task ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-destructive"
          onClick={handleDelete}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
      {showEditDialog && (
        <TaskFormDialog 
          mode="edit" 
          task={task} 
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </DropdownMenu>
  )
}

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40, // Fixed width for checkbox column
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent flex justify-start p-0"
        >
          Title
          <ChevronsUpDown className="ml-2.5 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const task = row.original

      return (
        <FloatingPanel.Root>
          <FloatingPanel.Trigger
            className="w-full text-left hover:underline cursor-pointer"
            title={task.title}
          >
            {task.title}
          </FloatingPanel.Trigger>
          <TaskPreviewPanel task={task} />
        </FloatingPanel.Root>
      )
    },
    size: 400,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent flex justify-start p-0"
        >
          Status
          <ChevronsUpDown className="ml-2.5 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const StatusIcon = 
        status === "todo" ? CircleHelp :
        status === "in_progress" ? Timer :
        status === "done" ? CircleCheck :
        status === "canceled" ? CircleX :
        CircleHelp;

      return (
        <div className="flex items-center">
          <StatusIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="capitalize">{status.replace('_', ' ')}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 150, // Fixed width for status
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent flex justify-start p-0"
        >
          Priority
          <ChevronsUpDown className="ml-2.5 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string
      const PriorityIcon = 
        priority === "high" ? ArrowUp :
        priority === "medium" ? ArrowRight :
        priority === "low" ? ArrowDown :
        ArrowUp;

      return (
        <div className="flex items-center">
          <PriorityIcon className="mr-2 h-4 w-4" />
          <span className="capitalize">{priority}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 150, // Fixed width for priority
  },
  {
    accessorKey: "due_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent flex justify-start p-0"
        >
          Due Date
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2.5 size-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2.5 size-4" />
          ) : (
            <ChevronsUpDown className="ml-2.5 size-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const due_date = row.getValue("due_date") as string | null
      const start_time = row.original.start_time
      const end_time = row.original.end_time

      if (!due_date) return null

      return (
        <div className="flex flex-col">
          <div>{format(new Date(due_date), "MMM d, yyyy")}</div>
          {start_time && end_time && (
            <div className="text-sm text-muted-foreground">
              {start_time} - {end_time}
            </div>
          )}
        </div>
      )
    },
    filterFn: (row, id, value: { from: Date; to: Date }) => {
      const rowDate = row.getValue(id) as string | null
      if (!rowDate) return false
      const date = new Date(rowDate)
      return date >= value.from && date <= value.to
    },
    size: 180,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} />,
    size: 80, // Fixed width for actions
  },
] 