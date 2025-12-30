'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchMenuItems } from '@/lib/api/store/menu-items'
import { fetchTables } from '@/lib/api/store/tables'
import { createOrder } from '@/lib/api/store/orders'
import { getPrintData, logPrintResult } from '@/lib/api/store/prints'
import type { MenuItem } from '@/lib/api/store/menu-items'
import type { Table } from '@/lib/api/store/tables'
import type { OrderCreateRequest } from '@/lib/api/store/orders'
import { ApiError } from '@/lib/api/client'

type CartItem = {
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export default function OrderPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [menuData, tableData] = await Promise.all([
        fetchMenuItems(),
        fetchTables()
      ])
      setMenuItems(menuData)
      setTables(tableData)
      setError('')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menuItem.id === menuItem.id)

    if (existingItem) {
      setCart(cart.map(item =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { menuItem, quantity: 1 }])
    }
  }

  const removeFromCart = (menuItemId: number) => {
    setCart(cart.filter(item => item.menuItem.id !== menuItemId))
  }

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId)
      return
    }

    setCart(cart.map(item =>
      item.menuItem.id === menuItemId
        ? { ...item, quantity }
        : item
    ))
  }

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
  }

  const handleSubmitOrder = async () => {
    if (!selectedTableId) {
      setError('テーブルを選択してください')
      return
    }

    if (cart.length === 0) {
      setError('商品を選択してください')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const orderData: OrderCreateRequest = {
        order: {
          table_id: selectedTableId,
          order_items_attributes: cart.map(item => ({
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            notes: item.notes
          }))
        }
      }

      const newOrder = await createOrder(orderData)

      // 自動印刷（プランで印刷機能が有効な場合）
      try {
        await printKitchenTicket(newOrder.id)
      } catch (printError) {
        // 印刷エラーは注文処理に影響させない
        console.error('印刷エラー:', printError)
      }

      // 注文成功後、カートをクリアして厨房画面へ
      setCart([])
      setSelectedTableId(null)
      router.push('/kitchen')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.errors?.join(', ') || err.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 厨房チケット印刷
  const printKitchenTicket = async (orderId: number) => {
    try {
      const printData = await getPrintData(orderId)

      // 新しいウィンドウで印刷
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (printWindow) {
        printWindow.document.write(printData.html)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()

        // 印刷成功をログ
        await logPrintResult(orderId, printData.template_id, 'success')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('印刷エラー:', errorMessage)

      // 印刷失敗をログ
      await logPrintResult(orderId, 0, 'failed', errorMessage)
    }
  }

  if (isLoading) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">注文入力（POS）</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/kitchen')}
                className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
              >
                厨房画面へ
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
              >
                ダッシュボード
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* メニュー選択エリア */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-lg font-bold">メニュー</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="flex flex-col rounded-lg border bg-white p-4 text-left shadow hover:shadow-md"
                  disabled={!item.available}
                >
                  <div className="mb-2 text-sm font-bold text-gray-900">
                    {item.name}
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    ¥{item.price.toLocaleString()}
                  </div>
                  {!item.available && (
                    <div className="mt-2 text-xs text-red-600">売り切れ</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* カート・注文確定エリア */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-bold">注文内容</h2>

              {/* テーブル選択 */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  テーブル選択 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTableId || ''}
                  onChange={(e) => setSelectedTableId(Number(e.target.value))}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="">選択してください</option>
                  {tables.filter(t => t.status === 'available').map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.number} ({table.capacity}名)
                    </option>
                  ))}
                </select>
              </div>

              {/* カート内容 */}
              <div className="mb-4 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-500">商品が選択されていません</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.menuItem.id} className="mb-3 flex items-center justify-between border-b pb-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.menuItem.name}</div>
                        <div className="text-sm text-gray-600">
                          ¥{item.menuItem.price.toLocaleString()} × {item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.menuItem.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 合計金額 */}
              <div className="mb-4 border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>合計</span>
                  <span>¥{getTotalAmount().toLocaleString()}</span>
                </div>
              </div>

              {/* 注文確定ボタン */}
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || cart.length === 0 || !selectedTableId}
                className="w-full rounded bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? '送信中...' : '注文を確定'}
              </button>

              {/* カートクリア */}
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="mt-2 w-full rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  カートをクリア
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
