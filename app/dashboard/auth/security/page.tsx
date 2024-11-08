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

export default function SecurityPage() {
  return (
    <AuthSidebarWrapper>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Security Settings</h3>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Protect your account with 2FA
            </div>
            <Switch />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>API Access Control</CardTitle>
            <CardDescription>
              Manage IP restrictions and rate limiting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Configure Access Rules</Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </AuthSidebarWrapper>
  )
} 