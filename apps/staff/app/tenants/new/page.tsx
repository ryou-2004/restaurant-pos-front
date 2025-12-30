'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTenant } from '@/lib/api/staff/tenants'
import type { TenantCreateRequest } from '@/lib/api/staff/tenants'
import { ApiError } from '@/lib/api/client'

export default function NewTenantPage() {
  const [formData, setFormData] = useState<TenantCreateRequest>({
    name: '',
    subdomain: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateSubdomain = (subdomain: string): boolean => {
    const regex = /^[a-z0-9-]+$/
    return regex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 63
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('テナント名を入力してください')
      return
    }

    if (!formData.subdomain.trim()) {
      setError('サブドメインを入力してください')
      return
    }

    if (!validateSubdomain(formData.subdomain)) {
      setError('サブドメインは半角英数字とハイフンのみ使用でき、3〜63文字である必要があります')
      return
    }

    setIsSubmitting(true)

    try {
      const newTenant = await createTenant(formData)
      router.push(`/tenants/${newTenant.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.errors?.join(', ') || err.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/tenants')
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
              <h1 className="text-xl font-bold">新規テナント作成</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              テナント情報を入力してください
            </h2>

            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* テナント名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  テナント名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="例: 山田飲食店"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-sm text-gray-500">
                  店舗やチェーンの名称を入力してください
                </p>
              </div>

              {/* サブドメイン */}
              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                  サブドメイン <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    required
                    pattern="[a-z0-9-]+"
                    className="flex-1 block w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="例: yamada-restaurant"
                    disabled={isSubmitting}
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    .example.com
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  半角英数字とハイフンのみ使用可能（3〜63文字）
                </p>
              </div>

              {/* 注意事項 */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  作成時の注意事項
                </h3>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li>テナント作成時に、デフォルトでBasicプランのサブスクリプションが自動作成されます</li>
                  <li>最大店舗数: 1店舗</li>
                  <li>リアルタイム更新: 無効</li>
                  <li>有効期限: 1年後</li>
                </ul>
              </div>

              {/* ボタン */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
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
                  {isSubmitting ? '作成中...' : 'テナントを作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
