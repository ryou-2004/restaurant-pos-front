/**
 * 顧客メニューAPI
 */

import { apiGet } from '../client'

const BASE_URL = 'http://localhost:3000/api/customer/menu_items'

/**
 * メニュー項目
 */
export interface MenuItem {
  id: number
  name: string
  price: number
  category: string
  category_order: number
  description?: string
  available: boolean
  image_url?: string        // 商品画像URL
  allergens?: string        // アレルゲン情報
  spice_level?: number      // 辛さレベル（0-5）
  created_at: string
  updated_at: string
}

/**
 * 利用可能なメニュー一覧を取得
 *
 * @returns メニュー項目の配列
 */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  return apiGet<MenuItem[]>(BASE_URL)
}
