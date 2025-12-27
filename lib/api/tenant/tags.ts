/**
 * Tags API クライアント
 *
 * テナント向けタグ管理API
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '../client'
import type { paths } from '../../../types/api'

// ========================================
// 型定義（OpenAPI仕様から自動生成）
// ========================================

/**
 * タグ一覧レスポンス
 */
export type TagsResponse = paths['/api/tenant/tags']['get']['responses']['200']['content']['application/json']

/**
 * タグ（単体）
 */
export type Tag = TagsResponse[number]

/**
 * タグ作成リクエスト
 */
export type TagCreateRequest = NonNullable<paths['/api/tenant/tags']['post']['requestBody']>['content']['application/json']['tag']

/**
 * タグ作成レスポンス
 */
export type TagCreateResponse = paths['/api/tenant/tags']['post']['responses']['201']['content']['application/json']

/**
 * タグ更新リクエスト
 */
export type TagUpdateRequest = NonNullable<paths['/api/tenant/tags/{id}']['patch']['requestBody']>['content']['application/json']['tag']

/**
 * タグ更新レスポンス
 */
export type TagUpdateResponse = paths['/api/tenant/tags/{id}']['patch']['responses']['200']['content']['application/json']

// ========================================
// API関数
// ========================================

const BASE_URL = 'http://localhost:3000/api/tenant/tags'

/**
 * タグ一覧取得
 *
 * @returns タグ一覧
 */
export async function fetchTags(): Promise<TagsResponse> {
  return apiGet<TagsResponse>(BASE_URL)
}

/**
 * タグ詳細取得
 *
 * @param id - タグID
 * @returns タグ詳細
 */
export async function fetchTag(id: number): Promise<Tag> {
  return apiGet<Tag>(`${BASE_URL}/${id}`)
}

/**
 * タグ作成
 *
 * @param data - タグ作成データ
 * @returns 作成されたタグ
 */
export async function createTag(
  data: TagCreateRequest
): Promise<TagCreateResponse> {
  return apiPost<TagCreateResponse>(BASE_URL, { tag: data })
}

/**
 * タグ更新
 *
 * @param id - タグID
 * @param data - タグ更新データ
 * @returns 更新されたタグ
 */
export async function updateTag(
  id: number,
  data: TagUpdateRequest
): Promise<TagUpdateResponse> {
  return apiPatch<TagUpdateResponse>(`${BASE_URL}/${id}`, { tag: data })
}

/**
 * タグ削除
 *
 * @param id - タグID
 */
export async function deleteTag(id: number): Promise<void> {
  return apiDelete(`${BASE_URL}/${id}`)
}
