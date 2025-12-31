/**
 * 店員呼び出しAPI（Store用）
 */

import { apiGet, apiPatch } from '../client'

const BASE_URL = 'http://localhost:3000/api/store/staff_calls'

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
  resolved_by_name?: string
}

/**
 * アクティブな呼び出し一覧を取得
 *
 * @returns 呼び出しの配列
 */
export async function fetchStaffCalls(): Promise<StaffCall[]> {
  return apiGet<StaffCall[]>(BASE_URL)
}

/**
 * 呼び出しを確認済みにする
 *
 * @param callId - 呼び出しID
 * @returns 更新された呼び出し
 */
export async function acknowledgeCall(callId: number): Promise<StaffCall> {
  return apiPatch<StaffCall>(`${BASE_URL}/${callId}/acknowledge`)
}

/**
 * 呼び出しを対応完了にする
 *
 * @param callId - 呼び出しID
 * @returns 更新された呼び出し
 */
export async function resolveCall(callId: number): Promise<StaffCall> {
  return apiPatch<StaffCall>(`${BASE_URL}/${callId}/resolve`)
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

/**
 * 呼び出しタイプのアイコン
 */
export const CALL_TYPE_ICONS: Record<CallType, string> = {
  general: '🔔',
  order_request: '🍽️',
  water_request: '💧',
  payment_request: '💳',
  assistance: '🙋'
}
