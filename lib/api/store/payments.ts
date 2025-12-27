import type { paths } from '../../../types/api'
import { apiGet, apiPost, apiPatch } from '../client'

// ========================================
// 型定義
// ========================================
export type PaymentsResponse = paths['/api/store/payments']['get']['responses']['200']['content']['application/json']

export type Payment = PaymentsResponse[number]

export type PaymentCreateRequest = NonNullable<paths['/api/store/payments']['post']['requestBody']>['content']['application/json']['payment']

export type PaymentCreateResponse = paths['/api/store/payments']['post']['responses']['201']['content']['application/json']

export type PaymentMethod = 'cash' | 'credit_card' | 'qr_code' | 'other'

export type PaymentStatus = 'pending' | 'completed' | 'failed'

// ========================================
// API関数
// ========================================
const BASE_URL = 'http://localhost:3000/api/store/payments'

export async function fetchPayments(): Promise<PaymentsResponse> {
  return apiGet<PaymentsResponse>(BASE_URL)
}

export async function fetchPayment(id: number): Promise<Payment> {
  return apiGet<Payment>(`${BASE_URL}/${id}`)
}

export async function createPayment(data: PaymentCreateRequest): Promise<PaymentCreateResponse> {
  return apiPost<PaymentCreateResponse>(BASE_URL, { payment: data })
}

export async function completePayment(id: number): Promise<Payment> {
  return apiPatch<Payment>(`${BASE_URL}/${id}/complete`)
}
