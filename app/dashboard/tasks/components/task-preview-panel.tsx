"use client"

import { Task } from "../columns"
import FloatingPanel from "@/components/ui/floating-panel"
import { format } from "date-fns"
import { CircleCheck, CircleHelp, CircleX, Timer } from "lucide-react"

interface TaskPreviewPanelProps {
  task: Task
}

export function TaskPreviewPanel({ task }: TaskPreviewPanelProps) {
  const StatusIcon = 
    task.status === "todo" ? CircleHelp :
    task.status === "in_progress" ? Timer :
    task.status === "done" ? CircleCheck :
    task.status === "canceled" ? CircleX :
    CircleHelp;

  return (
    <FloatingPanel.Content className="w-[400px]">
      <FloatingPanel.Header>
        Task Details
      </FloatingPanel.Header>
      <FloatingPanel.Body>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Title</h3>
            <p className="mt-1">{task.title}</p>
          </div>
          
          {task.description && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p className="mt-1 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          
          <div className="flex gap-8">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
              <div className="mt-1 flex items-center gap-2">
                <StatusIcon className="h-4 w-4" />
                <span className="capitalize">{task.status.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Priority</h3>
              <p className="mt-1 capitalize">{task.priority}</p>
            </div>
          </div>
          
          {task.due_date && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Due Date</h3>
              <p className="mt-1">
                {format(new Date(task.due_date), "PPP")}
                {task.start_time && task.end_time && (
                  <span className="text-muted-foreground">
                    {" "}at {task.start_time} - {task.end_time}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </FloatingPanel.Body>
      <FloatingPanel.Footer>
        <FloatingPanel.CloseButton />
      </FloatingPanel.Footer>
    </FloatingPanel.Content>
  )
} 