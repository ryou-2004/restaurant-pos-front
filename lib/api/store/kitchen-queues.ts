import type { paths } from '../../../types/api'
import { apiGet, apiPatch } from '../client'

// ========================================
// 型定義
// ========================================
export type KitchenQueuesResponse = paths['/api/store/kitchen_queues']['get']['responses']['200']['content']['application/json']

export type KitchenQueue = KitchenQueuesResponse[number]

export type KitchenQueueUpdateRequest = NonNullable<paths['/api/store/kitchen_queues/{id}']['patch']['requestBody']>['content']['application/json']['kitchen_queue']

export type KitchenQueueStatus = 'waiting' | 'in_progress' | 'completed'

// ========================================
// API関数
// ========================================
const BASE_URL = 'http://localhost:3000/api/store/kitchen_queues'

export async function fetchKitchenQueues(): Promise<KitchenQueuesResponse> {
  return apiGet<KitchenQueuesResponse>(BASE_URL)
}

export async function fetchKitchenQueue(id: number): Promise<KitchenQueue> {
  return apiGet<KitchenQueue>(`${BASE_URL}/${id}`)
}

export async function updateKitchenQueue(
  id: number,
  data: KitchenQueueUpdateRequest
): Promise<any> {
  return apiPatch(`${BASE_URL}/${id}`, { kitchen_queue: data })
}

export async function startQueue(id: number): Promise<any> {
  return apiPatch(`${BASE_URL}/${id}/start`)
}

export async function completeQueue(id: number): Promise<any> {
  return apiPatch(`${BASE_URL}/${id}/complete`)
}
