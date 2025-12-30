'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchSubscriptions } from '@/lib/api/staff/subscriptions'
import type { Subscription } from '@/lib/api/staff/subscriptions'
import { ApiError } from '@/lib/api/client'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true)
      const data = await fetchSubscriptions()
      setSubscriptions(data)
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800'
      case 'standard':
        return 'bg-blue-100 text-blue-800'
      case 'basic':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'エンタープライズ'
      case 'standard':
        return 'スタンダード'
      case 'basic':
      default:
        return 'ベーシック'
    }
  }

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt)
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ナビゲーション */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">スタッフ管理</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  ダッシュボード
                </button>
                <button
                  onClick={() => router.push('/tenants')}
                  className="text-gray-700 hover:text-gray-900"
                >
                  テナント管理
                </button>
                <button
                  onClick={() => router.push('/subscriptions')}
                  className="text-blue-600 font-semibold"
                >
                  サブスクリプション
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">サブスクリプション一覧</h2>
          <p className="mt-1 text-sm text-gray-500">
            全テナントのプラン情報と有効期限を管理します
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* サブスクリプション一覧テーブル */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  テナント
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プラン
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最大店舗数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  機能
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  有効期限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    サブスクリプションが登録されていません
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.tenant.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.tenant.subdomain}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadgeColor(subscription.plan)}`}>
                        {getPlanLabel(subscription.plan)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.max_stores}店舗
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col space-y-1">
                        {subscription.realtime_enabled && (
                          <span className="text-xs text-green-600">WebSocket</span>
                        )}
                        {subscription.polling_enabled && (
                          <span className="text-xs text-blue-600">Polling</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subscription.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {subscription.active ? '有効' : '無効'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`${isExpired(subscription.expires_at) ? 'text-red-600 font-semibold' : isExpiringSoon(subscription.expires_at) ? 'text-orange-600' : 'text-gray-900'}`}>
                        {formatDate(subscription.expires_at)}
                        {isExpiringSoon(subscription.expires_at) && !isExpired(subscription.expires_at) && (
                          <div className="text-xs text-orange-600 mt-1">まもなく期限切れ</div>
                        )}
                        {isExpired(subscription.expires_at) && (
                          <div className="text-xs text-red-600 mt-1">期限切れ</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/subscriptions/${subscription.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        編集
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 統計情報 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                総サブスクリプション数
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {subscriptions.length}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                有効プラン数
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {subscriptions.filter(s => s.active).length}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                期限切れ間近
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-orange-600">
                {subscriptions.filter(s => isExpiringSoon(s.expires_at) && !isExpired(s.expires_at)).length}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                期限切れ
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600">
                {subscriptions.filter(s => isExpired(s.expires_at)).length}
              </dd>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
