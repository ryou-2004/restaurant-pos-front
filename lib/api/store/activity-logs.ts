/**
 * Activity Logs API クライアント（Store用）
 *
 * 店舗管理者向けのアクティビティログ閲覧API
 * 自店舗のログのみアクセス可能
 */

import { apiGet } from '../client'
import type {
  ActivityLog,
  ActivityLogDetail,
  ActivityLogFilters
} from '../../../types/activity-log'

// ========================================
// API関数
// ========================================

const BASE_URL = 'http://localhost:3000/api/store/activity_logs'

/**
 * アクティビティログ一覧取得
 *
 * @param filters - フィルター条件
 * @returns アクティビティログ一覧
 */
export async function fetchActivityLogs(
  filters?: ActivityLogFilters
): Promise<ActivityLog[]> {
  const params = new URLSearchParams()

  if (filters) {
    if (filters.action_type) params.append('action_type', filters.action_type)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.page) params.append('page', filters.page.toString())
  }

  const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL
  return apiGet<ActivityLog[]>(url)
}

/**
 * アクティビティログ詳細取得
 *
 * @param id - アクティビティログID
 * @returns アクティビティログ詳細
 */
export async function fetchActivityLog(id: number): Promise<ActivityLogDetail> {
  return apiGet<ActivityLogDetail>(`${BASE_URL}/${id}`)
}
