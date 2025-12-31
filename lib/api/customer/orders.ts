/**
 * 顧客注文API
 */

import { apiGet, apiPost } from '../client'

const BASE_URL = 'http://localhost:3000/api/customer/orders'

/**
 * 注文ステータス
 */
export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'delivered' | 'paid'

/**
 * 注文明細
 */
export interface OrderItem {
  id: number
  menu_item_id: number
  menu_item_name: string
  quantity: number
  unit_price: number
  subtotal: number
  notes?: string
}

/**
 * 注文
 */
export interface Order {
  id: number
  order_number: string
  status: OrderStatus
  table_id: number
  total_amount: number
  notes?: string
  cancelled: boolean
  cancelled_at?: string
  cancellation_reason?: string
  can_cancel: boolean
  order_items: OrderItem[]
  created_at: string
  updated_at: string
}

/**
 * 注文作成リクエスト
 */
export interface CreateOrderRequest {
  notes?: string
  order_items_attributes: Array<{
    menu_item_id: number
    quantity: number
    notes?: string
  }>
}

/**
 * 自分のテーブルの注文一覧を取得
 *
 * @returns 注文の配列（未払いのみ）
 */
export async function fetchOrders(): Promise<Order[]> {
  return apiGet<Order[]>(BASE_URL)
}

/**
 * 注文を作成
 *
 * @param request - 注文データ
 * @returns 作成された注文
 */
export async function createOrder(request: CreateOrderRequest): Promise<Order> {
  return apiPost<Order>(BASE_URL, { order: request })
}

/**
 * 注文をキャンセル（調理前のみ）
 *
 * @param orderId - 注文ID
 * @param cancellationReason - キャンセル理由
 * @returns キャンセルされた注文
 */
export async function cancelOrder(orderId: number, cancellationReason?: string): Promise<Order> {
  return apiPost<Order>(`${BASE_URL}/${orderId}/cancel`, { cancellation_reason: cancellationReason })
}
