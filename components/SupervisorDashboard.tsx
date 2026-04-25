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

  useEffect(() => {
    setRecords(getAllRecords())
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
    records.forEach(r => { map[r.worker_name] = (map[r.worker_name] ?? 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [records])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ar-SA', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const clearFilters = () => {
    setSearch(''); setDateFilter(''); setWorkerFilter('')
  }

  const hasFilters = search || dateFilter || workerFilter

  return (
    <div className="p-4 max-w-2xl mx-auto pb-10 space-y-5">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="إجمالي السجلات" value={records.length} icon="📦" color="blue" />
        <Kpi label="إجمالي الوحدات" value={totalQty.toLocaleString('ar')} icon="🔢" color="purple" />
        <Kpi label="سجلات اليوم" value={todayCount} icon="📅" color="green" />
      </div>

      {/* ── Worker breakdown ── */}
      {workerStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
            <h3 className="text-sm font-bold text-gray-500">أداء العمال</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {workerStats.map(([name, count]) => (
              <div key={name} className="px-5 py-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700">{name}</span>
                  <span className="text-sm font-bold text-blue-600">{count} سجل</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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

      {/* ── Export ── */}
      <button
        onClick={() => exportToCSV(filtered)}
        disabled={filtered.length === 0}
        className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-base transition-all shadow-md shadow-green-200 flex items-center justify-center gap-2"
      >
        <span>📊</span>
        تصدير Excel ({filtered.length} سجل)
      </button>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-bold text-gray-600">🔍 بحث وتصفية</h3>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث برقم الصنف، الاسم، الموقع، العامل..."
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
        />

        <div className="flex gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
          />
          <select
            value={workerFilter}
            onChange={e => setWorkerFilter(e.target.value)}
            className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
          >
            <option value="">كل العمال</option>
            {workers.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-600 font-semibold">
              {filtered.length} من {records.length} سجل
            </p>
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 underline">
              مسح الفلاتر ✕
            </button>
          </div>
        )}
      </div>

      {/* ── Records ── */}
      {records.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-gray-500">لا توجد سجلات حتى الآن</p>
          <p className="text-gray-400 text-sm mt-1">سيظهر هنا كل ما يسجله العمال</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500">لا توجد نتائج للبحث</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 text-center">{filtered.length} سجل • الأحدث أولاً</p>
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 truncate">{r.stock_number}</p>
                  {r.item_name && <p className="text-gray-500 text-sm truncate">{r.item_name}</p>}
                </div>
                <span className="shrink-0 bg-blue-50 text-blue-700 font-bold text-sm px-3 py-1.5 rounded-full">
                  {r.quantity} وحدة
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  📍 {r.warehouse_location}
                </span>
                {r.item_status && (
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLE[r.item_status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {r.item_status}
                  </span>
                )}
                <span className="bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full">
                  👤 {r.worker_name}
                </span>
              </div>
              {r.notes && (
                <p className="mt-3 pt-3 border-t border-gray-100 text-gray-500 text-sm">{r.notes}</p>
              )}
              <p className="mt-2 text-gray-300 text-xs">{formatDate(r.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value, icon, color }: {
  label: string; value: number | string; icon: string; color: 'blue' | 'purple' | 'green'
}) {
  const cls = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    green: 'bg-green-50 text-green-700',
  }[color]
  return (
    <div className={`${cls} rounded-2xl p-3 text-center`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xl font-bold leading-tight">{value}</p>
      <p className="text-xs opacity-70 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}
