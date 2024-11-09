"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import FloatingPanel from "@/components/ui/floating-panel"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { getValidAccessToken, createCalendarEvent } from '@/lib/google-calendar'
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export function FloatingTaskPanel() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "todo",
    priority: "low",
    due_date: "",
  })
  const [isCalendarLoading, setIsCalendarLoading] = useState(false)
  const [addToCalendar, setAddToCalendar] = useState(true)

  return (
    <FloatingPanel.Root>
      <FloatingPanel.Trigger title="Add Task" className="bg-black text-white">
        <Plus className="mr-2 inline-block size-4" />
        Add Task
      </FloatingPanel.Trigger>
      <FloatingPanel.Content className="w-[400px]">
        <FloatingPanel.Form
          onSubmit={async () => {
            if (!formData.title?.trim()) {
              throw new Error("Title is required")
            }

            try {
              const { data: { user } } = await supabase.auth.getUser()
              if (!user) throw new Error("No user found")

              const { data: task, error: taskError } = await supabase
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

              if (task && formData.due_date && addToCalendar) {
                try {
                  setIsCalendarLoading(true)
                  
                  const { data: integration } = await supabase
                    .from('integrations')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('provider', 'google_calendar')
                    .single()

                  if (integration) {
                    const accessToken = await getValidAccessToken(integration)
                    const calendarId = integration.settings?.breez_calendar_id

                    if (!calendarId) {
                      toast({
                        title: "Partial Success",
                        description: "Task created but no calendar ID found. Please check your Google Calendar integration.",
                        variant: "default",
                      })
                      return
                    }

                    await createCalendarEvent(
                      accessToken,
                      calendarId,
                      task
                    )

                    toast({
                      title: "✨ Complete Success",
                      description: (
                        <div className="flex flex-col gap-1">
                          <span>✓ Task created successfully</span>
                          <span>✓ Added to Google Calendar</span>
                        </div>
                      ),
                      variant: "default",
                    })
                  } else {
                    toast({
                      title: "Task Created",
                      description: "Task saved without calendar event (No Google Calendar integration found)",
                      variant: "default",
                    })
                  }
                } catch (calendarError) {
                  console.error('Calendar error:', calendarError)
                  toast({
                    title: "Partial Success",
                    description: (
                      <div className="flex flex-col gap-1">
                        <span>✓ Task created successfully</span>
                        <span>✗ Failed to add to Google Calendar</span>
                        <span className="text-sm text-muted-foreground">
                          {calendarError instanceof Error ? calendarError.message : "Unknown error"}
                        </span>
                      </div>
                    ),
                    variant: "default",
                  })
                } finally {
                  setIsCalendarLoading(false)
                }
              } else {
                toast({
                  title: "Task Created",
                  description: !addToCalendar 
                    ? "Task saved (calendar integration disabled)"
                    : formData.due_date 
                      ? "Task saved successfully"
                      : "Task saved (no calendar event needed - no due date set)",
                  variant: "default",
                })
              }

              setFormData({
                title: "",
                description: "",
                status: "todo",
                priority: "low",
                due_date: "",
              })
              setAddToCalendar(true)

              router.refresh()
            } catch (error) {
              console.error("Error:", error)
              toast({
                title: "Error",
                description: error instanceof Error 
                  ? error.message 
                  : "Failed to create task",
                variant: "destructive",
              })
              throw error
            }
          }}
        >
          <FloatingPanel.Header>
            <div className="flex items-center gap-2">
              <FloatingPanel.CloseButton />
              Create New Task
            </div>
          </FloatingPanel.Header>
          <FloatingPanel.Body>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
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

              {formData.due_date && (
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="calendar"
                    checked={addToCalendar}
                    onCheckedChange={(checked) => setAddToCalendar(checked as boolean)}
                  />
                  <Label 
                    htmlFor="calendar" 
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Add to Google Calendar
                  </Label>
                </div>
              )}
            </div>
          </FloatingPanel.Body>
          <FloatingPanel.Footer className="border-t">
            <div className="mt-4 flex items-center justify-end gap-4">
              <Button 
                type="submit" 
                disabled={isCalendarLoading}
                className="w-full"
              >
                {isCalendarLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding to Calendar...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </FloatingPanel.Footer>
        </FloatingPanel.Form>
      </FloatingPanel.Content>
    </FloatingPanel.Root>
  )
} 