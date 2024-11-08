import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { IntegrationCard } from './components/integration-card'
import { AuthSidebarWrapper } from "@/app/components/auth-sidebar-wrapper"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

const availableIntegrations = [
  {
    name: "Google Calendar",
    description: "Sync your calendar events and manage schedules",
    category: "Calendar",
    provider: "google_calendar",
  },
  // Add more integrations as needed
]

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: integrations } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user?.id)

  return (
    <AuthSidebarWrapper>
      <div className="grid gap-6">
        {searchParams.success && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Integration connected successfully!
            </AlertDescription>
          </Alert>
        )}

        {searchParams.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to connect integration. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Available Integrations</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableIntegrations.map((integration) => {
            const isConnected = integrations?.some(i => 
              i.provider === integration.provider
            )

            return (
              <IntegrationCard
                key={integration.name}
                {...integration}
                isConnected={!!isConnected}
              />
            )
          })}
        </div>
      </div>
    </AuthSidebarWrapper>
  )
} 