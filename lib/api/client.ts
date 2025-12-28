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
 * 現在のアプリケーション名を取得
 * URLのパスから判定 (例: /customer/... → 'customer')
 */
function getCurrentApp(): string {
  if (typeof window === 'undefined') return 'tenant' // SSR時のデフォルト

  // URLから現在のアプリを判定
  const pathSegments = window.location.pathname.split('/').filter(Boolean)
  const app = pathSegments[0]

  // 既知のアプリ名のみ許可
  if (['customer', 'tenant', 'store', 'staff'].includes(app)) {
    return app
  }

  // デフォルトはテナント
  return 'tenant'
}

/**
 * アプリ別のトークンキーを取得
 */
function getTokenKey(app?: string): string {
  const currentApp = app || getCurrentApp()
  return `${currentApp}_token`
}

/**
 * アプリ別のユーザーキーを取得
 */
function getUserKey(app?: string): string {
  const currentApp = app || getCurrentApp()
  return `${currentApp}_user`
}

/**
 * アプリ別のログインページを取得
 */
function getLoginPath(app?: string): string {
  const currentApp = app || getCurrentApp()

  switch (currentApp) {
    case 'customer':
      return '/customer/scan'
    case 'tenant':
      return '/tenant/login'
    case 'store':
      return '/store/login'
    case 'staff':
      return '/staff/login'
    default:
      return '/login'
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
  // 認証トークンを自動取得（アプリ別）
  const token = localStorage.getItem(getTokenKey())

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
      const app = getCurrentApp()
      localStorage.removeItem(getTokenKey(app))
      localStorage.removeItem(getUserKey(app))
      window.location.href = getLoginPath(app)
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
