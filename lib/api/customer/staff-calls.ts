/**
 * 店員呼び出しAPI
 */

import { apiGet, apiPost } from '../client'

const BASE_URL = 'http://localhost:3000/api/customer/staff_calls'

/**
 * 呼び出しタイプ
 */
export type CallType = 'general' | 'order_request' | 'water_request' | 'payment_request' | 'assistance'

/**
 * 呼び出しステータス
 */
export type StaffCallStatus = 'pending' | 'acknowledged' | 'resolved'

/**
 * 店員呼び出し
 */
export interface StaffCall {
  id: number
  table_id: number
  table_number: string
  call_type: CallType
  status: StaffCallStatus
  notes?: string
  waiting_minutes: number
  created_at: string
  resolved_at?: string
}

/**
 * 呼び出し作成リクエスト
 */
export interface CreateStaffCallRequest {
  call_type?: CallType
  notes?: string
}

/**
 * 店員を呼び出す
 *
 * @param request - 呼び出しデータ
 * @returns 作成された呼び出し
 */
export async function callStaff(request?: CreateStaffCallRequest): Promise<StaffCall> {
  return apiPost<StaffCall>(BASE_URL, request)
}

/**
 * 自分のテーブルの呼び出し履歴を取得
 *
 * @returns 呼び出しの配列
 */
export async function fetchStaffCalls(): Promise<StaffCall[]> {
  return apiGet<StaffCall[]>(BASE_URL)
}

/**
 * 呼び出しタイプの表示名
 */
export const CALL_TYPE_LABELS: Record<CallType, string> = {
  general: 'スタッフ呼び出し',
  order_request: '注文をお願いします',
  water_request: 'お水をください',
  payment_request: 'お会計をお願いします',
  assistance: 'その他のご用件'
}
