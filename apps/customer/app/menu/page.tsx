'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { fetchMenuItems, MenuItem } from '@/lib/api/customer/menu-items'
import { createOrder, CreateOrderRequest } from '@/lib/api/customer/orders'
import TabBar from '../../components/TabBar'

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
  const [showCart, setShowCart] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // セッション確認とメニュー読み込み
  useEffect(() => {
    const sessionData = localStorage.getItem('customer_session')
    if (!sessionData) {
      router.push('/scan')
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

  // カート内アイテム数
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

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
      router.push('/orders')
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

  // カテゴリーリストを取得
  const categories = Object.keys(groupedItems)

  // カテゴリーまでスクロール
  const scrollToCategory = (category: string) => {
    const element = categoryRefs.current[category]
    if (element) {
      // ヘッダー + カテゴリーナビの高さを考慮してスクロール
      const offset = 140 // ヘッダー高さ + カテゴリーナビ高さ
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // 商品詳細モーダルを開く
  const openDetailModal = (item: MenuItem) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  // 商品詳細モーダルを閉じる
  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedItem(null)
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
    <div className="min-h-screen bg-gray-50 pb-16">
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
              onClick={() => router.push('/orders')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              注文状況を見る
            </button>
          </div>
        </div>
      </header>

      {/* カテゴリーナビゲーション */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 py-3 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => scrollToCategory(category)}
                className="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-800 hover:text-blue-600 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メニュー一覧 */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div
                key={category}
                ref={(el) => {
                  categoryRefs.current[category] = el
                }}
              >
                <h2 className="text-lg font-bold text-gray-900 mb-3">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openDetailModal(item)}
                    >
                      {/* 商品画像 */}
                      {item.image_url && (
                        <div className="relative w-full h-48 bg-gray-200">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 画像読み込み失敗時はプレースホルダーを表示
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}

                      <div className="p-4">
                        {/* 商品名 */}
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>

                        {/* 辛さレベル表示 */}
                        {item.spice_level && item.spice_level > 0 && (
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-red-600 font-medium">
                              🌶️ {Array(item.spice_level).fill('辛').join('')}
                            </span>
                          </div>
                        )}

                        {/* 説明文 */}
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                        )}

                        {/* アレルゲン情報 */}
                        {item.allergens && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">⚠️ アレルゲン: </span>
                            {item.allergens}
                          </div>
                        )}

                        {/* 価格と追加ボタン */}
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-lg font-bold text-gray-900">
                            ¥{item.price.toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation() // モーダル開くのを防止
                              addToCart(item)
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            追加
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* カート */}
          <div className={`
            lg:col-span-1
            ${showCart ? 'fixed inset-0 z-40 lg:relative lg:z-0' : 'hidden lg:block'}
          `}>
            {/* モバイル用背景オーバーレイ */}
            {showCart && (
              <div
                onClick={() => setShowCart(false)}
                className="lg:hidden absolute inset-0 bg-black bg-opacity-50"
              />
            )}

            {/* カート本体 */}
            <div className={`
              bg-white rounded-lg shadow-sm p-4
              ${showCart ? 'absolute bottom-0 left-0 right-0 lg:relative max-h-[80vh] overflow-y-auto' : ''}
              lg:sticky lg:top-24
            `}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">カート</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="lg:hidden text-gray-600 hover:text-gray-800 text-2xl"
                >
                  ✕
                </button>
              </div>

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
                          <button
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-md hover:bg-red-100 text-red-600"
                            title="削除"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
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

      {/* 固定カートボタン（右下・タブバーの上） - カート非表示時のみ表示 */}
      {!showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-20 right-6 lg:hidden bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all z-50"
        >
        {/* カートアイコン */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>

        {/* アイテム数バッジ */}
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </button>
      )}

      {/* 商品詳細モーダル */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">商品詳細</h2>
              <button
                onClick={closeDetailModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-6">
              {/* 商品画像（大きめ） */}
              {selectedItem.image_url && (
                <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* 商品名 */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedItem.name}</h3>

              {/* 辛さレベル */}
              {selectedItem.spice_level && selectedItem.spice_level > 0 && (
                <div className="flex items-center mb-3">
                  <span className="text-sm text-red-600 font-medium">
                    🌶️ 辛さレベル: {Array(selectedItem.spice_level).fill('辛').join('')}
                  </span>
                </div>
              )}

              {/* 価格 */}
              <div className="text-3xl font-bold text-blue-600 mb-4">
                ¥{selectedItem.price.toLocaleString()}
              </div>

              {/* 説明文 */}
              {selectedItem.description && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">商品説明</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.description}</p>
                </div>
              )}

              {/* アレルゲン情報 */}
              {selectedItem.allergens && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    ⚠️ アレルゲン情報
                  </h4>
                  <p className="text-gray-700">{selectedItem.allergens}</p>
                </div>
              )}

              {/* カートに追加ボタン */}
              <button
                onClick={() => {
                  addToCart(selectedItem)
                  closeDetailModal()
                }}
                className="w-full px-6 py-4 bg-blue-600 text-white font-bold text-lg rounded-md hover:bg-blue-700"
              >
                カートに追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 下部タブバー */}
      <TabBar />
    </div>
  )
}
