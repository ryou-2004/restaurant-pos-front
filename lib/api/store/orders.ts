import type { paths } from '../../../types/api'
import { apiGet, apiPost, apiPatch } from '../client'

// ========================================
// 型定義
// ========================================
export type OrdersResponse = paths['/api/store/orders']['get']['responses']['200']['content']['application/json']

export type Order = OrdersResponse[number]

export type OrderCreateRequest = NonNullable<paths['/api/store/orders']['post']['requestBody']>['content']['application/json']['order']

export type OrderCreateResponse = paths['/api/store/orders']['post']['responses']['201']['content']['application/json']

export type OrderUpdateRequest = NonNullable<paths['/api/store/orders/{id}']['patch']['requestBody']>['content']['application/json']['order']

export type OrderUpdateResponse = paths['/api/store/orders/{id}']['patch']['responses']['200']['content']['application/json']

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'delivered' | 'paid'

// ========================================
// API関数
// ========================================
const BASE_URL = 'http://localhost:3000/api/store/orders'

export async function fetchOrders(status?: OrderStatus): Promise<OrdersResponse> {
  const url = status ? `${BASE_URL}?status=${status}` : BASE_URL
  return apiGet<OrdersResponse>(url)
}

export async function fetchOrder(id: number): Promise<Order> {
  return apiGet<Order>(`${BASE_URL}/${id}`)
}

export async function createOrder(data: OrderCreateRequest): Promise<OrderCreateResponse> {
  return apiPost<OrderCreateResponse>(BASE_URL, { order: data })
}

export async function updateOrder(
  id: number,
  data: OrderUpdateRequest
): Promise<OrderUpdateResponse> {
  return apiPatch<OrderUpdateResponse>(`${BASE_URL}/${id}`, { order: data })
}

export async function startCooking(id: number): Promise<OrderUpdateResponse> {
  return apiPatch<OrderUpdateResponse>(`${BASE_URL}/${id}/start_cooking`)
}

export async function markAsReady(id: number): Promise<OrderUpdateResponse> {
  return apiPatch<OrderUpdateResponse>(`${BASE_URL}/${id}/mark_as_ready`)
}

export async function deliverOrder(id: number): Promise<OrderUpdateResponse> {
  return apiPatch<OrderUpdateResponse>(`${BASE_URL}/${id}/deliver`)
}
