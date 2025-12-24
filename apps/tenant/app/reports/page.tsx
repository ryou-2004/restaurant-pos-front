'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TenantUser } from '../../../../types/tenant'

type ReportTab = 'daily' | 'monthly' | 'menu'

interface DailyReport {
  date: string
  total_orders: number
  total_amount: number
  active_orders: number
  orders: {
    id: number
    order_number: string
    total_amount: number
    created_at: string
  }[]
}

interface MonthlyReport {
  year: number
  month: number
  total_orders: number
  total_amount: number
  daily_breakdown: {
    [date: string]: {
      total_orders: number
      total_amount: number
    }
  }
}

interface MenuItemSales {
  menu_item_id: number
  menu_item_name: string
  total_quantity: number
  total_sales: number
}

export default function ReportsPage() {
  const [user, setUser] = useState<TenantUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ReportTab>('daily')
  const router = useRouter()

  // 日次レポート
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null)

  // 月次レポート
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null)

  // メニュー別レポート
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [menuItemSales, setMenuItemSales] = useState<MenuItemSales[]>([])

  useEffect(() => {
    const token = localStorage.getItem('tenant_token')
    const userStr = localStorage.getItem('tenant_user')

    if (!token || !userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)
    setLoading(false)

    // 初回データ取得
    fetchDailyReport(token, selectedDate)
  }, [router])

  // タブ切り替え時のデータ取得
  useEffect(() => {
    const token = localStorage.getItem('tenant_token')
    if (!token) return

    if (activeTab === 'daily') {
      fetchDailyReport(token, selectedDate)
    } else if (activeTab === 'monthly') {
      fetchMonthlyReport(token, selectedYear, selectedMonth)
    } else if (activeTab === 'menu') {
      fetchMenuItemReport(token, startDate, endDate)
    }
  }, [activeTab])

  const fetchDailyReport = async (token: string, date: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tenant/reports/daily?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDailyReport(data)
      }
    } catch (err) {
      console.error('日次レポート取得エラー:', err)
    }
  }

  const fetchMonthlyReport = async (token: string, year: number, month: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tenant/reports/monthly?year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMonthlyReport(data)
      }
    } catch (err) {
      console.error('月次レポート取得エラー:', err)
    }
  }

  const fetchMenuItemReport = async (token: string, start: string, end: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tenant/reports/by_menu_item?start_date=${start}&end_date=${end}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMenuItemSales(data)
      }
    } catch (err) {
      console.error('メニュー別レポート取得エラー:', err)
    }
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    const token = localStorage.getItem('tenant_token')
    if (token) fetchDailyReport(token, date)
  }

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year)
    setSelectedMonth(month)
    const token = localStorage.getItem('tenant_token')
    if (token) fetchMonthlyReport(token, year, month)
  }

  const handleMenuDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
    const token = localStorage.getItem('tenant_token')
    if (token) fetchMenuItemReport(token, start, end)
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
              <h1 className="text-xl font-bold">売上レポート</h1>
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
                onClick={() => router.push('/stores')}
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
              >
                店舗管理
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
        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'daily'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              日次レポート
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'monthly'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              月次レポート
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'menu'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              メニュー別売上
            </button>
          </div>
        </div>

        {/* 日次レポート */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            {/* 日付選択 */}
            <div className="bg-white rounded-lg shadow p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日付を選択
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border rounded px-4 py-2"
              />
            </div>

            {/* サマリーカード */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">売上合計</h2>
                <p className="text-3xl font-bold text-blue-600">
                  ¥{dailyReport?.total_amount.toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">注文数</h2>
                <p className="text-3xl font-bold text-green-600">
                  {dailyReport?.total_orders || 0} 件
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">平均客単価</h2>
                <p className="text-3xl font-bold text-purple-600">
                  ¥{dailyReport && dailyReport.total_orders > 0
                    ? Math.round(dailyReport.total_amount / dailyReport.total_orders).toLocaleString()
                    : 0}
                </p>
              </div>
            </div>

            {/* 注文一覧 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">注文一覧</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        注文番号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        金額
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        注文時刻
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyReport?.orders && dailyReport.orders.length > 0 ? (
                      dailyReport.orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium">{order.order_number}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-bold text-blue-600">¥{order.total_amount.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-gray-600">
                              {new Date(order.created_at).toLocaleTimeString('ja-JP', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          注文データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 月次レポート */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            {/* 年月選択 */}
            <div className="bg-white rounded-lg shadow p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                年月を選択
              </label>
              <div className="flex space-x-4">
                <select
                  value={selectedYear}
                  onChange={(e) => handleMonthChange(Number(e.target.value), selectedMonth)}
                  className="border rounded px-4 py-2"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(selectedYear, Number(e.target.value))}
                  className="border rounded px-4 py-2"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{month}月</option>
                  ))}
                </select>
              </div>
            </div>

            {/* サマリーカード */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">月間売上合計</h2>
                <p className="text-3xl font-bold text-blue-600">
                  ¥{monthlyReport?.total_amount.toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">月間注文数</h2>
                <p className="text-3xl font-bold text-green-600">
                  {monthlyReport?.total_orders || 0} 件
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">1日平均売上</h2>
                <p className="text-3xl font-bold text-purple-600">
                  ¥{monthlyReport && monthlyReport.daily_breakdown
                    ? Math.round(monthlyReport.total_amount / Object.keys(monthlyReport.daily_breakdown).length).toLocaleString()
                    : 0}
                </p>
              </div>
            </div>

            {/* 日別内訳 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">日別売上内訳</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日付
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        注文数
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        売上
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {monthlyReport?.daily_breakdown && Object.keys(monthlyReport.daily_breakdown).length > 0 ? (
                      Object.entries(monthlyReport.daily_breakdown)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([date, data]) => (
                          <tr key={date}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium">
                                {new Date(date).toLocaleDateString('ja-JP', {
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'short'
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-gray-600">{data.total_orders} 件</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-bold text-blue-600">¥{data.total_amount.toLocaleString()}</span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* メニュー別売上 */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* 期間選択 */}
            <div className="bg-white rounded-lg shadow p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期間を選択
              </label>
              <div className="flex space-x-4 items-center">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-4 py-2"
                />
                <span>〜</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-4 py-2"
                />
                <button
                  onClick={() => handleMenuDateChange(startDate, endDate)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                >
                  検索
                </button>
              </div>
            </div>

            {/* サマリーカード */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">総売上</h2>
                <p className="text-3xl font-bold text-blue-600">
                  ¥{menuItemSales.reduce((sum, item) => sum + item.total_sales, 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">総販売数</h2>
                <p className="text-3xl font-bold text-green-600">
                  {menuItemSales.reduce((sum, item) => sum + item.total_quantity, 0).toLocaleString()} 個
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-sm font-medium text-gray-600 mb-2">メニュー数</h2>
                <p className="text-3xl font-bold text-purple-600">
                  {menuItemSales.length} 品
                </p>
              </div>
            </div>

            {/* メニュー別売上一覧 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">メニュー別売上ランキング</h2>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        平均単価
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {menuItemSales.length > 0 ? (
                      [...menuItemSales]
                        .sort((a, b) => b.total_sales - a.total_sales)
                        .map((item, index) => (
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-gray-600">
                                ¥{Math.round(item.total_sales / item.total_quantity).toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
