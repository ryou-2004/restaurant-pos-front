'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  fetchStaffCalls,
  acknowledgeCall,
  resolveCall,
  StaffCall,
  CALL_TYPE_LABELS,
  CALL_TYPE_ICONS
} from '@/lib/api/store/staff-calls'
import { usePolling } from '../../hooks/usePolling'

export default function StaffCallsPage() {
  const router = useRouter()
  const [isResolving, setIsResolving] = useState<number | null>(null)

  // 5秒ごとに自動更新
  const { data: calls, isLoading, error, refetch } = usePolling(
    fetchStaffCalls,
    {
      interval: 5000,
      enabled: true
    }
  )

  // 新しい呼び出しがあったら音を鳴らす（オプション）
  useEffect(() => {
    if (calls && calls.length > 0) {
      const hasPending = calls.some(call => call.status === 'pending')
      if (hasPending && typeof window !== 'undefined') {
        const audio = new Audio('/notification.mp3')
        audio.play().catch(() => {
          // 音声再生失敗時は無視
        })
      }
    }
  }, [calls])

  const handleResolve = async (callId: number) => {
    setIsResolving(callId)
    try {
      await resolveCall(callId)
      await refetch()
    } catch (err: any) {
      alert(err.message || '対応完了に失敗しました')
    } finally {
      setIsResolving(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">店員呼び出し</h1>
            <button
              onClick={() => router.back()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              戻る
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600">
              呼び出し一覧の読み込みに失敗しました
            </p>
          </div>
        )}

        {/* 呼び出し一覧 */}
        {!calls || calls.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">現在、呼び出しはありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calls.map((call) => (
              <div
                key={call.id}
                className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                  call.status === 'pending'
                    ? 'border-red-300 animate-pulse'
                    : call.status === 'acknowledged'
                    ? 'border-yellow-300'
                    : 'border-gray-200'
                }`}
              >
                {/* 呼び出しヘッダー */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      テーブル {call.table_number}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {call.waiting_minutes}分待機中
                    </p>
                  </div>
                  <span className="text-4xl">
                    {CALL_TYPE_ICONS[call.call_type]}
                  </span>
                </div>

                {/* 呼び出し内容 */}
                <div className="mb-4">
                  <p className="text-lg font-medium text-gray-900">
                    {CALL_TYPE_LABELS[call.call_type]}
                  </p>
                  {call.notes && (
                    <p className="text-sm text-gray-600 mt-2">{call.notes}</p>
                  )}
                </div>

                {/* ステータス */}
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      call.status === 'pending'
                        ? 'bg-red-100 text-red-800'
                        : call.status === 'acknowledged'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {call.status === 'pending'
                      ? '対応待ち'
                      : call.status === 'acknowledged'
                      ? '確認済み'
                      : '対応完了'}
                  </span>
                </div>

                {/* アクションボタン */}
                {call.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolve(call.id)}
                    disabled={isResolving === call.id}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {isResolving === call.id ? '処理中...' : '対応完了'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 自動更新通知 */}
        <div className="mt-4 text-center text-sm text-gray-500">
          5秒ごとに自動更新されます
        </div>
      </div>
    </div>
  )
}
