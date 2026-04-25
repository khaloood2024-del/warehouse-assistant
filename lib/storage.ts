import { InventoryRecord, WorkerSession } from './types'
import { supabase } from './supabase'

const SESSION_KEY = 'wh_session'

// ── Session ──────────────────────────────────────────────
export function getSession(): WorkerSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session: WorkerSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

// ── Records from Supabase ────────────────────────────────
export async function getAllRecords(): Promise<InventoryRecord[]> {
  const { data, error } = await supabase
    .from('inventory_records')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase getAllRecords error:', error)
    return []
  }

  return data || []
}

export async function getWorkerRecords(workerName: string): Promise<InventoryRecord[]> {
  const { data, error } = await supabase
    .from('inventory_records')
    .select('*')
    .eq('worker_name', workerName)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase getWorkerRecords error:', error)
    return []
  }

  return data || []
}

export async function addRecord(
  record: Omit<InventoryRecord, 'id' | 'created_at'>
): Promise<InventoryRecord | null> {
  const { data, error } = await supabase
    .from('inventory_records')
    .insert([
      {
        worker_name: record.worker_name,
        stock_number: record.stock_number,
        quantity: record.quantity,
        warehouse_location: record.warehouse_location,
        item_name: record.item_name || null,
        item_status: record.item_status || null,
        notes: record.notes || null,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Supabase addRecord error:', error)
    alert('حدث خطأ أثناء الحفظ في قاعدة البيانات')
    return null
  }

  return data
}

// ── CSV Export ────────────────────────────────────────────
export function exportToCSV(records: InventoryRecord[]): void {
  const BOM = '\uFEFF'
  const headers = [
    'رقم الصنف',
    'الكمية',
    'موقع المستودع',
    'اسم الصنف',
    'حالة الصنف',
    'ملاحظات',
    'اسم العامل',
    'تاريخ التسجيل',
  ]

  const rows = records.map(r => [
    r.stock_number,
    r.quantity,
    r.warehouse_location,
    r.item_name ?? '',
    r.item_status ?? '',
    r.notes ?? '',
    r.worker_name,
    new Date(r.created_at).toLocaleString('ar-SA'),
  ])

  const csv =
    BOM +
    [headers, ...rows]
      .map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `warehouse_report_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}