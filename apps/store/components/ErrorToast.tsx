'use client'

import { useEffect } from 'react'

interface ErrorToastProps {
  message: string
  onClose: () => void
  duration?: number
}

/**
 * エラートースト通知コンポーネント
 */
export default function ErrorToast({ message, onClose, duration = 5000 }: ErrorToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-red-600 text-white rounded-lg shadow-lg p-4 pr-12 max-w-md">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="font-medium">エラー</p>
            <p className="text-sm opacity-90 mt-1">{message}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:bg-red-700 rounded p-1 transition-colors"
          aria-label="閉じる"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
