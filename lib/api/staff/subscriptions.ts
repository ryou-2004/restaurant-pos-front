import type { paths } from '../../../types/api'
import { apiGet, apiPatch } from '../client'

// ========================================
// 型定義
// ========================================
export type SubscriptionsResponse = paths['/api/staff/subscriptions']['get']['responses']['200']['content']['application/json']

export type Subscription = SubscriptionsResponse[number]

export type SubscriptionUpdateRequest = NonNullable<paths['/api/staff/subscriptions/{id}']['patch']['requestBody']>['content']['application/json']['subscription']

export type SubscriptionUpdateResponse = paths['/api/staff/subscriptions/{id}']['patch']['responses']['200']['content']['application/json']

export type SubscriptionPlan = 'basic' | 'standard' | 'enterprise'

// ========================================
// API関数
// ========================================
const BASE_URL = 'http://localhost:3000/api/staff/subscriptions'

export async function fetchSubscriptions(page?: number): Promise<SubscriptionsResponse> {
  const url = page ? `${BASE_URL}?page=${page}` : BASE_URL
  return apiGet<SubscriptionsResponse>(url)
}

export async function fetchSubscription(id: number): Promise<Subscription> {
  return apiGet<Subscription>(`${BASE_URL}/${id}`)
}

export async function updateSubscription(
  id: number,
  data: SubscriptionUpdateRequest
): Promise<SubscriptionUpdateResponse> {
  return apiPatch<SubscriptionUpdateResponse>(`${BASE_URL}/${id}`, { subscription: data })
}
