'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  role: string
  user_type: string
}

interface Tenant {
  id: number
  name: string
  subdomain: string
  created_at: string
  user_count: number
  subscription: {
    plan: string
    active: boolean
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [fetchingTenants, setFetchingTenants] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(userStr))
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const fetchTenants = async () => {
    setFetchingTenants(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/staff/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTenants(data)
      } else {
        setError('テナント一覧の取得に失敗しました')
      }
    } catch (err) {
      setError('サーバーに接続できません')
    } finally {
      setFetchingTenants(false)
    }
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
            <div className="flex items-center">
              <h1 className="text-xl font-bold">スタッフダッシュボード</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-700">{user?.name}</span>
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">ようこそ、{user?.name}さん</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">メールアドレス:</span> {user?.email}</p>
              <p><span className="font-semibold">ロール:</span> {user?.role}</p>
              <p><span className="font-semibold">ユーザータイプ:</span> {user?.user_type}</p>
            </div>
          </div>

          <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold">✅ ログイン成功！</p>
            <p>APIとの接続が正常に動作しています。</p>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">API接続テスト</h2>

            <button
              onClick={fetchTenants}
              disabled={fetchingTenants}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {fetchingTenants ? 'テナント取得中...' : 'テナント一覧を取得'}
            </button>

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {tenants.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">取得結果 ({tenants.length}件)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border">ID</th>
                        <th className="px-4 py-2 border">テナント名</th>
                        <th className="px-4 py-2 border">サブドメイン</th>
                        <th className="px-4 py-2 border">ユーザー数</th>
                        <th className="px-4 py-2 border">プラン</th>
                        <th className="px-4 py-2 border">ステータス</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map(tenant => (
                        <tr key={tenant.id}>
                          <td className="px-4 py-2 border">{tenant.id}</td>
                          <td className="px-4 py-2 border">{tenant.name}</td>
                          <td className="px-4 py-2 border">{tenant.subdomain}</td>
                          <td className="px-4 py-2 border">{tenant.user_count}</td>
                          <td className="px-4 py-2 border">{tenant.subscription.plan}</td>
                          <td className="px-4 py-2 border">
                            <span className={`px-2 py-1 rounded text-xs ${tenant.subscription.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {tenant.subscription.active ? '有効' : '無効'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
