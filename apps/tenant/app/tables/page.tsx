'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchTables, createTable, updateTable, deleteTable } from '@/lib/api/tenant/tables'
import type { Table, TableCreateRequest, TableUpdateRequest } from '@/lib/api/tenant/tables'
import { ApiError } from '@/lib/api/client'

// Store型（仮定）
type Store = {
  id: number
  name: string
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState<TableCreateRequest & { id?: number }>({
    store_id: 0,
    number: '',
    capacity: 4,
    status: 'available'
  })
  const router = useRouter()

  const statusLabels: Record<string, string> = {
    available: '空席',
    occupied: '使用中',
    reserved: '予約済み',
    cleaning: '清掃中'
  }

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    cleaning: 'bg-gray-100 text-gray-800'
  }

  useEffect(() => {
    loadTables()
    loadStores()
  }, [])

  const loadTables = async () => {
    try {
      setIsLoading(true)
      const data = await fetchTables()
      setTables(data)
      setError('')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadStores = async () => {
    try {
      // 店舗一覧を取得（stores APIから）
      const response = await fetch('http://localhost:3000/api/tenant/stores', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tenant_token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (err) {
      console.error('店舗一覧取得エラー:', err)
    }
  }

  const handleOpenModal = (table?: Table) => {
    if (table) {
      setEditingTable(table)
      setFormData({
        store_id: table.store_id,
        number: table.number,
        capacity: table.capacity,
        status: table.status
      })
    } else {
      setEditingTable(null)
      setFormData({
        store_id: stores[0]?.id || 0,
        number: '',
        capacity: 4,
        status: 'available'
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTable(null)
    setFormData({
      store_id: 0,
      number: '',
      capacity: 4,
      status: 'available'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTable) {
        await updateTable(editingTable.id, {
          number: formData.number,
          capacity: formData.capacity,
          status: formData.status
        })
      } else {
        await createTable(formData)
      }
      await loadTables()
      handleCloseModal()
      setError('')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.errors?.join(', ') || err.message)
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このテーブルを削除しますか？')) return

    try {
      await deleteTable(id)
      await loadTables()
      setError('')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.errors?.join(', ') || err.message)
      }
    }
  }

  if (isLoading) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">テーブル管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            ダッシュボードへ
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            新規作成
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                店舗
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                テーブル番号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                収容人数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                QRコード
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tables.map((table) => (
              <tr key={table.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {table.id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {table.store_name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {table.number}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {table.capacity}名
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[table.status]}`}>
                    {statusLabels[table.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <code className="text-xs">{table.qr_code?.slice(0, 20)}...</code>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(table)}
                      className="text-blue-600 hover:text-blue-800"
                      title="編集"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="text-red-600 hover:text-red-800"
                      title="削除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tables.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          テーブルが登録されていません
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              {editingTable ? 'テーブル編集' : 'テーブル新規作成'}
            </h2>
            <form onSubmit={handleSubmit}>
              {!editingTable && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    店舗 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.store_id}
                    onChange={(e) => setFormData({ ...formData, store_id: parseInt(e.target.value) })}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value={0}>選択してください</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  テーブル番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  required
                  maxLength={10}
                  placeholder="例: T1, テーブル1"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  収容人数
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  min={1}
                  max={20}
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ステータス
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="available">空席</option>
                  <option value="occupied">使用中</option>
                  <option value="reserved">予約済み</option>
                  <option value="cleaning">清掃中</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  {editingTable ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
