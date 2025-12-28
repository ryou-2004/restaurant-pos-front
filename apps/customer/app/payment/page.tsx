'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchOrders, Order } from '@/lib/api/customer/orders'
import TabBar from '../../components/TabBar'

export default function PaymentPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sessionData = localStorage.getItem('customer_session')
    if (!sessionData) {
      router.push('/scan')
      return
    }

    setSession(JSON.parse(sessionData))
    loadOrders()
  }, [router])

  const loadOrders = async () => {
    try {
      const data = await fetchOrders()
      setOrders(data)
    } catch (err) {
      console.error('注文の取得に失敗しました', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 合計金額を計算
  const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0)

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col pb-16">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 戻る
          </button>
          {session && (
            <p className="text-sm text-gray-600">
              {session.store_name} - {session.table_number}
            </p>
          )}
        </div>
      </header>

      {/* 会計画面メイン */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
          {/* アイコン */}
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-12 h-12 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
            </div>
          </div>

          {/* メッセージ */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            お会計お願いします
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            スタッフがお伺いします
          </p>

          {/* 合計金額 */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 mb-8">
            <p className="text-white text-lg mb-2">お支払い金額</p>
            <p className="text-white text-5xl md:text-6xl font-bold">
              ¥{totalAmount.toLocaleString()}
            </p>
          </div>

          {/* 注文内訳 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">ご注文内容</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {orders.map((order) => (
                <div key={order.id} className="border-b pb-3 last:border-b-0">
                  <p className="text-sm text-gray-600 mb-2">
                    注文番号: {order.order_number}
                  </p>
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-700">
                        {item.menu_item_name} × {item.quantity}
                      </span>
                      <span className="text-gray-900 font-medium">
                        ¥{item.subtotal.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 注意事項 */}
          <p className="text-sm text-gray-500">
            この画面をスタッフにお見せください
          </p>
        </div>
      </div>

      {/* 下部タブバー */}
      <TabBar />
    </div>
  )
}
