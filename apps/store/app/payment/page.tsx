'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchOrders } from '@/lib/api/store/orders'
import { fetchPayments, createPayment } from '@/lib/api/store/payments'
import type { Order } from '@/lib/api/store/orders'
import type { Payment, PaymentCreateRequest } from '@/lib/api/store/payments'
import type { StoreUser } from '../../../../types/store'
import { ApiError } from '@/lib/api/client'

type PaymentMethod = 'cash' | 'credit_card' | 'qr_code' | 'other'

export default function PaymentPage() {
  const [user, setUser] = useState<StoreUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [processing, setProcessing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('store_token')
    const userStr = localStorage.getItem('store_user')

    if (!token || !userStr) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userStr))
    loadData()
    setLoading(false)

    // 5秒ごとに自動リフレッシュ
    const interval = setInterval(() => {
      loadData()
    }, 5000)

    return () => clearInterval(interval)
  }, [router])

  const loadData = async () => {
    try {
      const [ordersData, paymentsData] = await Promise.all([
        fetchOrders('delivered'),
        fetchPayments()
      ])
      setOrders(ordersData)
      setPayments(paymentsData)
      setError('')
    } catch (err) {
      console.error('データ取得エラー:', err)
      if (err instanceof ApiError) {
        setError('データの取得に失敗しました')
      }
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadData()
    } finally {
      setRefreshing(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedOrder) {
      setError('注文を選択してください')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const paymentData: PaymentCreateRequest = {
        payment: {
          order_id: selectedOrder.id,
          payment_method: paymentMethod
        }
      }

      await createPayment(paymentData)

      setSelectedOrder(null)
      setPaymentMethod('cash')
      await loadData()
      alert('会計が完了しました')
    } catch (err) {
      console.error('会計処理エラー:', err)
      if (err instanceof ApiError) {
        setError(err.data?.error || '会計処理に失敗しました')
      } else {
        setError('サーバーに接続できません')
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('store_token')
    localStorage.removeItem('store_user')
    router.push('/login')
  }

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      cash: '現金',
      credit_card: 'クレジットカード',
      qr_code: 'QRコード決済',
      other: 'その他'
    }
    return labels[method]
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
              <h1 className="text-xl font-bold">会計画面</h1>
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
                onClick={() => router.push('/kitchen')}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                厨房画面
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
        {error && (
          <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">配膳済み注文（未会計）</h2>

              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">未会計の注文はありません</p>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedOrder?.id === order.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-lg">{order.order_number}</p>
                          <p className="text-sm text-gray-600">テーブル {order.table_id}</p>
                        </div>
                        <p className="text-xl font-bold text-blue-600">¥{order.total_amount}</p>
                      </div>

                      <div className="space-y-1">
                        {order.order_items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.menu_item_name}</span>
                            <span>×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">会計処理</h2>

              {!selectedOrder ? (
                <p className="text-gray-500 text-center py-8">注文を選択してください</p>
              ) : (
                <>
                  <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">{selectedOrder.order_number}</p>
                        <p className="text-sm text-gray-600">テーブル {selectedOrder.table_id}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3 border-t pt-3">
                      {selectedOrder.order_items.map((item: any) => (
                        <div key={item.id} className="flex justify-between">
                          <span>{item.menu_item_name} ×{item.quantity}</span>
                          <span>¥{item.unit_price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">合計金額</span>
                        <span className="text-3xl font-bold text-blue-600">¥{selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      支払い方法
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['cash', 'credit_card', 'qr_code'] as PaymentMethod[]).map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`py-3 px-4 border rounded-lg font-bold ${
                            paymentMethod === method
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {getPaymentMethodLabel(method)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-4 rounded text-lg disabled:opacity-50"
                  >
                    {processing ? '処理中...' : '会計を完了'}
                  </button>
                </>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">本日の会計履歴</h2>

              {payments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">会計履歴がありません</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {payments.map(payment => (
                    <div key={payment.id} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{payment.order.order_number}</p>
                          <p className="text-xs text-gray-600">{formatTime(payment.created_at)}</p>
                          <p className="text-xs text-gray-600">{getPaymentMethodLabel(payment.payment_method)}</p>
                        </div>
                        <p className="font-bold text-green-600">¥{payment.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
