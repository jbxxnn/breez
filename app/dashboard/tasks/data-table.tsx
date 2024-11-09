"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  // DropdownMenuLabel,
  // DropdownMenuItem,
  // DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { DataTableFacetedFilter } from "./components/data-table-faceted-filter"
import { DataTableDateRangePicker } from "./components/data-table-date-range-picker"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Task } from "./columns"
// import { Trash, ArrowUp, ArrowDown, ArrowRight } from "lucide-react"
import { getValidAccessToken, deleteCalendarEvent } from '@/lib/google-calendar'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const statuses = [
  {
    value: "todo",
    label: "Todo",
  },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "done",
    label: "Done",
  },
  {
    value: "canceled",
    label: "Canceled",
  },
]

const priorities = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
]

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const router = useRouter()
  const supabase = createClientComponentClient()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleBulkDelete = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const selectedIds = selectedRows.map((row) => (row.original as Task).id)

    try {
      // Delete from Google Calendar if events exist
      for (const task of selectedRows.map(row => row.original as Task)) {
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
            } catch (error) {
              console.error('Failed to delete calendar event:', error)
            }
          }
        }
      }

      // Delete the tasks
      await supabase
        .from("tasks")
        .delete()
        .in("id", selectedIds)

      table.toggleAllRowsSelected(false)
      router.refresh()
    } catch (error) {
      console.error("Error deleting tasks:", error)
    }
  }

  const handleBulkUpdateStatus = async (status: Task['status']) => {
    const selectedIds = table.getSelectedRowModel().rows.map((row) => (row.original as Task).id)

    try {
      await supabase
        .from("tasks")
        .update({ status })
        .in("id", selectedIds)

      table.toggleAllRowsSelected(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const handleBulkUpdatePriority = async (priority: Task['priority']) => {
    const selectedIds = table.getSelectedRowModel().rows.map((row) => (row.original as Task).id)

    try {
      await supabase
        .from("tasks")
        .update({ priority })
        .in("id", selectedIds)

      table.toggleAllRowsSelected(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating task priority:", error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filter tasks..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          )}
          {table.getColumn("priority") && (
            <DataTableFacetedFilter
              column={table.getColumn("priority")}
              title="Priority"
              options={priorities}
            />
          )}
          {table.getColumn("due_date") && (
            <DataTableDateRangePicker column={table.getColumn("due_date")} />
          )}
        </div>
        {table.getSelectedRowModel().rows.length > 0 && (
          <>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Update Status</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {statuses.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status.value}
                    onSelect={() => handleBulkUpdateStatus(status.value as Task['status'])}
                  >
                    {status.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Update Priority</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {priorities.map((priority) => (
                  <DropdownMenuCheckboxItem
                    key={priority.value}
                    onSelect={() => handleBulkUpdatePriority(priority.value as Task['priority'])}
                  >
                    {priority.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 