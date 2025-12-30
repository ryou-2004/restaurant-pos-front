'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { fetchTenant, updateTenant } from '@/lib/api/staff/tenants'
import type { Tenant, TenantUpdateRequest } from '@/lib/api/staff/tenants'
import { ApiError } from '@/lib/api/client'

export default function TenantDetailPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<TenantUpdateRequest>({
    name: '',
    subdomain: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const tenantId = Number(params.id)

  useEffect(() => {
    loadTenant()
  }, [tenantId])

  const loadTenant = async () => {
    try {
      setIsLoading(true)
      const data = await fetchTenant(tenantId)
      setTenant(data)
      setFormData({
        name: data.name,
        subdomain: data.subdomain
      })
      setError('')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.status === 401) {
          router.push('/login')
        } else if (err.status === 404) {
          setError('テナントが見つかりません')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const updatedTenant = await updateTenant(tenantId, formData)
      setTenant(updatedTenant)
      setIsEditing(false)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.errors?.join(', ') || err.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        subdomain: tenant.subdomain
      })
    }
    setIsEditing(false)
    setError('')
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

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'テナントが見つかりません'}</p>
          <button
            onClick={() => router.push('/tenants')}
            className="text-blue-600 hover:text-blue-800"
          >
            テナント一覧に戻る
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
                onClick={() => router.push('/tenants')}
                className="text-gray-700 hover:text-gray-900 mr-4"
              >
                ← テナント一覧に戻る
              </button>
              <h1 className="text-xl font-bold">テナント詳細</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メイン情報 */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">基本情報</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      編集
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        テナント名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        サブドメイン <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subdomain"
                        value={formData.subdomain}
                        onChange={handleChange}
                        required
                        pattern="[a-z0-9-]+"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={isSubmitting}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        半角英数字とハイフンのみ使用可能
                      </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSubmitting ? '保存中...' : '保存'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">テナントID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tenant.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">テナント名</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tenant.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">サブドメイン</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tenant.subdomain}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ユーザー数</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tenant.user_count}名</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">作成日時</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(tenant.created_at)}</dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
          </div>

          {/* サイドバー - サブスクリプション情報 */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">サブスクリプション</h3>
                {tenant.subscription ? (
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">プラン</dt>
                      <dd className="mt-1">
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {getPlanLabel(tenant.subscription.plan)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">最大店舗数</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tenant.subscription.max_stores}店舗</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">リアルタイム更新</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {tenant.subscription.realtime_enabled ? '有効' : '無効'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ポーリング</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {tenant.subscription.polling_enabled ? '有効' : '無効'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tenant.subscription.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {tenant.subscription.active ? '有効' : '無効'}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">有効期限</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(tenant.subscription.expires_at)}
                      </dd>
                    </div>
                    <div className="pt-4 border-t">
                      <button
                        onClick={() => router.push(`/subscriptions/${tenant.subscription.id}`)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded"
                      >
                        プラン変更
                      </button>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">サブスクリプション情報がありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
