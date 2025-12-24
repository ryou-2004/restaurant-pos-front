'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TenantUser } from '../../../../types/tenant'

interface Store {
  id: number
  name: string
  address: string | null
  phone: string | null
  active: boolean
  created_at: string
  updated_at: string
}

interface StoreInput {
  name: string
  address: string
  phone: string
  active: boolean
}

export default function StoresPage() {
  const [user, setUser] = useState<TenantUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [stores, setStores] = useState<Store[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [formData, setFormData] = useState<StoreInput>({
    name: '',
    address: '',
    phone: '',
    active: true
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('tenant_token')
    const userStr = localStorage.getItem('tenant_user')

    if (!token || !userStr) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userStr))
    fetchStores(token)
    setLoading(false)
  }, [router])

  const fetchStores = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/tenant/stores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (err) {
      console.error('店舗一覧取得エラー:', err)
    }
  }

  const handleOpenModal = (store?: Store) => {
    if (store) {
      setEditingStore(store)
      setFormData({
        name: store.name,
        address: store.address || '',
        phone: store.phone || '',
        active: store.active
      })
    } else {
      setEditingStore(null)
      setFormData({
        name: '',
        address: '',
        phone: '',
        active: true
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingStore(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const token = localStorage.getItem('tenant_token')
    if (!token) {
      setError('認証エラー。再ログインしてください。')
      setSubmitting(false)
      return
    }

    try {
      const url = editingStore
        ? `http://localhost:3000/api/tenant/stores/${editingStore.id}`
        : 'http://localhost:3000/api/tenant/stores'

      const method = editingStore ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ store: formData }),
      })

      if (response.ok) {
        await fetchStores(token)
        handleCloseModal()
      } else {
        const data = await response.json()
        setError(data.errors?.join(', ') || '保存に失敗しました')
      }
    } catch (err) {
      setError('サーバーに接続できません')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (store: Store) => {
    if (!window.confirm(`店舗「${store.name}」を削除しますか？\nこの操作は取り消せません。`)) {
      return
    }

    const token = localStorage.getItem('tenant_token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:3000/api/tenant/stores/${store.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchStores(token)
      } else {
        alert('削除に失敗しました')
      }
    } catch (err) {
      alert('サーバーに接続できません')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('tenant_token')
    localStorage.removeItem('tenant_user')
    router.push('/login')
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
              <h1 className="text-xl font-bold">店舗管理</h1>
              <span className="text-sm text-gray-600">{user?.tenant.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                ダッシュボード
              </button>
              <button
                onClick={() => router.push('/menu')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                メニュー管理
              </button>
              <button
                onClick={() => router.push('/reports')}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                売上レポート
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
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">店舗一覧</h2>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              + 新規店舗追加
            </button>
          </div>

          {/* 店舗一覧テーブル */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    店舗名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電話番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stores.length > 0 ? (
                  stores.map((store) => (
                    <tr key={store.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{store.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{store.address || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{store.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          store.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {store.active ? '有効' : '無効'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(store.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenModal(store)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(store)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      店舗が登録されていません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 店舗追加/編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">
              {editingStore ? '店舗情報編集' : '新規店舗追加'}
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="例: 渋谷店"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  住所
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="例: 東京都渋谷区..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  電話番号
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="例: 03-1234-5678"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">有効</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  disabled={submitting}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? '保存中...' : (editingStore ? '更新' : '作成')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
