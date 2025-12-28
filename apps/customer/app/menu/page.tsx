'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchMenuItems, MenuItem } from '@/lib/api/customer/menu-items'
import { createOrder, CreateOrderRequest } from '@/lib/api/customer/orders'

interface CartItem {
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export default function MenuPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [session, setSession] = useState<any>(null)

  // セッション確認とメニュー読み込み
  useEffect(() => {
    const sessionData = localStorage.getItem('customer_session')
    if (!sessionData) {
      router.push('/customer/scan')
      return
    }

    setSession(JSON.parse(sessionData))
    loadMenuItems()
  }, [router])

  const loadMenuItems = async () => {
    try {
      const items = await fetchMenuItems()
      setMenuItems(items)
      setError('')
    } catch (err) {
      setError('メニューの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // カートに追加
  const addToCart = (menuItem: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id)
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { menuItem, quantity: 1 }]
    })
  }

  // カートから削除
  const removeFromCart = (menuItemId: number) => {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId))
  }

  // 数量変更
  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    )
  }

  // 合計金額計算
  const total = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  )

  // 注文送信
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return

    setIsSubmitting(true)
    setError('')

    try {
      const orderRequest: CreateOrderRequest = {
        order_items_attributes: cart.map((item) => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes
        }))
      }

      await createOrder(orderRequest)

      // 注文成功 → カートクリア → 注文一覧へ
      setCart([])
      router.push('/customer/orders')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '注文の送信に失敗しました'
      setError(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // カテゴリ別にグループ化
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

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
            <div>
              <h1 className="text-xl font-bold text-gray-900">メニュー</h1>
              {session && (
                <p className="text-sm text-gray-600">
                  {session.store_name} - {session.table_number}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push('/customer/orders')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              注文状況を見る
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メニュー一覧 */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-lg font-bold text-gray-900 mb-3">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-lg font-bold text-gray-900">
                          ¥{item.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          追加
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* カート */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">カート</h2>

              {cart.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  商品を選んでください
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="flex items-center justify-between border-b pb-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.menuItem.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            ¥{item.menuItem.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.menuItem.id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.menuItem.id, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>合計</span>
                      <span>¥{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '送信中...' : '注文する'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
