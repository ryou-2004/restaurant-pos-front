/**
 * Stores API クライアント
 *
 * テナント管理者向けの店舗管理API
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '../client'

// ========================================
// 型定義
// ========================================
// 注意: 実際のプロジェクトでは、これらの型は types/api.ts から自動生成されます
// 以下は実装例として手動で定義していますが、本来は以下のように使用します:
// import type { paths } from '@/types/api'
// type StoresResponse = paths['/api/tenant/stores']['get']['responses']['200']['content']['application/json']

/**
 * 店舗
 */
export interface Store {
  id: number
  name: string
  address: string | null
  phone: string | null
  active: boolean
  created_at: string
  updated_at: string
}

/**
 * 店舗作成リクエスト
 */
export interface StoreCreateRequest {
  name: string
  address?: string
  phone?: string
  active?: boolean
}

/**
 * 店舗更新リクエスト
 */
export interface StoreUpdateRequest {
  name?: string
  address?: string
  phone?: string
  active?: boolean
}

/**
 * 店舗一覧レスポンス
 */
export type StoresResponse = Store[]

/**
 * 店舗作成レスポンス
 */
export type StoreCreateResponse = Store

/**
 * 店舗更新レスポンス
 */
export type StoreUpdateResponse = Store

// ========================================
// API関数
// ========================================

const BASE_URL = 'http://localhost:3000/api/tenant/stores'

/**
 * 店舗一覧取得
 *
 * @returns 店舗一覧
 */
export async function fetchStores(): Promise<StoresResponse> {
  return apiGet<StoresResponse>(BASE_URL)
}

/**
 * 店舗詳細取得
 *
 * @param id - 店舗ID
 * @returns 店舗詳細
 */
export async function fetchStore(id: number): Promise<Store> {
  return apiGet<Store>(`${BASE_URL}/${id}`)
}

/**
 * 店舗作成
 *
 * @param data - 店舗作成データ
 * @returns 作成された店舗
 */
export async function createStore(
  data: StoreCreateRequest
): Promise<StoreCreateResponse> {
  return apiPost<StoreCreateResponse>(BASE_URL, { store: data })
}

/**
 * 店舗更新
 *
 * @param id - 店舗ID
 * @param data - 店舗更新データ
 * @returns 更新された店舗
 */
export async function updateStore(
  id: number,
  data: StoreUpdateRequest
): Promise<StoreUpdateResponse> {
  return apiPatch<StoreUpdateResponse>(`${BASE_URL}/${id}`, { store: data })
}

/**
 * 店舗削除
 *
 * @param id - 店舗ID
 */
export async function deleteStore(id: number): Promise<void> {
  return apiDelete(`${BASE_URL}/${id}`)
}
