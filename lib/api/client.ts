/**
 * 共通APIクライアント
 *
 * 全てのAPI呼び出しで使用する共通機能を提供:
 * - 認証トークンの自動付与
 * - エラーハンドリングの統一
 * - 401エラー時の自動ログインリダイレクト
 * - 503エラー時のメンテナンス表示
 */

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`)
    this.name = 'ApiError'
  }
}

/**
 * 共通リクエスト関数
 *
 * @param url - リクエストURL
 * @param options - fetchのオプション
 * @returns レスポンスのJSON
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // 認証トークンを自動取得
  const token = localStorage.getItem('tenant_token')

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  })

  // エラーハンドリング
  if (!response.ok) {
    // 401: 認証エラー → 自動でログインページへ
    if (response.status === 401) {
      localStorage.removeItem('tenant_token')
      localStorage.removeItem('tenant_user')
      window.location.href = '/login'
      throw new ApiError(401, 'Unauthorized')
    }

    // 503: メンテナンス中 → メンテナンスページへ（TODO: 実装）
    if (response.status === 503) {
      // TODO: メンテナンスページへのリダイレクト
      // window.location.href = '/maintenance'
      throw new ApiError(503, 'Service Unavailable')
    }

    // その他のエラー
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(response.status, response.statusText, errorData)
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

/**
 * GETリクエスト
 *
 * @param url - リクエストURL
 * @returns レスポンスのJSON
 */
export async function apiGet<T>(url: string): Promise<T> {
  return apiRequest<T>(url, { method: 'GET' })
}

/**
 * POSTリクエスト
 *
 * @param url - リクエストURL
 * @param data - リクエストボディ
 * @returns レスポンスのJSON
 */
export async function apiPost<T>(url: string, data?: any): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PATCHリクエスト
 *
 * @param url - リクエストURL
 * @param data - リクエストボディ
 * @returns レスポンスのJSON
 */
export async function apiPatch<T>(url: string, data?: any): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETEリクエスト
 *
 * @param url - リクエストURL
 * @returns レスポンスのJSON (通常は204 No Content)
 */
export async function apiDelete<T = void>(url: string): Promise<T> {
  return apiRequest<T>(url, { method: 'DELETE' })
}
