"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface IntegrationCardProps {
  name: string
  description: string
  category: string
  provider: string
  isConnected: boolean
}

export function IntegrationCard({ 
  name, 
  description, 
  category, 
  provider, 
  isConnected 
}: IntegrationCardProps) {
  const handleConnect = () => {
    window.location.href = `/api/auth/${provider}/authorize`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {name}
        </CardTitle>
        <CardDescription>{category}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        <Button 
          variant={isConnected ? "secondary" : "outline"} 
          className="w-full"
          onClick={handleConnect}
        >
          {isConnected ? "Reconnect" : "Connect"}
        </Button>
      </CardContent>
    </Card>
  )
} 