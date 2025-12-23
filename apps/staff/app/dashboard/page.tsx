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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
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
        </div>
      </main>
    </div>
  )
}
