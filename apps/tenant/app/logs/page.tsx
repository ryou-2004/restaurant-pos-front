'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  fetchActivityLogs,
  fetchActivityLogStats
} from '@/lib/api/tenant/activity-logs'
import type {
  ActivityLog,
  ActivityLogFilters,
  ActivityLogStats,
  ActivityLogActionType
} from '@/types/activity-log'
import { ApiError } from '@/lib/api/client'

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState<ActivityLogStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  // フィルター状態
  const [filters, setFilters] = useState<ActivityLogFilters>({})
  const [storeId, setStoreId] = useState('')
  const [actionType, setActionType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadLogs()
    loadStats()
  }, [])

  const loadLogs = async (customFilters?: ActivityLogFilters) => {
    try {
      setIsLoading(true)
      const data = await fetchActivityLogs(customFilters || filters)
      setLogs(data)
      setError('')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.status === 401) {
          router.push('/login')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await fetchActivityLogStats()
      setStats(data)
    } catch (err) {
      console.error('統計読み込みエラー:', err)
    }
  }

  const handleFilter = () => {
    const newFilters: ActivityLogFilters = {}
    if (storeId) newFilters.store_id = parseInt(storeId)
    if (actionType) newFilters.action_type = actionType as ActivityLogActionType
    if (startDate) newFilters.start_date = startDate
    if (endDate) newFilters.end_date = endDate

    setFilters(newFilters)
    loadLogs(newFilters)
  }

  const handleReset = () => {
    setStoreId('')
    setActionType('')
    setStartDate('')
    setEndDate('')
    setFilters({})
    loadLogs({})
  }

  const handleLogout = () => {
    localStorage.removeItem('tenant_token')
    localStorage.removeItem('tenant_user')
    router.push('/login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('login')) return 'bg-blue-100 text-blue-800'
    if (action === 'create') return 'bg-green-100 text-green-800'
    if (action === 'update') return 'bg-yellow-100 text-yellow-800'
    if (action === 'delete') return 'bg-red-100 text-red-800'
    if (action.includes('order_') || action.includes('payment_'))
      return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (isLoading && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ナビゲーション */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">テナント管理</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  ダッシュボード
                </button>
                <button
                  onClick={() => router.push('/stores')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  店舗管理
                </button>
                <button
                  onClick={() => router.push('/menu')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  メニュー管理
                </button>
                <button
                  onClick={() => router.push('/users')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  ユーザー管理
                </button>
                <button
                  onClick={() => router.push('/reports')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  レポート
                </button>
                <button
                  onClick={() => router.push('/logs')}
                  className="text-blue-600 font-semibold"
                >
                  アクティビティログ
                </button>
              </div>
            </div>
            <div className="flex items-center">
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 統計サマリー */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">総ログ数</p>
              <p className="text-2xl font-bold">{stats.total_count}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">今日</p>
              <p className="text-2xl font-bold">{stats.today_count}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">今週</p>
              <p className="text-2xl font-bold">{stats.this_week_count}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">今月</p>
              <p className="text-2xl font-bold">{stats.this_month_count}</p>
            </div>
          </div>
        )}

        {/* フィルター */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-bold mb-4">フィルター</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店舗ID
              </label>
              <input
                type="number"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="店舗ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アクションタイプ
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">すべて</option>
                <option value="login">ログイン</option>
                <option value="logout">ログアウト</option>
                <option value="create">作成</option>
                <option value="update">更新</option>
                <option value="delete">削除</option>
                <option value="order_placed">注文作成</option>
                <option value="payment_completed">決済完了</option>
                <option value="menu_viewed">メニュー閲覧</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleFilter}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              フィルター適用
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              リセット
            </button>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* ログテーブル */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  アクション
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  リソース
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  店舗ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  IPアドレス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getActionBadgeColor(
                        log.action_type
                      )}`}
                    >
                      {log.action_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <p className="font-medium">{log.user_name || '-'}</p>
                      <p className="text-gray-500 text-xs">
                        {log.user_type} #{log.user_id}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.resource_type ? (
                      <div>
                        <p className="font-medium">
                          {log.resource_name || '-'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {log.resource_type} #{log.resource_id}
                        </p>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.store_id || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ログがありません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
