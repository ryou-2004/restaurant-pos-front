'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { KitchenQueue, Order, StoreUser } from '../../../../types/store'

export default function KitchenPage() {
  const [user, setUser] = useState<StoreUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [queues, setQueues] = useState<KitchenQueue[]>([])
  const [readyOrders, setReadyOrders] = useState<Order[]>([])
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('store_token')
    const userStr = localStorage.getItem('store_user')

    if (!token || !userStr) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userStr))
    fetchData(token)
    setLoading(false)

    const interval = setInterval(() => {
      fetchData(token)
    }, 5000)

    return () => clearInterval(interval)
  }, [router])

  const fetchData = async (token: string) => {
    await Promise.all([
      fetchKitchenQueues(token),
      fetchReadyOrders(token),
      fetchDeliveredOrders(token)
    ])
  }

  const fetchKitchenQueues = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/store/kitchen_queues', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setQueues(data)
      }
    } catch (err) {
      console.error('厨房キュー取得エラー:', err)
    }
  }

  const fetchReadyOrders = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/store/orders?status=ready', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReadyOrders(data)
      }
    } catch (err) {
      console.error('配膳待ち注文取得エラー:', err)
    }
  }

  const fetchDeliveredOrders = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/store/orders?status=delivered', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDeliveredOrders(data)
      }
    } catch (err) {
      console.error('配膳済み注文取得エラー:', err)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    const token = localStorage.getItem('store_token')
    if (token) {
      await fetchData(token)
    }
    setRefreshing(false)
  }

  const handleStart = async (queueId: number) => {
    const token = localStorage.getItem('store_token')
    try {
      const response = await fetch(`http://localhost:3000/api/store/kitchen_queues/${queueId}/start`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        await fetchData(token!)
      }
    } catch (err) {
      console.error('調理開始エラー:', err)
    }
  }

  const handleComplete = async (queueId: number) => {
    const token = localStorage.getItem('store_token')
    try {
      const response = await fetch(`http://localhost:3000/api/store/kitchen_queues/${queueId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        await fetchData(token!)
      }
    } catch (err) {
      console.error('調理完了エラー:', err)
    }
  }

  const handleDeliver = async (orderId: number) => {
    const token = localStorage.getItem('store_token')
    try {
      const response = await fetch(`http://localhost:3000/api/store/orders/${orderId}/deliver`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        await fetchData(token!)
      }
    } catch (err) {
      console.error('配膳完了エラー:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('store_token')
    localStorage.removeItem('store_user')
    router.push('/login')
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      waiting: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      ready: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800'
    }
    const labels = {
      waiting: '待機中',
      in_progress: '調理中',
      completed: '完了',
      ready: '配膳待ち',
      delivered: '配膳済み'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  const waitingQueues = queues.filter(q => q.status === 'waiting')
  const cookingQueues = queues.filter(q => q.status === 'in_progress')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">厨房ディスプレイ</h1>
              <span className="text-sm text-gray-600">{user?.tenant.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {refreshing ? '更新中...' : '手動更新'}
              </button>
              <button
                onClick={() => router.push('/order')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                注文入力
              </button>
              <button
                onClick={() => router.push('/payment')}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                会計画面
              </button>
              <span className="text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-4">
          {/* 待機中 */}
          <div>
            <div className="bg-yellow-50 rounded-lg shadow p-4 mb-4">
              <h2 className="text-lg font-bold mb-2">待機中 ({waitingQueues.length})</h2>
            </div>
            <div className="space-y-4">
              {waitingQueues.map(queue => (
                <div key={queue.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-lg font-bold">{queue.order.order_number}</p>
                      <p className="text-sm text-gray-600">{formatTime(queue.created_at)}</p>
                    </div>
                    {getStatusBadge(queue.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    {queue.order.order_items.map(item => (
                      <div key={item.id} className="border-b pb-2">
                        <div className="flex justify-between">
                          <span className="font-bold">{item.menu_item_name}</span>
                          <span className="text-sm">×{item.quantity}</span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-red-600">備考: {item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleStart(queue.id)}
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    調理開始
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 調理中 */}
          <div>
            <div className="bg-blue-50 rounded-lg shadow p-4 mb-4">
              <h2 className="text-lg font-bold mb-2">調理中 ({cookingQueues.length})</h2>
            </div>
            <div className="space-y-4">
              {cookingQueues.map(queue => (
                <div key={queue.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-lg font-bold">{queue.order.order_number}</p>
                      <p className="text-sm text-gray-600">開始: {formatTime(queue.started_at)}</p>
                    </div>
                    {getStatusBadge(queue.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    {queue.order.order_items.map(item => (
                      <div key={item.id} className="border-b pb-2">
                        <div className="flex justify-between">
                          <span className="font-bold">{item.menu_item_name}</span>
                          <span className="text-sm">×{item.quantity}</span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-red-600">備考: {item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleComplete(queue.id)}
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    調理完了
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 配膳待ち */}
          <div>
            <div className="bg-purple-50 rounded-lg shadow p-4 mb-4">
              <h2 className="text-lg font-bold mb-2">配膳待ち ({readyOrders.length})</h2>
            </div>
            <div className="space-y-4">
              {readyOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-lg font-bold">{order.order_number}</p>
                      <p className="text-sm text-gray-600">テーブル {order.table_id}</p>
                    </div>
                    {getStatusBadge('ready')}
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.order_items.map(item => (
                      <div key={item.id} className="border-b pb-2">
                        <div className="flex justify-between">
                          <span className="font-bold">{item.menu_item_name}</span>
                          <span className="text-sm">×{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeliver(order.id)}
                    className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    配膳完了
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 完了 */}
          <div>
            <div className="bg-green-50 rounded-lg shadow p-4 mb-4">
              <h2 className="text-lg font-bold mb-2">完了（配膳済み） ({deliveredOrders.length})</h2>
            </div>
            <div className="space-y-4">
              {deliveredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow p-4 opacity-75">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-lg font-bold">{order.order_number}</p>
                      <p className="text-sm text-gray-600">テーブル {order.table_id}</p>
                    </div>
                    {getStatusBadge('delivered')}
                  </div>

                  <div className="space-y-2">
                    {order.order_items.map(item => (
                      <div key={item.id} className="border-b pb-2">
                        <div className="flex justify-between">
                          <span className="font-bold">{item.menu_item_name}</span>
                          <span className="text-sm">×{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
