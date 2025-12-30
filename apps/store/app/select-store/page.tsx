'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchStores, type Store } from '@/lib/api/store/stores'
import { ApiError } from '@/lib/api/client'

export default function SelectStorePage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('store_token')
    if (!token) {
      router.push('/login')
      return
    }

    // 既に店舗が選択されている場合は、該当ページへリダイレクト
    const selectedStore = localStorage.getItem('store_selected_store')
    if (selectedStore) {
      router.push('/tables')
      return
    }

    loadStores()
  }, [router])

  const loadStores = async () => {
    try {
      const data = await fetchStores()
      setStores(data.filter(store => store.active))
      setError('')
    } catch (err) {
      console.error('店舗取得エラー:', err)
      if (err instanceof ApiError) {
        setError('店舗の取得に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelectStore = (store: Store) => {
    // 選択した店舗情報を保存
    localStorage.setItem('store_selected_store', JSON.stringify({
      id: store.id,
      name: store.name
    }))

    // テーブル管理画面へリダイレクト
    router.push('/tables')
  }

  if (loading) {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">店舗を選択</h1>
          <p className="text-gray-600 mb-8 text-center">
            操作する店舗を選択してください
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {stores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">利用可能な店舗がありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleSelectStore(store)}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{store.name}</h3>
                  {store.address && (
                    <p className="text-sm text-gray-600 mb-1">
                      📍 {store.address}
                    </p>
                  )}
                  {store.phone && (
                    <p className="text-sm text-gray-600">
                      📞 {store.phone}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
