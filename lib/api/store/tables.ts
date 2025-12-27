/**
 * Tables API クライアント（Store向け）
 *
 * 店舗POSアプリ向けテーブルAPI
 */

import { apiGet } from '../client'
import type { paths } from '../../../types/api'

// ========================================
// 型定義（OpenAPI仕様から自動生成）
// ========================================

/**
 * テーブル一覧レスポンス
 */
export type TablesResponse = paths['/api/store/tables']['get']['responses']['200']['content']['application/json']

/**
 * テーブル（単体）
 */
export type Table = TablesResponse[number]

// ========================================
// API関数
// ========================================

const BASE_URL = 'http://localhost:3000/api/store/tables'

/**
 * テーブル一覧取得
 *
 * @returns テーブル一覧
 */
export async function fetchTables(): Promise<TablesResponse> {
  return apiGet<TablesResponse>(BASE_URL)
}

/**
 * テーブル詳細取得
 *
 * @param id - テーブルID
 * @returns テーブル詳細
 */
export async function fetchTable(id: number): Promise<Table> {
  return apiGet<Table>(`${BASE_URL}/${id}`)
}
