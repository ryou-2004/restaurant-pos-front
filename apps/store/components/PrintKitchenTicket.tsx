'use client'

import { useEffect, useRef } from 'react'
import { getPrintData, logPrintResult } from '@/lib/api/store/prints'

// ========================================
// 型定義
// ========================================

interface PrintKitchenTicketProps {
  orderId: number
  autoPrint?: boolean
  onPrintComplete?: () => void
  onPrintError?: (error: string) => void
}

// ========================================
// コンポーネント
// ========================================

export default function PrintKitchenTicket({
  orderId,
  autoPrint = false,
  onPrintComplete,
  onPrintError
}: PrintKitchenTicketProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // 自動印刷
  useEffect(() => {
    if (autoPrint) {
      handlePrint()
    }
  }, [autoPrint, orderId])

  // 印刷処理
  const handlePrint = async () => {
    try {
      // バックエンドから印刷用HTMLを取得
      const printData = await getPrintData(orderId)

      // 非表示iframeにHTMLを読み込み
      const iframe = iframeRef.current
      if (!iframe) {
        throw new Error('印刷用iframeが見つかりません')
      }

      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (!doc) {
        throw new Error('印刷用ドキュメントにアクセスできません')
      }

      doc.open()
      doc.write(printData.html)
      doc.close()

      // 印刷実行
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()

      // 印刷成功をログ
      await logPrintResult(orderId, printData.template_id, 'success')

      onPrintComplete?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('印刷エラー:', errorMessage)

      // 印刷失敗をログ
      try {
        await logPrintResult(orderId, 0, 'failed', errorMessage)
      } catch (logError) {
        console.error('ログ記録エラー:', logError)
      }

      onPrintError?.(errorMessage)
    }
  }

  return (
    <>
      <button
        onClick={handlePrint}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        厨房チケット印刷
      </button>

      {/* 非表示iframe */}
      <iframe
        ref={iframeRef}
        style={{ display: 'none' }}
        title="print-frame"
      />
    </>
  )
}
