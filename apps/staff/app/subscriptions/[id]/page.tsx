'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { fetchSubscription, updateSubscription } from '@/lib/api/staff/subscriptions'
import type { Subscription, SubscriptionUpdateRequest } from '@/lib/api/staff/subscriptions'
import { ApiError } from '@/lib/api/client'

export default function SubscriptionEditPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [formData, setFormData] = useState<SubscriptionUpdateRequest>({
    plan: 'basic',
    max_stores: 1,
    realtime_enabled: false,
    polling_enabled: false,
    expires_at: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const subscriptionId = Number(params.id)

  useEffect(() => {
    loadSubscription()
  }, [subscriptionId])

  const loadSubscription = async () => {
    try {
      setIsLoading(true)
      const data = await fetchSubscription(subscriptionId)
      setSubscription(data)
      setFormData({
        plan: data.plan,
        max_stores: data.max_stores,
        realtime_enabled: data.realtime_enabled,
        polling_enabled: data.polling_enabled,
        expires_at: data.expires_at.split('T')[0]
      })
      setError('')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.status === 401) {
          router.push('/login')
        } else if (err.status === 404) {
          setError('サブスクリプションが見つかりません')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsSubmitting(true)

    try {
      const updatedSubscription = await updateSubscription(subscriptionId, formData)
      setSubscription(updatedSubscription)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.errors?.join(', ') || err.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP')
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'サブスクリプションが見つかりません'}</p>
          <button
            onClick={() => router.push('/subscriptions')}
            className="text-blue-600 hover:text-blue-800"
          >
            サブスクリプション一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ナビゲーション */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/subscriptions')}
                className="text-gray-700 hover:text-gray-900 mr-4"
              >
                ← サブスクリプション一覧に戻る
              </button>
              <h1 className="text-xl font-bold">サブスクリプション編集</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            サブスクリプション情報を更新しました
          </div>
        )}

        {/* テナント情報 */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">テナント情報</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">テナント名</dt>
                <dd className="mt-1 text-sm text-gray-900">{subscription.tenant.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">サブドメイン</dt>
                <dd className="mt-1 text-sm text-gray-900">{subscription.tenant.subdomain}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* サブスクリプション編集フォーム */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">プラン設定</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* プラン選択 */}
              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                  プラン <span className="text-red-500">*</span>
                </label>
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  disabled={isSubmitting}
                >
                  <option value="basic">ベーシック</option>
                  <option value="standard">スタンダード</option>
                  <option value="enterprise">エンタープライズ</option>
                </select>
              </div>

              {/* 最大店舗数 */}
              <div>
                <label htmlFor="max_stores" className="block text-sm font-medium text-gray-700">
                  最大店舗数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="max_stores"
                  name="max_stores"
                  value={formData.max_stores}
                  onChange={handleChange}
                  required
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-sm text-gray-500">
                  テナントが作成できる店舗の最大数
                </p>
              </div>

              {/* リアルタイム更新 */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="realtime_enabled"
                    name="realtime_enabled"
                    type="checkbox"
                    checked={formData.realtime_enabled}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="realtime_enabled" className="font-medium text-gray-700">
                    リアルタイム更新（WebSocket）
                  </label>
                  <p className="text-gray-500">WebSocketによる即時データ更新を有効化</p>
                </div>
              </div>

              {/* ポーリング */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="polling_enabled"
                    name="polling_enabled"
                    type="checkbox"
                    checked={formData.polling_enabled}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="polling_enabled" className="font-medium text-gray-700">
                    ポーリング更新
                  </label>
                  <p className="text-gray-500">定期的なデータ取得による自動更新を有効化</p>
                </div>
              </div>

              {/* 有効期限 */}
              <div>
                <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">
                  有効期限 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="expires_at"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={isSubmitting}
                />
              </div>

              {/* プラン別推奨設定 */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">プラン別推奨設定</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>ベーシック:</strong> 最大店舗数1、リアルタイム無効、ポーリング無効</li>
                  <li><strong>スタンダード:</strong> 最大店舗数20、リアルタイム無効、ポーリング有効</li>
                  <li><strong>エンタープライズ:</strong> 最大店舗数無制限、リアルタイム有効、ポーリング有効</li>
                </ul>
              </div>

              {/* ボタン */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/subscriptions')}
                  disabled={isSubmitting}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? '保存中...' : '変更を保存'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 現在の設定 */}
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">現在の設定</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">現在のプラン</dt>
                <dd className="mt-1 text-sm text-gray-900">{getPlanLabel(subscription.plan)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscription.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {subscription.active ? '有効' : '無効'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">作成日時</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(subscription.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">最終更新日時</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(subscription.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  )
}
