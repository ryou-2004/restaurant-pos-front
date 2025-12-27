import type { paths } from '../../../types/api'
import { apiGet, apiPost, apiPatch, apiDelete } from '../client'

// ========================================
// 型定義
// ========================================
export type MenuItemsResponse = paths['/api/tenant/menu_items']['get']['responses']['200']['content']['application/json']

export type MenuItem = MenuItemsResponse[number]

export type MenuItemCreateRequest = NonNullable<paths['/api/tenant/menu_items']['post']['requestBody']>['content']['application/json']['menu_item']

export type MenuItemCreateResponse = paths['/api/tenant/menu_items']['post']['responses']['201']['content']['application/json']

export type MenuItemUpdateRequest = NonNullable<paths['/api/tenant/menu_items/{id}']['patch']['requestBody']>['content']['application/json']['menu_item']

export type MenuItemUpdateResponse = paths['/api/tenant/menu_items/{id}']['patch']['responses']['200']['content']['application/json']

// ========================================
// API関数
// ========================================
const BASE_URL = 'http://localhost:3000/api/tenant/menu_items'

export async function fetchMenuItems(page?: number): Promise<MenuItemsResponse> {
  const url = page ? `${BASE_URL}?page=${page}` : BASE_URL
  return apiGet<MenuItemsResponse>(url)
}

export async function fetchMenuItem(id: number): Promise<MenuItem> {
  return apiGet<MenuItem>(`${BASE_URL}/${id}`)
}

export async function createMenuItem(data: MenuItemCreateRequest): Promise<MenuItemCreateResponse> {
  return apiPost<MenuItemCreateResponse>(BASE_URL, { menu_item: data })
}

export async function updateMenuItem(
  id: number,
  data: MenuItemUpdateRequest
): Promise<MenuItemUpdateResponse> {
  return apiPatch<MenuItemUpdateResponse>(`${BASE_URL}/${id}`, { menu_item: data })
}

export async function deleteMenuItem(id: number): Promise<void> {
  return apiDelete(`${BASE_URL}/${id}`)
}
