'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MenuItem, StoreUser } from '../../../../types/store'

interface OrderItemInput {
  menu_item_id: number
  menu_item_name: string
  quantity: number
  unit_price: number
  notes: string
}

export default function OrderPage() {
  const [user, setUser] = useState<StoreUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([])
  const [tableId, setTableId] = useState('')
  const [submitting, setSubmitting] = useState(false)
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
    fetchMenuItems(token)
    setLoading(false)
  }, [router])

  const fetchMenuItems = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/store/menu_items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMenuItems(data)
      }
    } catch (err) {
      console.error('メニュー取得エラー:', err)
    }
  }

  const handleAddItem = (menuItem: MenuItem) => {
    const existing = orderItems.find(item => item.menu_item_id === menuItem.id)

    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.menu_item_id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setOrderItems([...orderItems, {
        menu_item_id: menuItem.id,
        menu_item_name: menuItem.name,
        quantity: 1,
        unit_price: menuItem.price,
        notes: ''
      }])
    }
  }

  const handleQuantityChange = (menu_item_id: number, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.menu_item_id !== menu_item_id))
    } else {
      setOrderItems(orderItems.map(item =>
        item.menu_item_id === menu_item_id
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const handleNotesChange = (menu_item_id: number, notes: string) => {
    setOrderItems(orderItems.map(item =>
      item.menu_item_id === menu_item_id
        ? { ...item, notes }
        : item
    ))
  }

  const handleSubmit = async () => {
    if (!tableId || orderItems.length === 0) {
      setError('テーブル番号と注文商品を選択してください')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('store_token')
      const response = await fetch('http://localhost:3000/api/store/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_id: parseInt(tableId),
          order_items_attributes: orderItems.map(item => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            notes: item.notes || null
          }))
        }),
      })

      if (response.ok) {
        setOrderItems([])
        setTableId('')
        alert('注文を送信しました')
      } else {
        const data = await response.json()
        setError(data.error || '注文送信に失敗しました')
      }
    } catch (err) {
      setError('サーバーに接続できません')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('store_token')
    localStorage.removeItem('store_user')
    router.push('/login')
  }

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  }

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

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
              <h1 className="text-xl font-bold">注文入力</h1>
              <span className="text-sm text-gray-600">{user?.tenant.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/kitchen')}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                厨房画面
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
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">メニュー</h2>

              {Object.entries(groupedMenuItems).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-700">{category}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleAddItem(item)}
                        className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                      >
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">¥{item.price}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">注文内容</h2>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  テーブル番号
                </label>
                <input
                  type="number"
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="1"
                  min="1"
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {orderItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">商品を選択してください</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {orderItems.map(item => (
                      <div key={item.menu_item_id} className="border-b pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold">{item.menu_item_name}</span>
                          <span className="text-sm text-gray-600">¥{item.unit_price}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <button
                            onClick={() => handleQuantityChange(item.menu_item_id, item.quantity - 1)}
                            className="bg-gray-200 px-3 py-1 rounded"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.menu_item_id, item.quantity + 1)}
                            className="bg-gray-200 px-3 py-1 rounded"
                          >
                            +
                          </button>
                          <span className="ml-auto font-bold">¥{item.unit_price * item.quantity}</span>
                        </div>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleNotesChange(item.menu_item_id, e.target.value)}
                          className="text-sm border rounded w-full py-1 px-2"
                          placeholder="備考（例: 砂糖なし）"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">合計</span>
                      <span className="text-2xl font-bold text-blue-600">¥{getTotalAmount()}</span>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
                    >
                      {submitting ? '送信中...' : '注文を確定'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
