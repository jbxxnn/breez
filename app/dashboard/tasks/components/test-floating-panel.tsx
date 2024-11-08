"use client"

import FloatingPanel from "@/components/ui/floating-panel"
import { Plus } from "lucide-react"

export function TestFloatingPanel() {
  return (
    <FloatingPanel.Root>
      <FloatingPanel.Trigger title="Add Task" className="gap-2">
        <Plus className="h-4 w-4" />
        Add Task
      </FloatingPanel.Trigger>
      <FloatingPanel.Content className="w-[400px]">
        <FloatingPanel.Form>
          <FloatingPanel.Header>
            <div className="flex items-center gap-2">
              <FloatingPanel.CloseButton />
              Create New Task
            </div>
          </FloatingPanel.Header>
          <FloatingPanel.Body>
            <div className="space-y-4">
              <div>
                <FloatingPanel.Label htmlFor="note">Task Title</FloatingPanel.Label>
                <FloatingPanel.Textarea 
                  id="note"
                  className="min-h-[100px] border rounded-md"
                />
              </div>
            </div>
          </FloatingPanel.Body>
          <FloatingPanel.Footer className="border-t">
            <FloatingPanel.SubmitButton>Create Task</FloatingPanel.SubmitButton>
          </FloatingPanel.Footer>
        </FloatingPanel.Form>
      </FloatingPanel.Content>
    </FloatingPanel.Root>
  )
} 