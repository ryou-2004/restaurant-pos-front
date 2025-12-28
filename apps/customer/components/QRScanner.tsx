'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [manualInput, setManualInput] = useState('')

  useEffect(() => {
    // コンポーネントマウント時にスキャナーを初期化
    const initializeScanner = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader')
        scannerRef.current = scanner

        // カメラ権限をリクエストしてスキャン開始
        await scanner.start(
          { facingMode: 'environment' }, // 背面カメラを使用
          {
            fps: 10, // フレームレート
            qrbox: { width: 250, height: 250 } // スキャンボックスのサイズ
          },
          (decodedText) => {
            // QRコード検出成功
            scanner.stop()
            setIsScanning(false)
            onScanSuccess(decodedText)
          },
          (errorMessage) => {
            // スキャンエラー（継続的に発生するので無視）
            // console.log(errorMessage)
          }
        )

        setIsScanning(true)
        setError('')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'カメラの起動に失敗しました'
        setError(errorMsg)
        onScanError?.(errorMsg)
      }
    }

    initializeScanner()

    // コンポーネントアンマウント時にスキャナーを停止
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch((err) => {
          console.error('Scanner stop error:', err)
        })
      }
    }
  }, [onScanSuccess, onScanError])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop()
        setIsScanning(false)
      }
      onScanSuccess(manualInput.trim())
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* QRスキャナー表示エリア */}
      <div id="qr-reader" className="w-full max-w-md" />

      {/* エラーメッセージ */}
      {error && (
        <div className="w-full max-w-md p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-red-500 mt-2">
            カメラを使用できない場合は、下の入力欄にQRコードを手動で入力してください
          </p>
        </div>
      )}

      {/* ステータス表示 */}
      {isScanning && !error && (
        <div className="text-sm text-gray-600">
          QRコードをカメラに写してください
        </div>
      )}

      {/* 手動入力フォーム（テスト用・カメラ使用不可時） */}
      <form onSubmit={handleManualSubmit} className="w-full max-w-md space-y-2">
        <div>
          <label htmlFor="qr-input" className="block text-sm font-medium text-gray-700 mb-1">
            QRコード（手動入力）
          </label>
          <input
            id="qr-input"
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="1-1-T1-abc123..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={!manualInput.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          ログイン
        </button>
      </form>
    </div>
  )
}
