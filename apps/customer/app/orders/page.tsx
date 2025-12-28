'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchOrders, Order, OrderStatus } from '@/lib/api/customer/orders'
import { usePolling } from '../../hooks/usePolling'

const STATUS_CONFIG: Record<OrderStatus, {
  label: string
  color: string
  icon: string
  description: string
}> = {
  pending: {
    label: '注文受付済み',
    color: 'bg-gray-100 text-gray-800',
    icon: '📝',
    description: 'キッチンで確認中です'
  },
  cooking: {
    label: '調理中',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '🍳',
    description: 'ただいま調理しています'
  },
  ready: {
    label: '調理完了',
    color: 'bg-green-100 text-green-800',
    icon: '✅',
    description: 'まもなくお席までお届けします'
  },
  delivered: {
    label: '配膳済み',
    color: 'bg-blue-100 text-blue-800',
    icon: '🍽️',
    description: 'お楽しみください'
  },
  paid: {
    label: '会計済み',
    color: 'bg-purple-100 text-purple-800',
    icon: '💳',
    description: 'ありがとうございました'
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)

  // セッション確認
  useEffect(() => {
    const sessionData = localStorage.getItem('customer_session')
    if (!sessionData) {
      router.push('/scan')
      return
    }
    setSession(JSON.parse(sessionData))
  }, [router])

  // 5秒ごとに注文一覧を自動更新
  const { data: orders, isLoading, error, refetch, isRefreshing } = usePolling(
    fetchOrders,
    {
      interval: 5000,
      enabled: !!session
    }
  )

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
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">注文状況</h1>
              {session && (
                <p className="text-sm text-gray-600">
                  {session.store_name} - {session.table_number}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push('/menu')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              メニューに戻る
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 自動更新インジケーター */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600">
              {isRefreshing ? '更新中...' : '5秒ごとに自動更新'}
            </span>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefreshing}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            今すぐ更新
          </button>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600">
              注文の読み込みに失敗しました
            </p>
          </div>
        )}

        {/* 注文一覧 */}
        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">現在、注文はありません</p>
            <button
              onClick={() => router.push('/menu')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              メニューから注文する
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = STATUS_CONFIG[order.status]
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  {/* 注文ヘッダー */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        注文番号: {order.order_number}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>

                  {/* ステータス説明 */}
                  <p className="text-sm text-gray-600 mb-3">
                    {statusInfo.description}
                  </p>

                  {/* 注文明細 */}
                  <div className="border-t pt-3 space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.menu_item_name} × {item.quantity}
                        </span>
                        <span className="text-gray-900 font-medium">
                          ¥{item.subtotal.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 合計金額 */}
                  <div className="border-t mt-3 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">合計</span>
                    <span className="text-lg font-bold text-gray-900">
                      ¥{order.total_amount.toLocaleString()}
                    </span>
                  </div>

                  {/* メモ */}
                  {order.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">メモ:</span> {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* アクションボタン */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (confirm('スタッフをお呼びしますか？')) {
                alert('スタッフを呼び出しました。お待ちください。')
              }
            }}
            className="px-6 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            店員呼び出し
          </button>

          <button
            onClick={() => router.push('/payment')}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
              />
            </svg>
            お会計
          </button>
        </div>

        {/* フッター情報 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">ご注意</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 注文状況は自動的に更新されます</li>
            <li>• 調理完了後、スタッフがお席までお届けします</li>
            <li>• お会計は「お会計」ボタンから画面を表示してスタッフにお見せください</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
