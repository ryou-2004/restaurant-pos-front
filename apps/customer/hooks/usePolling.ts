/**
 * Pollingフック
 *
 * 一定間隔でデータを自動更新するカスタムフック
 * プラン別のリアルタイム更新戦略に対応
 */

import { useEffect, useRef, useState } from 'react'

export interface UsePollingOptions {
  /**
   * ポーリング間隔（ミリ秒）
   * @default 5000 (5秒)
   */
  interval?: number

  /**
   * ポーリングを有効にするか
   * @default true
   */
  enabled?: boolean

  /**
   * エラー発生時にポーリングを停止するか
   * @default false
   */
  stopOnError?: boolean

  /**
   * エラーハンドラー
   */
  onError?: (error: Error) => void
}

export interface UsePollingReturn<T> {
  /**
   * 取得したデータ
   */
  data: T | null

  /**
   * ローディング状態
   */
  isLoading: boolean

  /**
   * エラー
   */
  error: Error | null

  /**
   * 手動でデータを再取得
   */
  refetch: () => Promise<void>

  /**
   * リフレッシュ中かどうか
   */
  isRefreshing: boolean
}

/**
 * Pollingフック
 *
 * @param fetcher - データ取得関数
 * @param options - オプション
 * @returns ポーリング結果
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch, isRefreshing } = usePolling(
 *   async () => fetchOrders('ready'),
 *   { interval: 5000, enabled: true }
 * )
 * ```
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  options: UsePollingOptions = {}
): UsePollingReturn<T> {
  const {
    interval = 5000,
    enabled = true,
    stopOnError = false,
    onError
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const fetchData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true)
      }

      const result = await fetcher()

      if (mountedRef.current) {
        setData(result)
        setError(null)
        setIsLoading(false)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')

      if (mountedRef.current) {
        setError(error)
        setIsLoading(false)

        if (onError) {
          onError(error)
        }

        // エラー時にポーリングを停止する場合
        if (stopOnError && intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    } finally {
      if (mountedRef.current && isManualRefresh) {
        setIsRefreshing(false)
      }
    }
  }

  const refetch = async () => {
    await fetchData(true)
  }

  useEffect(() => {
    mountedRef.current = true

    if (!enabled) {
      return
    }

    // 初回データ取得
    fetchData()

    // ポーリング開始
    intervalRef.current = setInterval(() => {
      fetchData()
    }, interval)

    return () => {
      mountedRef.current = false

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval])

  return {
    data,
    isLoading,
    error,
    refetch,
    isRefreshing
  }
}
