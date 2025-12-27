import type { paths } from '../../../types/api'
import { apiGet } from '../client'

// ========================================
// 型定義
// ========================================
export type DailyReportResponse = paths['/api/tenant/reports/daily']['get']['responses']['200']['content']['application/json']

export type MonthlyReportResponse = paths['/api/tenant/reports/monthly']['get']['responses']['200']['content']['application/json']

export type MenuItemReportResponse = paths['/api/tenant/reports/by_menu_item']['get']['responses']['200']['content']['application/json']

// ========================================
// API関数
// ========================================
const BASE_URL = 'http://localhost:3000/api/tenant/reports'

export async function fetchDailyReport(date?: string): Promise<DailyReportResponse> {
  const url = date ? `${BASE_URL}/daily?date=${date}` : `${BASE_URL}/daily`
  return apiGet<DailyReportResponse>(url)
}

export async function fetchMonthlyReport(year?: number, month?: number): Promise<MonthlyReportResponse> {
  const params = new URLSearchParams()
  if (year) params.append('year', year.toString())
  if (month) params.append('month', month.toString())

  const queryString = params.toString()
  const url = queryString ? `${BASE_URL}/monthly?${queryString}` : `${BASE_URL}/monthly`

  return apiGet<MonthlyReportResponse>(url)
}

export async function fetchMenuItemReport(startDate?: string, endDate?: string): Promise<MenuItemReportResponse> {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const queryString = params.toString()
  const url = queryString ? `${BASE_URL}/by_menu_item?${queryString}` : `${BASE_URL}/by_menu_item`

  return apiGet<MenuItemReportResponse>(url)
}
