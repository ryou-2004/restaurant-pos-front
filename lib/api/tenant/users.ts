import type { paths } from '../../../types/api'
import { apiGet, apiPost, apiPatch, apiDelete } from '../client'

// ========================================
// 型定義
// ========================================
export type UsersResponse = paths['/api/tenant/users']['get']['responses']['200']['content']['application/json']

export type User = UsersResponse[number]

export type UserCreateRequest = NonNullable<paths['/api/tenant/users']['post']['requestBody']>['content']['application/json']['user']

export type UserCreateResponse = paths['/api/tenant/users']['post']['responses']['201']['content']['application/json']

export type UserUpdateRequest = NonNullable<paths['/api/tenant/users/{id}']['patch']['requestBody']>['content']['application/json']['user']

export type UserUpdateResponse = paths['/api/tenant/users/{id}']['patch']['responses']['200']['content']['application/json']

// ========================================
// API関数
// ========================================
const BASE_URL = 'http://localhost:3000/api/tenant/users'

export async function fetchUsers(): Promise<UsersResponse> {
  return apiGet<UsersResponse>(BASE_URL)
}

export async function fetchUser(id: number): Promise<User> {
  return apiGet<User>(`${BASE_URL}/${id}`)
}

export async function createUser(data: UserCreateRequest): Promise<UserCreateResponse> {
  return apiPost<UserCreateResponse>(BASE_URL, { user: data })
}

export async function updateUser(
  id: number,
  data: UserUpdateRequest
): Promise<UserUpdateResponse> {
  return apiPatch<UserUpdateResponse>(`${BASE_URL}/${id}`, { user: data })
}

export async function deleteUser(id: number): Promise<void> {
  return apiDelete(`${BASE_URL}/${id}`)
}
