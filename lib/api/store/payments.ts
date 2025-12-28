/**
 * Payments API クライアント（Store向け）
 *
 * 店舗POSアプリ向け会計API
 */

import { apiGet, apiPost } from '../client'
import type { paths } from '../../../types/api'

// ========================================
// 型定義（OpenAPI仕様から自動生成）
// ========================================

/**
 * 会計履歴一覧レスポンス
 */
export type PaymentsResponse = paths['/api/store/payments']['get']['responses']['200']['content']['application/json']

/**
 * 会計履歴（単体）
 */
export type Payment = PaymentsResponse[number]

/**
 * 会計作成リクエスト
 */
export type PaymentCreateRequest = NonNullable<NonNullable<paths['/api/store/payments']['post']['requestBody']>['content']>['application/json']

/**
 * 会計作成レスポンス
 */
export type PaymentCreateResponse = NonNullable<NonNullable<paths['/api/store/payments']['post']['responses']['201']>['content']>['application/json']

// ========================================
// API関数
// ========================================

const BASE_URL = 'http://localhost:3000/api/store/payments'

/**
 * 会計履歴一覧取得
 *
 * @returns 会計履歴一覧
 */
export async function fetchPayments(): Promise<PaymentsResponse> {
  return apiGet<PaymentsResponse>(BASE_URL)
}

/**
 * 会計詳細取得
 *
 * @param id - 会計ID
 * @returns 会計詳細
 */
export async function fetchPayment(id: number): Promise<Payment> {
  return apiGet<Payment>(`${BASE_URL}/${id}`)
}

/**
 * 会計作成（注文の支払い処理）
 *
 * @param data - 会計データ
 * @returns 作成された会計履歴
 */
export async function createPayment(data: PaymentCreateRequest): Promise<PaymentCreateResponse> {
  return apiPost<PaymentCreateResponse>(BASE_URL, data)
}
