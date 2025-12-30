/**
 * 店舗API
 */

import { apiGet } from '../client'

const BASE_URL = 'http://localhost:3000/api/tenant/stores'

/**
 * 店舗情報
 */
export interface Store {
  id: number
  name: string
  address?: string
  phone?: string
  active: boolean
  created_at: string
  updated_at: string
}

/**
 * テナントの店舗一覧を取得
 *
 * @returns 店舗一覧
 */
export async function fetchStores(): Promise<Store[]> {
  return apiGet<Store[]>(BASE_URL)
}
