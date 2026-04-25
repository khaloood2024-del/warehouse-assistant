'use client'

import { useState, useEffect, useMemo } from 'react'
import { getAllRecords, exportToCSV } from '@/lib/storage'
import { InventoryRecord } from '@/lib/types'

const STATUS_STYLE: Record<string, string> = {
  'جديد':   'bg-green-100 text-green-700',
  'مستخدم': 'bg-blue-100 text-blue-700',
  'تالف':   'bg-red-100 text-red-700',
  'ناقص':   'bg-yellow-100 text-yellow-700',
}

export default function SupervisorDashboard() {
  const [records, setRecords] = useState<InventoryRecord[]>([])
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [workerFilter, setWorkerFilter] = useState('')

  // ✅ التعديل هنا (async)
  useEffect(() => {
    async function loadRecords() {
      const data = await getAllRecords()
      setRecords(data)
    }

    loadRecords()
  }, [])

  const workers = useMemo(
    () => [...new Set(records.map(r => r.worker_name))].sort(),
    [records]
  )

  const filtered = useMemo(() => {
    let list = records

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        r =>
          r.stock_number.toLowerCase().includes(q) ||
          (r.item_name ?? '').toLowerCase().includes(q) ||
          r.warehouse_location.toLowerCase().includes(q) ||
          r.worker_name.toLowerCase().includes(q)
      )
    }

    if (dateFilter) {
      list = list.filter(r => r.created_at.slice(0, 10) === dateFilter)
    }

    if (workerFilter) {
      list = list.filter(r => r.worker_name === workerFilter)
    }

    return list
  }, [records, search, dateFilter, workerFilter])

  const totalQty = useMemo(() =>
    records.reduce((s, r) => s + r.quantity, 0), [records])

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return records.filter(r => r.created_at.slice(0, 10) === today).length
  }, [records])

  const workerStats = useMemo(() => {
    const map: Record<string, number> = {}
    records.forEach(r => {
      map[r.worker_name] = (map[r.worker_name] ?? 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [records])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const clearFilters = () => {
    setSearch('')
    setDateFilter('')
    setWorkerFilter('')
  }

  const hasFilters = search || dateFilter || workerFilter

  return (
    <div className="p-4 max-w-2xl mx-auto pb-10 space-y-5">

      <div className="grid grid-cols-3 gap-3">
        <Kpi label="إجمالي السجلات" value={records.length} icon="📦" color="blue" />
        <Kpi label="إجمالي الوحدات" value={totalQty.toLocaleString('ar')} icon="🔢" color="purple" />
        <Kpi label="سجلات اليوم" value={todayCount} icon="📅" color="green" />
      </div>

      {workerStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b px-5 py-3">
            <h3 className="text-sm font-bold text-gray-500">أداء العمال</h3>
          </div>

          <div className="divide-y">
            {workerStats.map(([name, count]) => (
              <div key={name} className="px-5 py-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700">{name}</span>
                  <span className="text-sm font-bold text-blue-600">{count} سجل</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.round((count / records.length) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => exportToCSV(filtered)}
        disabled={filtered.length === 0}
        className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl"
      >
        📊 تصدير Excel ({filtered.length} سجل)
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-bold text-gray-600">🔍 بحث وتصفية</h3>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث..."
          className="w-full border rounded-xl px-4 py-3"
        />

        <div className="flex gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="flex-1 border rounded-xl px-3 py-2"
          />

          <select
            value={workerFilter}
            onChange={e => setWorkerFilter(e.target.value)}
            className="flex-1 border rounded-xl px-3 py-2"
          >
            <option value="">كل العمال</option>
            {workers.map(w => <option key={w}>{w}</option>)}
          </select>
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-gray-500">
            مسح الفلاتر
          </button>
        )}
      </div>

      {filtered.map(r => (
        <div key={r.id} className="bg-white p-4 rounded-2xl shadow-sm">
          <p className="font-bold">{r.stock_number}</p>
          <p>{r.quantity} وحدة</p>
          <p>📍 {r.warehouse_location}</p>
          <p>👤 {r.worker_name}</p>
        </div>
      ))}
    </div>
  )
}

function Kpi({ label, value, icon, color }: any) {
  return (
    <div className="bg-gray-100 rounded-2xl p-3 text-center">
      <p>{icon}</p>
      <p className="font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  )
}