export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'delivered' | 'paid'

export interface Order {
  id: number
  order_number: string
  status: OrderStatus
  table_id: number
  total_amount: number
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

export interface OrderItem {
  id: number
  menu_item_id: number
  menu_item_name: string
  quantity: number
  unit_price: number
  notes?: string
}

export interface MenuItem {
  id: number
  name: string
  category: string
  price: number
  description: string
}

export type KitchenQueueStatus = 'waiting' | 'cooking' | 'completed'

export interface KitchenQueue {
  id: number
  order_id: number
  order_number: string
  status: KitchenQueueStatus
  priority: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  order_items: OrderItem[]
}

export type PaymentStatus = 'pending' | 'paid' | 'failed'
export type PaymentMethod = 'cash' | 'credit_card' | 'qr_code'

export interface Payment {
  id: number
  order_id: number
  order_number: string
  amount: number
  payment_method: PaymentMethod
  status: PaymentStatus
  paid_at: string | null
  created_at: string
}

export interface StoreUser {
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
  user: StoreUser
}
