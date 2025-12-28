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
 * ポート番号から判定（各アプリは独立したポートで動作）
 */
function getCurrentApp(): string {
  if (typeof window === 'undefined') return 'tenant' // SSR時のデフォルト

  // ポート番号でアプリを判定
  const port = window.location.port
  switch (port) {
    case '3001':
      return 'staff'
    case '3002':
      return 'tenant'
    case '3003':
      return 'store'
    case '3004':
      return 'customer'
    default:
      // ポートが指定されていない場合はパスで判定（後方互換性）
      const pathSegments = window.location.pathname.split('/').filter(Boolean)
      const app = pathSegments[0]
      if (['customer', 'tenant', 'store', 'staff'].includes(app)) {
        return app
      }
      return 'tenant'
  }
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
      return '/scan'
    case 'tenant':
      return '/login'
    case 'store':
      return '/login'
    case 'staff':
      return '/login'
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
