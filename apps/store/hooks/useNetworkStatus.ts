'use client'

import { useState, useEffect } from 'react'

/**
 * ネットワーク接続状態を監視するフック
 *
 * @returns online - オンライン状態かどうか
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // 初期状態を設定
    setIsOnline(navigator.onLine)

    // オンライン・オフラインイベントをリッスン
    const handleOnline = () => {
      console.log('ネットワーク接続: オンライン')
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log('ネットワーク接続: オフライン')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // クリーンアップ
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
