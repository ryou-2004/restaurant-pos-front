export interface MenuItem {
  id: number
  name: string
  category: string
  price: number
  description: string
  available: boolean
  created_at: string
  updated_at: string
}

export interface TenantUser {
  id: number
  name: string
  email: string
  role: string
  user_type: 'tenant'
  tenant: {
    id: number
    name: string
    subdomain: string
  }
}

export interface LoginResponse {
  token: string
  user: TenantUser
}

export interface MenuItemInput {
  name: string
  category: string
  price: number
  description: string
  available: boolean
}
