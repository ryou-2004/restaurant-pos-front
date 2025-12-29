/**
 * 店舗向けTableSession API
 */

import { apiPost, apiPatch } from '../client'

const BASE_URL = 'http://localhost:3000/api/store/table_sessions'

/**
 * TableSession作成リクエスト
 */
export interface CreateTableSessionRequest {
  table_id: number
  party_size?: number
}

/**
 * TableSessionレスポンス
 */
export interface TableSession {
  id: number
  table_id: number
  table_number: string
  party_size?: number
  status: 'active' | 'completed'
  started_at: string
  ended_at?: string
  duration_minutes?: number
}

/**
 * TableSession作成
 *
 * @param data - テーブルIDと人数
 * @returns 作成されたセッション情報
 */
export async function createTableSession(
  data: CreateTableSessionRequest
): Promise<TableSession> {
  return apiPost<TableSession>(BASE_URL, data)
}

/**
 * TableSession終了
 *
 * @param id - セッションID
 * @returns 終了したセッション情報
 */
export async function completeTableSession(id: number): Promise<TableSession> {
  return apiPatch<TableSession>(`${BASE_URL}/${id}/complete`)
}
