'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTableSession } from '@/lib/api/store/table-sessions'
import TableMap from '../../components/TableMap'

interface Table {
  id: number
  number: string
  capacity: number
  status: 'available' | 'reserved' | 'occupied'
  qr_code: string
  position_x: number
  position_y: number
  shape: 'square' | 'rectangle' | 'circle'
}

interface TableSession {
  id: number
  table_id: number
  party_size?: number
  status: 'active' | 'completed'
  started_at: string
  duration_minutes: number
}

export default function TablesPage() {
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [sessions, setSessions] = useState<{ [key: number]: TableSession }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [partySize, setPartySize] = useState<number>(2)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map')  // デフォルトはマップ表示

  useEffect(() => {
    const session = localStorage.getItem('store_session')
    if (!session) {
      router.push('/login')
      return
    }

    loadTables()
    loadActiveSessions()

    // 30秒ごとに更新
    const interval = setInterval(() => {
      loadTables()
      loadActiveSessions()
    }, 30000)

    return () => clearInterval(interval)
  }, [router])

  const loadTables = async () => {
    try {
      const token = localStorage.getItem('store_token')
      const response = await fetch('http://localhost:3000/api/store/tables', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTables(data)
      }
    } catch (err) {
      console.error('テーブル取得エラー:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadActiveSessions = async () => {
    // TODO: アクティブなセッション一覧APIが必要
    // 現時点では空のまま
  }

  const handleStartSession = (table: Table) => {
    setSelectedTable(table)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedTable(null)
    setPartySize(2)
    setError('')
  }

  const handleCreateSession = async () => {
    if (!selectedTable) return

    setIsCreating(true)
    setError('')

    try {
      await createTableSession({
        table_id: selectedTable.id,
        party_size: partySize
      })

      // 成功したらモーダルを閉じて再読み込み
      handleCloseModal()
      loadTables()
      loadActiveSessions()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'セッション作成に失敗しました'
      setError(errorMsg)
    } finally {
      setIsCreating(false)
    }
  }

  const getTableStatus = (table: Table) => {
    const session = sessions[table.id]
    if (session && session.status === 'active') {
      return {
        label: '使用中',
        color: 'bg-red-100 text-red-800 border-red-200'
      }
    }
    return {
      label: '空席',
      color: 'bg-green-100 text-green-800 border-green-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">テーブル管理</h1>
          <p className="mt-2 text-sm text-gray-600">
            顧客を案内してセッションを開始してください
          </p>
        </div>

        {/* 表示切替ボタン */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            マップ表示
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            リスト表示
          </button>
        </div>
      </div>

      {/* マップ表示 */}
      {viewMode === 'map' && (
        <div className="max-w-7xl mx-auto">
          <TableMap
            tables={tables}
            sessions={sessions}
            onTableClick={handleStartSession}
          />
        </div>
      )}

      {/* リスト表示 */}
      {viewMode === 'list' && (
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => {
          const status = getTableStatus(table)
          const session = sessions[table.id]
          const isAvailable = !session || session.status !== 'active'

          return (
            <div
              key={table.id}
              className={`border-2 rounded-lg p-6 ${status.color} transition-all hover:shadow-lg`}
            >
              {/* テーブル番号 */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-1">テーブル</p>
                <p className="text-4xl font-bold text-gray-900">{table.number}</p>
                <p className="text-xs text-gray-500 mt-1">{table.capacity}名様まで</p>
              </div>

              {/* ステータス */}
              <div className="text-center mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium">
                  {status.label}
                </span>
              </div>

              {/* セッション情報 */}
              {session && session.status === 'active' && (
                <div className="mb-4 p-3 bg-white bg-opacity-50 rounded text-xs">
                  <p className="text-gray-700">
                    👥 {session.party_size || '?'}名
                  </p>
                  <p className="text-gray-700">
                    ⏱️ {session.duration_minutes}分経過
                  </p>
                </div>
              )}

              {/* アクションボタン */}
              {isAvailable ? (
                <button
                  onClick={() => handleStartSession(table)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  案内する
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed font-medium"
                >
                  使用中
                </button>
              )}
            </div>
          )
        })}
        </div>
      )}

      {/* 案内モーダル */}
      {showModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              テーブル {selectedTable.number} に案内
            </h2>

            {/* 人数入力 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                人数
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                  disabled={isCreating}
                >
                  −
                </button>
                <span className="text-3xl font-bold w-16 text-center">
                  {partySize}
                </span>
                <button
                  onClick={() => setPartySize(Math.min(20, partySize + 1))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                  disabled={isCreating}
                >
                  ＋
                </button>
                <span className="text-gray-600">名様</span>
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex space-x-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                disabled={isCreating}
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateSession}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isCreating}
              >
                {isCreating ? '案内中...' : '案内開始'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
