import type { paths } from '../../../types/api'
import { apiGet, apiPost } from '../client'

// ========================================
// 型定義
// ========================================
export type LoginRequest = NonNullable<paths['/api/staff/auth/login']['post']['requestBody']>['content']['application/json']

export type LoginResponse = paths['/api/staff/auth/login']['post']['responses']['200']['content']['application/json']

export type MeResponse = paths['/api/staff/auth/me']['get']['responses']['200']['content']['application/json']

export type LogoutResponse = paths['/api/staff/auth/logout']['post']['responses']['200']['content']['application/json']

// ========================================
// API関数
// ========================================
const BASE_URL = 'http://localhost:3000/api/staff/auth'

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>(`${BASE_URL}/login`, { email, password })
}

export async function me(): Promise<MeResponse> {
  return apiGet<MeResponse>(`${BASE_URL}/me`)
}

export async function logout(): Promise<LogoutResponse> {
  return apiPost<LogoutResponse>(`${BASE_URL}/logout`)
}
