export interface Integration {
  id: string
  user_id: string
  provider: string
  access_token: string
  refresh_token?: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface AvailableIntegration {
  name: string
  description: string
  category: string
  provider: string
} 