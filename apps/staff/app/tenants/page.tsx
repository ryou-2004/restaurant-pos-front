'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchTenants } from '@/lib/api/staff/tenants'
import type { Tenant } from '@/lib/api/staff/tenants'
import { ApiError } from '@/lib/api/client'

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      setIsLoading(true)
      const data = await fetchTenants()
      setTenants(data)
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
                  className="text-blue-600 font-semibold"
                >
                  テナント管理
                </button>
                <button
                  onClick={() => router.push('/subscriptions')}
                  className="text-gray-700 hover:text-gray-900"
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
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">テナント一覧</h2>
          <button
            onClick={() => router.push('/tenants/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            新規テナント作成
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* テナント一覧テーブル */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  テナント名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  サブドメイン
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プラン
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    テナントが登録されていません
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.subdomain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tenant.user_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tenant.subscription && (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadgeColor(tenant.subscription.plan)}`}>
                          {tenant.subscription.plan}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(tenant.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/tenants/${tenant.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 統計情報 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                総テナント数
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {tenants.length}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                総ユーザー数
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {tenants.reduce((sum, t) => sum + t.user_count, 0)}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                アクティブプラン
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {tenants.filter(t => t.subscription?.active).length}
              </dd>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
