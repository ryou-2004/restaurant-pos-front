/**
 * アクティビティログのアクションタイプ
 */
export type ActivityLogActionType =
  // 認証系
  | 'login'
  | 'logout'
  | 'login_failed'
  // CRUD系
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  // ビジネスイベント
  | 'order_placed'
  | 'order_cooking_started'
  | 'order_ready'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_completed'
  | 'payment_failed'
  | 'table_session_started'
  | 'table_session_ended'
  // 閲覧系
  | 'menu_viewed'
  | 'page_accessed'

/**
 * アクティビティログ（一覧表示用）
 */
export interface ActivityLog {
  id: number
  user_type: string
  user_id: number
  user_name: string
  tenant_id: number | null
  store_id: number | null
  action_type: ActivityLogActionType
  resource_type: string | null
  resource_id: number | null
  resource_name: string | null
  ip_address: string
  created_at: string
}

/**
 * アクティビティログ詳細（metadataを含む）
 */
export interface ActivityLogDetail extends ActivityLog {
  metadata: Record<string, any>
  user_agent: string
  updated_at: string
}

/**
 * アクティビティログフィルター
 */
export interface ActivityLogFilters {
  tenant_id?: number
  store_id?: number
  action_type?: ActivityLogActionType
  user_type?: string
  user_id?: number
  start_date?: string
  end_date?: string
  page?: number
}

/**
 * アクティビティログ統計
 */
export interface ActivityLogStats {
  total_count: number
  today_count: number
  this_week_count: number
  this_month_count: number
  by_action_type: Record<string, number>
}
