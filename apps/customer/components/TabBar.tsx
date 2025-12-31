'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { callStaff, CALL_TYPE_LABELS, CallType } from '@/lib/api/customer/staff-calls'

export default function TabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showCallModal, setShowCallModal] = useState(false)
  const [selectedCallType, setSelectedCallType] = useState<CallType>('general')
  const [isCalling, setIsCalling] = useState(false)

  const handleStaffCallClick = () => {
    setShowCallModal(true)
  }

  const handleConfirmCall = async () => {
    setIsCalling(true)
    try {
      await callStaff({ call_type: selectedCallType })

      // バイブレーション
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }

      // 音声アラート（ブラウザのbeep音）
      if (typeof window !== 'undefined') {
        const audio = new Audio('/notification.mp3')
        audio.play().catch(() => {
          // 音声再生失敗時は無視（ファイルがない場合など）
        })
      }

      setShowCallModal(false)
      alert('スタッフを呼び出しました。少々お待ちください。')
      setSelectedCallType('general')
    } catch (err: any) {
      alert(err.message || '呼び出しに失敗しました')
    } finally {
      setIsCalling(false)
    }
  }

  const tabs = [
    {
      id: 'menu',
      label: 'メニュー',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      ),
      path: '/menu',
      action: () => router.push('/menu')
    },
    {
      id: 'orders',
      label: '注文状況',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
      ),
      path: '/orders',
      action: () => router.push('/orders')
    },
    {
      id: 'payment',
      label: 'お会計',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
          />
        </svg>
      ),
      path: '/payment',
      action: () => router.push('/payment')
    },
    {
      id: 'staff-call',
      label: '呼出',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
      ),
      path: null,
      action: handleStaffCallClick
    }
  ]

  return (
    <>
      {/* タブバー */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-40">
        <div className="grid grid-cols-4 max-w-3xl mx-auto">
          {tabs.map((tab) => {
            const isActive = tab.path && pathname === tab.path
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <div className={isActive ? 'scale-110' : ''}>
                  {tab.icon}
                </div>
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 店員呼び出しモーダル */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              スタッフを呼び出す
            </h3>
            <div className="space-y-2 mb-6">
              {(Object.entries(CALL_TYPE_LABELS) as [CallType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedCallType(type)}
                  className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                    selectedCallType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{label}</div>
                </button>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCallModal(false)}
                disabled={isCalling}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmCall}
                disabled={isCalling}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isCalling ? '呼び出し中...' : '呼び出す'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
