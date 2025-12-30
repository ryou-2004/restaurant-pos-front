import { apiGet, apiPatch } from '../client'

// ========================================
// 型定義
// ========================================

export type TemplateType = 'kitchen_ticket' | 'receipt' | 'label'
export type TemplateScope = 'store' | 'tenant'

export interface PrintTemplate {
  id: number
  name: string
  template_type: TemplateType
  content: string
  is_active: boolean
  settings: Record<string, any>
  scope: TemplateScope
  created_at: string
  updated_at: string
}

export interface PrintTemplateSummary {
  id: number
  name: string
  template_type: TemplateType
  is_active: boolean
  settings: Record<string, any>
  scope: TemplateScope
  created_at: string
  updated_at: string
}

export interface PrintTemplateUpdateData {
  name?: string
  content?: string
  is_active?: boolean
  settings?: Record<string, any>
}

// ========================================
// API関数
// ========================================

/**
 * 印刷テンプレート一覧を取得
 */
export async function fetchPrintTemplates(): Promise<PrintTemplateSummary[]> {
  return apiGet<PrintTemplateSummary[]>('http://localhost:3000/api/store/print_templates')
}

/**
 * 印刷テンプレート詳細を取得
 */
export async function fetchPrintTemplate(id: number): Promise<PrintTemplate> {
  return apiGet<PrintTemplate>(`http://localhost:3000/api/store/print_templates/${id}`)
}

/**
 * 印刷テンプレートを更新
 */
export async function updatePrintTemplate(
  id: number,
  data: PrintTemplateUpdateData
): Promise<PrintTemplate> {
  return apiPatch<PrintTemplate>(
    `http://localhost:3000/api/store/print_templates/${id}`,
    { print_template: data }
  )
}

/**
 * 型もエクスポート
 */
export type { PrintTemplate as Template }
