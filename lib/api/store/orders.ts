/**
 * Orders API クライアント（Store向け）
 *
 * 店舗POSアプリ向け注文API
 */

import { apiGet, apiPost, apiPatch } from '../client'
import type { paths } from '../../../types/api'

// ========================================
// 型定義（OpenAPI仕様から自動生成）
// ========================================

/**
 * 注文一覧レスポンス
 */
export type OrdersResponse = paths['/api/store/orders']['get']['responses']['200']['content']['application/json']

/**
 * 注文（単体）
 */
export type Order = OrdersResponse[number]

/**
 * 注文作成リクエスト
 */
export type OrderCreateRequest = NonNullable<NonNullable<paths['/api/store/orders']['post']['requestBody']>['content']>['application/json']

/**
 * 注文作成レスポンス
 */
export type OrderCreateResponse = NonNullable<NonNullable<paths['/api/store/orders']['post']['responses']['201']>['content']>['application/json']

/**
 * 注文更新リクエスト
 */
export type OrderUpdateRequest = NonNullable<NonNullable<paths['/api/store/orders/{id}']['patch']['requestBody']>['content']>['application/json']

/**
 * 注文更新レスポンス
 */
export type OrderUpdateResponse = NonNullable<NonNullable<paths['/api/store/orders/{id}']['patch']['responses']['200']>['content']>['application/json']

// ========================================
// API関数
// ========================================

const BASE_URL = 'http://localhost:3000/api/store/orders'

/**
 * 注文一覧取得
 *
 * @param status - 注文ステータスでフィルター（オプション）
 * @returns 注文一覧
 */
export async function fetchOrders(status?: string): Promise<OrdersResponse> {
  const url = status ? `${BASE_URL}?status=${status}` : BASE_URL
  return apiGet<OrdersResponse>(url)
}

/**
 * 注文詳細取得
 *
 * @param id - 注文ID
 * @returns 注文詳細
 */
export async function fetchOrder(id: number): Promise<Order> {
  return apiGet<Order>(`${BASE_URL}/${id}`)
}

/**
 * 注文作成
 *
 * @param data - 注文データ
 * @returns 作成された注文
 */
export async function createOrder(data: OrderCreateRequest): Promise<OrderCreateResponse> {
  return apiPost<OrderCreateResponse>(BASE_URL, data)
}

/**
 * 注文更新
 *
 * @param id - 注文ID
 * @param data - 更新データ
 * @returns 更新された注文
 */
export async function updateOrder(
  id: number,
  data: OrderUpdateRequest
): Promise<OrderUpdateResponse> {
  return apiPatch<OrderUpdateResponse>(`${BASE_URL}/${id}`, data)
}

/**
 * 注文配膳完了
 *
 * @param id - 注文ID
 * @returns 更新された注文
 */
export async function deliverOrder(id: number): Promise<OrderUpdateResponse> {
  return apiPatch<OrderUpdateResponse>(`${BASE_URL}/${id}/deliver`, {})
}
