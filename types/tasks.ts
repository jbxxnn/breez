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