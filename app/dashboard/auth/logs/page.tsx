import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AuthSidebarWrapper } from "@/app/components/auth-sidebar-wrapper"

const accessLogs = [
  {
    timestamp: "2024-03-10 14:30:00",
    action: "API Key Generated",
    service: "API Management",
    ip: "192.168.1.1",
    status: "Success",
  },
  {
    timestamp: "2024-03-10 13:15:00",
    action: "Integration Connected",
    service: "GitHub",
    ip: "192.168.1.1",
    status: "Success",
  },
  // Add more logs as needed
]

export default function LogsPage() {
  return (
    <AuthSidebarWrapper>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Access Logs</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accessLogs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{log.timestamp}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.service}</TableCell>
              <TableCell>{log.ip}</TableCell>
              <TableCell>{log.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </AuthSidebarWrapper>
  )
} 