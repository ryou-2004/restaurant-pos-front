'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TenantUser } from '../../../../types/tenant'

interface DashboardStats {
  today_sales: number
  today_orders: number
  active_orders: number
  popular_menu_items: PopularMenuItem[]
}

interface PopularMenuItem {
  menu_item_id: number
  menu_item_name: string
  total_quantity: number
  total_sales: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<TenantUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('tenant_token')
    const userStr = localStorage.getItem('tenant_user')

    if (!token || !userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)
    fetchDashboardStats(token)
    setLoading(false)

    // 30秒ごとに自動更新
    const interval = setInterval(() => {
      fetchDashboardStats(token)
    }, 30000)

    return () => clearInterval(interval)
  }, [router])

  const fetchDashboardStats = async (token: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // 今日の売上レポート取得
      const dailyResponse = await fetch(`http://localhost:3000/api/tenant/reports/daily?date=${today}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      // 人気メニュー取得（過去30日）
      const menuResponse = await fetch(`http://localhost:3000/api/tenant/reports/by_menu_item`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (dailyResponse.ok && menuResponse.ok) {
        const dailyData = await dailyResponse.json()
        const menuData = await menuResponse.json()

        setStats({
          today_sales: dailyData.total_amount || 0,
          today_orders: dailyData.total_orders || 0,
          active_orders: dailyData.active_orders || 0,
          popular_menu_items: menuData.slice(0, 5) // Top 5
        })
      }
    } catch (err) {
      console.error('ダッシュボード取得エラー:', err)
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
              <h1 className="text-xl font-bold">ダッシュボード</h1>
              <span className="text-sm text-gray-600">{user?.tenant.name}</span>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* サマリーカード */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-600 mb-2">今日の売上</h2>
            <p className="text-3xl font-bold text-blue-600">
              ¥{stats?.today_sales.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-600 mb-2">今日の注文数</h2>
            <p className="text-3xl font-bold text-green-600">
              {stats?.today_orders || 0} 件
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-600 mb-2">アクティブな注文</h2>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.active_orders || 0} 件
            </p>
          </div>
        </div>

        {/* 人気メニューTop5 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">人気メニュー Top 5（過去30日）</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    順位
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メニュー名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    販売数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    売上
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.popular_menu_items.length ? (
                  stats.popular_menu_items.map((item, index) => (
                    <tr key={item.menu_item_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">{item.menu_item_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600">{item.total_quantity} 個</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-blue-600">¥{item.total_sales.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
