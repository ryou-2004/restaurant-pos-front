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
 *
 * 優先順位:
 * 1. 環境変数 NEXT_PUBLIC_APP_NAME（ビルド時に決定）
 * 2. サブドメイン（本番環境: customer.example.com）
 * 3. ポート番号（開発環境: localhost:3004）
 * 4. デフォルト: 'tenant'
 */
function getCurrentApp(): string {
  // 1. 環境変数で明示的に指定（最優先）
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_NAME) {
    return process.env.NEXT_PUBLIC_APP_NAME
  }

  if (typeof window === 'undefined') return 'tenant' // SSR時のデフォルト

  // 2. サブドメインから判定（本番環境）
  const hostname = window.location.hostname
  const subdomain = hostname.split('.')[0]
  if (['customer', 'tenant', 'store', 'staff'].includes(subdomain)) {
    return subdomain
  }

  // 3. ポート番号で判定（開発環境）
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
  }

  // 4. デフォルト
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
 * リトライ設定
 */
interface RetryOptions {
  maxRetries: number
  retryDelay: number
  retryableStatuses: number[]
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000, // 1秒
  retryableStatuses: [500, 502, 503, 504], // サーバーエラーのみリトライ
}

/**
 * 遅延処理
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 共通リクエスト関数（リトライ機能付き）
 *
 * @param url - リクエストURL
 * @param options - fetchのオプション
 * @param retryOptions - リトライ設定
 * @returns レスポンスのJSON
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
    try {
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
        // 401: 認証エラー → 自動でログインページへ（リトライしない）
        if (response.status === 401) {
          const app = getCurrentApp()
          localStorage.removeItem(getTokenKey(app))
          localStorage.removeItem(getUserKey(app))
          window.location.href = getLoginPath(app)
          throw new ApiError(401, 'Unauthorized')
        }

        // リトライ可能なステータスコードかチェック
        if (retryOptions.retryableStatuses.includes(response.status)) {
          const errorData = await response.json().catch(() => ({}))
          lastError = new ApiError(response.status, response.statusText, errorData)

          // 最後の試行でなければリトライ
          if (attempt < retryOptions.maxRetries) {
            console.log(`API リトライ ${attempt + 1}/${retryOptions.maxRetries}: ${url}`)
            await delay(retryOptions.retryDelay * (attempt + 1)) // 指数バックオフ
            continue
          }

          throw lastError
        }

        // リトライ不可のエラー（400番台など）
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(response.status, response.statusText, errorData)
      }

      // 204 No Content
      if (response.status === 204) {
        return undefined as T
      }

      return response.json()
    } catch (error) {
      // ネットワークエラー（接続失敗など）
      if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = new Error('ネットワークに接続できません')

        // 最後の試行でなければリトライ
        if (attempt < retryOptions.maxRetries) {
          console.log(`ネットワークエラー - リトライ ${attempt + 1}/${retryOptions.maxRetries}`)
          await delay(retryOptions.retryDelay * (attempt + 1))
          continue
        }
      }

      // その他のエラーはそのままスロー
      throw error
    }
  }

  // 全てのリトライが失敗
  throw lastError || new Error('リクエストに失敗しました')
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
