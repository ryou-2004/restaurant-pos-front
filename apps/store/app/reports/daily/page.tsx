'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchDailySalesReport } from '@/lib/api/store/reports'
import type { DailySalesReport } from '@/lib/api/store/reports'
import { ApiError } from '@/lib/api/client'

export default function DailyReportPage() {
  const [report, setReport] = useState<DailySalesReport | null>(null)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadReport()
  }, [selectedDate])

  const loadReport = async () => {
    try {
      setIsLoading(true)
      const data = await fetchDailySalesReport(selectedDate)
      setReport(data)
      setError('')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="p-8">読み込み中...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ナビゲーション */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-bold">日別売上レポート</h1>
            <button
              onClick={() => router.push('/tables')}
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
            >
              テーブル管理へ
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 px-4">
        {/* 日付選択 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">対象日</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded"
          />
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {report && (
          <>
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <SummaryCard
                title="売上合計"
                value={`¥${report.total_sales.toLocaleString()}`}
                bgColor="bg-blue-100"
              />
              <SummaryCard
                title="会計件数"
                value={`${report.payment_count}件`}
                bgColor="bg-green-100"
              />
              <SummaryCard
                title="来客数"
                value={`${report.customer_count}名`}
                bgColor="bg-yellow-100"
              />
              <SummaryCard
                title="平均客単価"
                value={`¥${report.average_bill.toLocaleString()}`}
                bgColor="bg-purple-100"
              />
            </div>

            {/* 支払い方法別 */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-bold mb-4">支払い方法別売上</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(report.by_payment_method).map(([method, amount]) => (
                  <div key={method} className="border p-4 rounded">
                    <div className="text-sm text-gray-600">{translatePaymentMethod(method)}</div>
                    <div className="text-xl font-bold">¥{amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP商品 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">売上TOP商品</h2>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">商品名</th>
                    <th className="px-4 py-2 text-right">数量</th>
                    <th className="px-4 py-2 text-right">売上</th>
                  </tr>
                </thead>
                <tbody>
                  {report.top_menu_items.map((item, index) => (
                    <tr key={item.menu_item_id} className="border-t">
                      <td className="px-4 py-2">
                        <span className="mr-2 text-gray-500">{index + 1}.</span>
                        {item.name}
                      </td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">
                        ¥{item.sales.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function SummaryCard({ title, value, bgColor }: { title: string; value: string; bgColor: string }) {
  return (
    <div className={`${bgColor} p-6 rounded-lg`}>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  )
}

function translatePaymentMethod(method: string): string {
  const translations: Record<string, string> = {
    cash: '現金',
    credit_card: 'クレジットカード',
    qr_code: 'QRコード決済',
    electronic: '電子マネー'
  }
  return translations[method] || method
}
