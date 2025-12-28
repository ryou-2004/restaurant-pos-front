'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QRScanner from '../../components/QRScanner'
import { loginViaQR } from '@/lib/api/customer/auth'

export default function ScanPage() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleScanSuccess = async (qrCode: string) => {
    setIsLoading(true)
    setError('')

    try {
      // QRログインAPI呼び出し
      const response = await loginViaQR(qrCode)

      // トークンとセッション情報を保存
      localStorage.setItem('customer_token', response.token)
      localStorage.setItem('customer_session', JSON.stringify(response.session))

      // メニューページへリダイレクト
      router.push('/menu')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'ログインに失敗しました'
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  const handleScanError = (errorMsg: string) => {
    setError(errorMsg)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">セルフオーダー</h1>
          <p className="mt-2 text-sm text-gray-600">
            テーブルのQRコードをスキャンしてください
          </p>
        </div>

        {/* QRスキャナー */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-sm text-gray-600">ログイン中...</p>
            </div>
          ) : (
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
          )}
        </div>

        {/* エラーメッセージ */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 使い方ガイド */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">使い方</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>テーブルのQRコードをカメラに写してください</li>
            <li>自動的にスキャンされます</li>
            <li>ログイン後、メニューから注文できます</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
