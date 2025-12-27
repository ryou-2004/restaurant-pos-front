/**
 * Tables API クライアント
 *
 * テナント向けテーブル管理API
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '../client'
import type { paths } from '../../../types/api'

// ========================================
// 型定義（OpenAPI仕様から自動生成）
// ========================================

/**
 * テーブル一覧レスポンス
 */
export type TablesResponse = paths['/api/tenant/tables']['get']['responses']['200']['content']['application/json']

/**
 * テーブル（単体）
 */
export type Table = TablesResponse[number]

/**
 * テーブル作成リクエスト
 */
export type TableCreateRequest = NonNullable<paths['/api/tenant/tables']['post']['requestBody']>['content']['application/json']['table']

/**
 * テーブル作成レスポンス
 */
export type TableCreateResponse = paths['/api/tenant/tables']['post']['responses']['201']['content']['application/json']

/**
 * テーブル更新リクエスト
 */
export type TableUpdateRequest = NonNullable<paths['/api/tenant/tables/{id}']['patch']['requestBody']>['content']['application/json']['table']

/**
 * テーブル更新レスポンス
 */
export type TableUpdateResponse = paths['/api/tenant/tables/{id}']['patch']['responses']['200']['content']['application/json']

// ========================================
// API関数
// ========================================

const BASE_URL = 'http://localhost:3000/api/tenant/tables'

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

/**
 * テーブル作成
 *
 * @param data - テーブル作成データ
 * @returns 作成されたテーブル
 */
export async function createTable(
  data: TableCreateRequest
): Promise<TableCreateResponse> {
  return apiPost<TableCreateResponse>(BASE_URL, { table: data })
}

/**
 * テーブル更新
 *
 * @param id - テーブルID
 * @param data - テーブル更新データ
 * @returns 更新されたテーブル
 */
export async function updateTable(
  id: number,
  data: TableUpdateRequest
): Promise<TableUpdateResponse> {
  return apiPatch<TableUpdateResponse>(`${BASE_URL}/${id}`, { table: data })
}

/**
 * テーブル削除
 *
 * @param id - テーブルID
 */
export async function deleteTable(id: number): Promise<void> {
  return apiDelete(`${BASE_URL}/${id}`)
}
