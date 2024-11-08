import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { AuthSidebarWrapper } from "@/app/components/auth-sidebar-wrapper"

const connectedApps = [
  {
    name: "GitHub",
    description: "Access to repositories and issues",
    connected: true,
    lastUsed: "2 days ago",
  },
  {
    name: "Slack",
    description: "Send notifications and updates",
    connected: true,
    lastUsed: "1 hour ago",
  },
  // Add more connected apps as needed
]

export default function ConnectedAppsPage() {
  return (
    <AuthSidebarWrapper>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Connected Applications</h3>
        <Button variant="outline">Refresh Connections</Button>
      </div>
      <div className="grid gap-4">
        {connectedApps.map((app) => (
          <Card key={app.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">{app.name}</CardTitle>
              <Switch defaultChecked={app.connected} />
            </CardHeader>
            <CardContent>
              <CardDescription>{app.description}</CardDescription>
              <p className="text-sm text-muted-foreground mt-2">
                Last used: {app.lastUsed}
              </p>
            </CardContent>
          </Card>
          ))}
        </div>
      </div>
    </AuthSidebarWrapper>
  )
} 