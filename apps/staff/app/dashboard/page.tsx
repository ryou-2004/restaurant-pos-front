'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchTenants } from '@/lib/api/staff/tenants'
import { fetchSubscriptions } from '@/lib/api/staff/subscriptions'
import type { Tenant } from '@/lib/api/staff/tenants'
import type { Subscription } from '@/lib/api/staff/subscriptions'
import { ApiError } from '@/lib/api/client'

interface User {
  id: number
  name: string
  email: string
  role: string
  user_type: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [tenantsData, subscriptionsData] = await Promise.all([
        fetchTenants(),
        fetchSubscriptions()
      ])
      setTenants(tenantsData)
      setSubscriptions(subscriptionsData)
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

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt)
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
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
              <h1 className="text-xl font-bold">スタッフ管理</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-blue-600 font-semibold"
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
                  className="text-gray-700 hover:text-gray-900"
                >
                  サブスクリプション
                </button>
              </div>
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
        {/* ウェルカムメッセージ */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">ようこそ、{user?.name}さん</h2>
          <p className="mt-1 text-sm text-gray-500">
            システム管理ダッシュボード
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                期限切れ警告
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-orange-600">
                {subscriptions.filter(s => isExpiringSoon(s.expires_at) || isExpired(s.expires_at)).length}
              </dd>
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">クイックアクション</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/tenants/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow"
              >
                新規テナント作成
              </button>
              <button
                onClick={() => router.push('/tenants')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg shadow"
              >
                テナント一覧を見る
              </button>
              <button
                onClick={() => router.push('/subscriptions')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg shadow"
              >
                サブスクリプション管理
              </button>
            </div>
          </div>
        </div>

        {/* アラート */}
        {subscriptions.filter(s => isExpired(s.expires_at)).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              ⚠️ 期限切れプランがあります
            </h3>
            <p className="text-sm text-red-700">
              {subscriptions.filter(s => isExpired(s.expires_at)).length}件のサブスクリプションが期限切れです。
              サブスクリプション管理画面で更新してください。
            </p>
          </div>
        )}

        {subscriptions.filter(s => isExpiringSoon(s.expires_at) && !isExpired(s.expires_at)).length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-orange-800 mb-2">
              📅 期限切れ間近のプランがあります
            </h3>
            <p className="text-sm text-orange-700">
              {subscriptions.filter(s => isExpiringSoon(s.expires_at) && !isExpired(s.expires_at)).length}件のサブスクリプションが30日以内に期限切れとなります。
            </p>
          </div>
        )}

        {/* ユーザー情報 */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ログイン情報</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">ユーザーID</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">名前</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ロール</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.role}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  )
}
