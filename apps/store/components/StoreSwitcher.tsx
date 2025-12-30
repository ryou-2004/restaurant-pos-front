'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchStores, type Store } from '@/lib/api/store/stores'
import { ApiError } from '@/lib/api/client'

interface SelectedStore {
  id: number
  name: string
}

export default function StoreSwitcher() {
  const router = useRouter()
  const [currentStore, setCurrentStore] = useState<SelectedStore | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 現在選択中の店舗を取得
    const selectedStore = localStorage.getItem('store_selected_store')
    if (selectedStore) {
      setCurrentStore(JSON.parse(selectedStore))
    }
  }, [])

  const loadStores = async () => {
    if (stores.length > 0) {
      // 既にロード済みの場合はスキップ
      return
    }

    setLoading(true)
    try {
      const data = await fetchStores()
      setStores(data.filter(store => store.active))
    } catch (err) {
      console.error('店舗取得エラー:', err)
      if (err instanceof ApiError) {
        alert('店舗の取得に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDropdown = async () => {
    if (!showDropdown) {
      await loadStores()
    }
    setShowDropdown(!showDropdown)
  }

  const handleSelectStore = (store: Store) => {
    const newStore = {
      id: store.id,
      name: store.name
    }

    localStorage.setItem('store_selected_store', JSON.stringify(newStore))
    setCurrentStore(newStore)
    setShowDropdown(false)

    // ページをリロードして新しい店舗のデータを取得
    window.location.reload()
  }

  if (!currentStore) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleDropdown}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          🏪 {currentStore.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* ドロップダウンメニュー */}
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                店舗を選択
              </p>

              {loading ? (
                <div className="px-3 py-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
                </div>
              ) : (
                <div className="space-y-1">
                  {stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => handleSelectStore(store)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        store.id === currentStore.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-medium">{store.name}</p>
                      {store.address && (
                        <p className="text-xs text-gray-500 mt-0.5">{store.address}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
