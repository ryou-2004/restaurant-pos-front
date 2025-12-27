/**
 * MenuItems API クライアント（Store向け）
 *
 * 店舗POSアプリ向けメニューAPI
 */

import { apiGet } from '../client'
import type { paths } from '../../../types/api'

// ========================================
// 型定義（OpenAPI仕様から自動生成）
// ========================================

/**
 * メニュー一覧レスポンス
 */
export type MenuItemsResponse = paths['/api/store/menu_items']['get']['responses']['200']['content']['application/json']

/**
 * メニュー項目（単体）
 */
export type MenuItem = MenuItemsResponse[number]

// ========================================
// API関数
// ========================================

const BASE_URL = 'http://localhost:3000/api/store/menu_items'

/**
 * メニュー一覧取得
 *
 * @returns メニュー一覧
 */
export async function fetchMenuItems(): Promise<MenuItemsResponse> {
  return apiGet<MenuItemsResponse>(BASE_URL)
}

/**
 * メニュー詳細取得
 *
 * @param id - メニューID
 * @returns メニュー詳細
 */
export async function fetchMenuItem(id: number): Promise<MenuItem> {
  return apiGet<MenuItem>(`${BASE_URL}/${id}`)
}
