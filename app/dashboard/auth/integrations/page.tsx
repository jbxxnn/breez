import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AuthSidebarWrapper } from "@/app/components/auth-sidebar-wrapper"

const availableIntegrations = [
  {
    name: "Jira",
    description: "Connect with Jira for issue tracking and project management",
    category: "Project Management",
  },
  {
    name: "Google Workspace",
    description: "Access Google Drive, Calendar, and other Google services",
    category: "Productivity",
  },
  // Add more integrations as needed
]

export default function IntegrationsPage() {
    
  return (
    <AuthSidebarWrapper>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Available Integrations</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableIntegrations.map((integration) => (
            <Card key={integration.name}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {integration.name}
                </CardTitle>
                <CardDescription>{integration.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {integration.description}
                </p>
                <Button variant="outline" className="w-full">
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AuthSidebarWrapper>
  )
} 