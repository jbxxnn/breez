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
import { MoreHorizontal, Trash, ChevronsUpDown, ArrowUp, ArrowDown, CircleX, CircleCheck, CircleHelp, Timer, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { TaskFormDialog } from "./components/task-form-dialog"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export type Task = {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  created_at: string
  due_date?: string
}

const ActionCell = ({ row }: { row: Row<Task> }) => {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const task = row.original

  const handleDelete = async () => {
    try {
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
        <DropdownMenuItem>
          <TaskFormDialog mode="edit" task={task} />
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-destructive"
          onClick={handleDelete}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
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
    size: 400, // Larger width for title
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
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent flex justify-start p-0"
        >
          Created
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
      return formatDistanceToNow(new Date(row.getValue("created_at")), { addSuffix: true })
    },
    filterFn: (row, id, value: { from: Date; to: Date }) => {
      const rowDate = new Date(row.getValue(id))
      return rowDate >= value.from && rowDate <= value.to
    },
    size: 180,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} />,
    size: 80, // Fixed width for actions
  },
] 