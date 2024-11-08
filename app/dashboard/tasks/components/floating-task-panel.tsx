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

export function FloatingTaskPanel() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    status: "todo",
    priority: "low",
  })

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

              const { error } = await supabase.from("tasks").insert([
                {
                  ...formData,
                  user_id: user.id,
                },
              ])
              if (error) throw error

              toast({
                title: "Success",
                description: "Task created successfully",
              })
              router.refresh()
            } catch (error) {
              console.error("Error:", error)
              throw new Error(error instanceof Error ? error.message : "Something went wrong")
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
            </div>
          </FloatingPanel.Body>
          <FloatingPanel.Footer className="border-t">
            <FloatingPanel.SubmitButton>
              Create Task
            </FloatingPanel.SubmitButton>
          </FloatingPanel.Footer>
        </FloatingPanel.Form>
      </FloatingPanel.Content>
    </FloatingPanel.Root>
  )
} 