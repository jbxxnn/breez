"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
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
import { MoreHorizontal, Trash, ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { TaskFormDialog } from "./components/task-form-dialog"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export type Task = {
  id: string
  title: string
  status: "todo" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  created_at: string
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
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ChevronsUpDown className="ml-2.5 size-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ChevronsUpDown className="ml-2.5 size-4" />
        </Button>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={
          status === "completed" ? "secondary" :
          status === "in_progress" ? "outline" :
          "default"
        }>
          {status.replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ChevronsUpDown className="ml-2.5 size-4" />
        </Button>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string
      return (
        <Badge variant={
          priority === "high" ? "destructive" :
          priority === "medium" ? "secondary" :
          "default"
        }>
          {priority}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2.5 size-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2.5 size-4" />
          ) : (
            <ArrowUp className="ml-2.5 size-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      return formatDistanceToNow(new Date(row.getValue("created_at")), { addSuffix: true })
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} />,
  },
] 