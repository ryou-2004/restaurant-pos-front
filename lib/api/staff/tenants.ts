import type { paths } from '../../../types/api'
import { apiGet, apiPost, apiPatch } from '../client'

// ========================================
// 型定義
// ========================================
export type TenantsResponse = paths['/api/staff/tenants']['get']['responses']['200']['content']['application/json']

export type Tenant = TenantsResponse[number]

export type TenantCreateRequest = NonNullable<paths['/api/staff/tenants']['post']['requestBody']>['content']['application/json']['tenant']

export type TenantCreateResponse = paths['/api/staff/tenants']['post']['responses']['201']['content']['application/json']

export type TenantUpdateRequest = NonNullable<paths['/api/staff/tenants/{id}']['patch']['requestBody']>['content']['application/json']['tenant']

export type TenantUpdateResponse = paths['/api/staff/tenants/{id}']['patch']['responses']['200']['content']['application/json']

// ========================================
// API関数
// ========================================
const BASE_URL = 'http://localhost:3000/api/staff/tenants'

export async function fetchTenants(page?: number): Promise<TenantsResponse> {
  const url = page ? `${BASE_URL}?page=${page}` : BASE_URL
  return apiGet<TenantsResponse>(url)
}

export async function fetchTenant(id: number): Promise<Tenant> {
  return apiGet<Tenant>(`${BASE_URL}/${id}`)
}

export async function createTenant(data: TenantCreateRequest): Promise<TenantCreateResponse> {
  return apiPost<TenantCreateResponse>(BASE_URL, { tenant: data })
}

export async function updateTenant(
  id: number,
  data: TenantUpdateRequest
): Promise<TenantUpdateResponse> {
  return apiPatch<TenantUpdateResponse>(`${BASE_URL}/${id}`, { tenant: data })
}
