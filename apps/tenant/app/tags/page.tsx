'use client'

import { useEffect, useState } from 'react'
import { fetchTags, createTag, updateTag, deleteTag } from '@/lib/api/tenant/tags'
import type { Tag, TagCreateRequest, TagUpdateRequest } from '@/lib/api/tenant/tags'
import { ApiError } from '@/lib/api/client'

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState<TagCreateRequest>({
    name: ''
  })

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setIsLoading(true)
      const data = await fetchTags()
      setTags(data)
      setError('')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag)
      setFormData({ name: tag.name })
    } else {
      setEditingTag(null)
      setFormData({ name: '' })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTag(null)
    setFormData({ name: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData)
      } else {
        await createTag(formData)
      }
      await loadTags()
      handleCloseModal()
      setError('')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.errors?.join(', ') || err.message)
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このタグを削除しますか？')) return

    try {
      await deleteTag(id)
      await loadTags()
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
        <h1 className="text-2xl font-bold">タグ管理</h1>
        <button
          onClick={() => handleOpenModal()}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          新規作成
        </button>
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
                タグ名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                作成日時
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tags.map((tag) => (
              <tr key={tag.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {tag.id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {tag.name}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(tag.created_at).toLocaleString('ja-JP')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(tag)}
                      className="text-blue-600 hover:text-blue-800"
                      title="編集"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
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

      {tags.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          タグが登録されていません
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              {editingTag ? 'タグ編集' : 'タグ新規作成'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  タグ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  required
                  maxLength={50}
                  placeholder="例: 店長, エリアマネージャー"
                />
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
                  {editingTag ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
