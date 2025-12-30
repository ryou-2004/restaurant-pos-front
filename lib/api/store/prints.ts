import { apiPost } from '../client'

// ========================================
// 型定義
// ========================================

export interface PrintData {
  html: string
  order_id: number
  template_id: number
}

// ========================================
// API関数
// ========================================

/**
 * 注文の厨房チケット印刷データを取得
 */
export async function getPrintData(orderId: number): Promise<PrintData> {
  return apiPost<PrintData>(`http://localhost:3000/api/store/orders/${orderId}/print_kitchen_ticket`)
}

/**
 * 印刷結果をログに記録
 */
export async function logPrintResult(
  orderId: number,
  templateId: number,
  status: 'success' | 'failed' | 'cancelled',
  error?: string,
  printerName?: string
): Promise<void> {
  return apiPost('http://localhost:3000/api/store/print_logs', {
    print_log: {
      order_id: orderId,
      print_template_id: templateId,
      status,
      error_message: error,
      printer_name: printerName,
      printed_at: new Date().toISOString()
    }
  })
}
