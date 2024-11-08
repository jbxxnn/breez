"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = () => {
    setIsLoading(true)
    try {
      window.location.href = `/api/auth/${provider}/authorize`
    } catch (error) {
      setIsLoading(false)
      console.error('Failed to redirect:', error)
    }
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
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            isConnected ? "Reconnect" : "Connect"
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 