export type ItemStatus = 'جديد' | 'مستخدم' | 'تالف' | 'ناقص'

export interface InventoryRecord {
  id: string
  worker_name: string
  stock_number: string
  quantity: number
  warehouse_location: string
  item_name?: string
  item_status?: ItemStatus
  notes?: string
  created_at: string
}

export interface WorkerSession {
  name: string
  role: 'worker' | 'supervisor'
}
