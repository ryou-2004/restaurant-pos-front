import { apiGet } from '../client'

// ========================================
// 型定義
// ========================================

const BASE_URL = 'http://localhost:3000/api/store/reports'

export interface DailySalesReport {
  date: string
  total_sales: number
  payment_count: number
  session_count: number
  customer_count: number
  average_bill: number
  by_payment_method: Record<string, number>
  top_menu_items: Array<{
    menu_item_id: number
    name: string
    quantity: number
    sales: number
  }>
  hourly_breakdown: Array<{
    hour: number
    sales: number
    count: number
  }>
}

export interface MonthlySalesReport {
  year: number
  month: number
  total_sales: number
  total_payments: number
  daily_breakdown: Array<{
    date: string
    sales: number
    payment_count: number
  }>
}

// ========================================
// API関数
// ========================================

/**
 * 日別売上レポートを取得
 */
export async function fetchDailySalesReport(date: string, storeId?: number): Promise<DailySalesReport> {
  const params = new URLSearchParams({ date })
  if (storeId) {
    params.append('store_id', storeId.toString())
  }
  return apiGet<DailySalesReport>(`${BASE_URL}/daily?${params.toString()}`)
}

/**
 * 月別売上レポートを取得
 */
export async function fetchMonthlySalesReport(
  year: number,
  month: number,
  storeId?: number
): Promise<MonthlySalesReport> {
  const params = new URLSearchParams({
    year: year.toString(),
    month: month.toString()
  })
  if (storeId) {
    params.append('store_id', storeId.toString())
  }
  return apiGet<MonthlySalesReport>(`${BASE_URL}/monthly?${params.toString()}`)
}
