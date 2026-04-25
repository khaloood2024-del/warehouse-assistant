'use client'

import { useState, useEffect } from 'react'
import { getWorkerRecords } from '@/lib/storage'
import { InventoryRecord, WorkerSession } from '@/lib/types'

const STATUS_STYLE: Record<string, string> = {
  'جديد':   'bg-green-100 text-green-700',
  'مستخدم': 'bg-blue-100 text-blue-700',
  'تالف':   'bg-red-100 text-red-700',
  'ناقص':   'bg-yellow-100 text-yellow-700',
}

interface Props {
  session: WorkerSession
}

export default function MyRecords({ session }: Props) {
  const [records, setRecords] = useState<InventoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  async function loadRecords() {
    const data = await getWorkerRecords(session.name)
    setRecords(data)
    setLoading(false)
  }

  loadRecords()
}, [session.name])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">سجلاتي</h2>
        <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
          {records.length} سجل
        </span>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-500 font-medium">لا توجد سجلات بعد</p>
          <p className="text-gray-400 text-sm mt-1">ابدأ بإضافة أول صنف من صفحة الإضافة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(r => (
            <RecordCard key={r.id} record={r} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  )
}

function RecordCard({
  record, formatDate,
}: {
  record: InventoryRecord
  formatDate: (s: string) => string
}) {
  const STATUS_STYLE: Record<string, string> = {
    'جديد':   'bg-green-100 text-green-700',
    'مستخدم': 'bg-blue-100 text-blue-700',
    'تالف':   'bg-red-100 text-red-700',
    'ناقص':   'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-gray-800 text-base truncate">{record.stock_number}</p>
          {record.item_name && (
            <p className="text-gray-500 text-sm truncate">{record.item_name}</p>
          )}
        </div>
        <span className="shrink-0 bg-blue-50 text-blue-700 font-bold text-sm px-3 py-1.5 rounded-full whitespace-nowrap">
          {record.quantity} وحدة
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
          📍 {record.warehouse_location}
        </span>
        {record.item_status && (
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLE[record.item_status] ?? 'bg-gray-100 text-gray-600'}`}>
            {record.item_status}
          </span>
        )}
      </div>

      {/* Notes */}
      {record.notes && (
        <p className="mt-3 pt-3 border-t border-gray-100 text-gray-500 text-sm leading-relaxed">
          {record.notes}
        </p>
      )}

      {/* Date */}
      <p className="mt-2 text-gray-300 text-xs">{formatDate(record.created_at)}</p>
    </div>
  )
}
