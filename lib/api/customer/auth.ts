/**
 * 顧客認証API
 */

import { apiPost } from '../client'

const BASE_URL = 'http://localhost:3000/api/customer/auth'

/**
 * QRコードログインレスポンス
 */
export interface QRLoginResponse {
  token: string
  session: {
    table_id: number
    table_number: string
    table_session_id: number
    store_id: number
    store_name: string
    tenant_id: number
    tenant_name: string
  }
}

/**
 * QRコードでログイン
 *
 * @param qrCode - テーブルのQRコード
 * @returns ログイン情報（JWT + セッション情報）
 */
export async function loginViaQR(qrCode: string): Promise<QRLoginResponse> {
  return apiPost<QRLoginResponse>(`${BASE_URL}/login_via_qr`, {
    qr_code: qrCode
  })
}

/**
 * ログアウト
 */
export async function logout(): Promise<{ message: string }> {
  return apiPost(`${BASE_URL}/logout`)
}
