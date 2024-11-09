"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Pencil } from "lucide-react"
import { Task } from "../columns"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { getValidAccessToken, createCalendarEvent } from '@/lib/google-calendar'

interface TaskFormDialogProps {
  task?: Task
  mode: "create" | "edit"
}

export function TaskFormDialog({ task, mode }: TaskFormDialogProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Task>>(
    task || {
      title: "",
      description: "",
      status: "todo",
      priority: "low",
      due_date: "",
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log('Starting task creation process...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")
      console.log('Current user:', user.id)

      if (mode === "create") {
        console.log('Creating new task with data:', formData)
        
        // Create new task
        const { data: newTask, error: taskError } = await supabase
          .from("tasks")
          .insert([{
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            due_date: formData.due_date || null,
            user_id: user.id,
          }])
          .select()
          .single()

        if (taskError) throw taskError
        console.log('Task created successfully:', newTask)

        // Handle Google Calendar integration
        if (newTask && formData.due_date) {
          console.log('Attempting to create Google Calendar event...')
          
          // Check for Google Calendar integration
          const { data: integration, error: integrationError } = await supabase
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('provider', 'google_calendar')
            .single()

          if (integrationError) {
            console.error('Error fetching integration:', integrationError)
            throw integrationError
          }

          console.log('Found integration:', integration)

          if (integration) {
            try {
              console.log('Getting valid access token...')
              const accessToken = await getValidAccessToken(integration)
              console.log('Access token obtained')

              console.log('Creating calendar event with data:', {
                title: newTask.title,
                description: newTask.description,
                due_date: newTask.due_date
              })

              await createCalendarEvent(
                accessToken,
                'primary',
                newTask
              )
              console.log('Calendar event created successfully')
            } catch (calendarError) {
              console.error('Calendar integration error:', calendarError)
              console.error('Calendar error stack:', calendarError instanceof Error ? calendarError.stack : '')
              
              toast({
                title: "Warning",
                description: "Task created but failed to add to Google Calendar",
                variant: "default",
              })
            }
          } else {
            console.log('No Google Calendar integration found for user')
          }
        } else {
          console.log('Skipping calendar event creation - no due date or task data')
        }
      } else {
        // Update existing task
        const { error: updateError } = await supabase
          .from("tasks")
          .update({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            due_date: formData.due_date || null,
          })
          .eq("id", task?.id)

        if (updateError) throw updateError
      }

      toast({
        title: "Success",
        description: `Task ${mode === "create" ? "created" : "updated"} successfully`,
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Task creation error:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : '')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        ) : (
          <div className="flex w-full items-center">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Task" : "Edit Task"}</DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Add a new task to your list" 
              : "Make changes to your task here"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Add a more detailed description..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Task["status"]) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Task["priority"]) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? (
                      format(new Date(formData.due_date), "PPP p")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Set time to end of day by default
                        date.setHours(23, 59, 59, 999)
                        setFormData((prev) => ({
                          ...prev,
                          due_date: date.toISOString(),
                        }))
                      }
                    }}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={formData.due_date 
                        ? format(new Date(formData.due_date), "HH:mm")
                        : ""
                      }
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':')
                        const date = formData.due_date 
                          ? new Date(formData.due_date)
                          : new Date()
                        date.setHours(parseInt(hours), parseInt(minutes))
                        setFormData((prev) => ({
                          ...prev,
                          due_date: date.toISOString(),
                        }))
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 