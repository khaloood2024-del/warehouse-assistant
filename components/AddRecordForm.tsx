'use client'

import { useState, useRef } from 'react'
import { addRecord } from '@/lib/storage'
import { ItemStatus, WorkerSession } from '@/lib/types'

const STATUSES: ItemStatus[] = ['جديد', 'مستخدم', 'تالف', 'ناقص']

const STATUS_STYLE: Record<ItemStatus, string> = {
  'جديد':   'bg-green-100 text-green-700 border-green-300',
  'مستخدم': 'bg-blue-100 text-blue-700 border-blue-300',
  'تالف':   'bg-red-100 text-red-700 border-red-300',
  'ناقص':   'bg-yellow-100 text-yellow-700 border-yellow-300',
}

interface Props {
  session: WorkerSession
}

export default function AddRecordForm({ session }: Props) {
  // Required
  const [stockNumber, setStockNumber] = useState('')
  const [quantity, setQuantity] = useState('')
  const [location, setLocation] = useState('')
  // Optional
  const [itemName, setItemName] = useState('')
  const [itemStatus, setItemStatus] = useState<ItemStatus | ''>('')
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)

  const stockRef = useRef<HTMLInputElement>(null)

  const clearErr = (k: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[k]; return n })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!stockNumber.trim()) e.stock = 'رقم الصنف مطلوب'
    if (!quantity.trim()) e.qty = 'الكمية مطلوبة'
    else if (isNaN(Number(quantity)) || Number(quantity) <= 0)
      e.qty = 'الكمية يجب أن تكون رقماً أكبر من صفر'
    if (!location.trim()) e.loc = 'موقع المستودع مطلوب'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 150)) // small delay for feel

    addRecord({
      worker_name: session.name,
      stock_number: stockNumber.trim(),
      quantity: Number(quantity),
      warehouse_location: location.trim(),
      item_name: itemName.trim() || undefined,
      item_status: itemStatus || undefined,
      notes: notes.trim() || undefined,
    })

    // Reset form
    setStockNumber('')
    setQuantity('')
    setLocation('')
    setItemName('')
    setItemStatus('')
    setNotes('')
    setErrors({})
    setSaving(false)
    setSavedCount(c => c + 1)
    stockRef.current?.focus()
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-10">

      {/* Success banner */}
      {savedCount > 0 && (
        <div
          key={savedCount}
          className="bg-green-50 border-2 border-green-200 text-green-700 rounded-2xl px-5 py-4 text-center"
        >
          <p className="text-lg font-bold">✅ تم الحفظ بنجاح!</p>
          <p className="text-sm mt-0.5 text-green-600">
            تم تسجيل {savedCount} {savedCount === 1 ? 'صنف' : 'أصناف'} — جاهز للإضافة
          </p>
        </div>
      )}

      {/* ── Required ── */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-blue-600 px-5 py-3">
          <h2 className="text-white font-bold text-sm tracking-wide">
            الحقول المطلوبة ★
          </h2>
        </div>
        <div className="p-5 space-y-5">

          <Field label="رقم الصنف" required error={errors.stock}>
            <input
              ref={stockRef}
              type="text"
              value={stockNumber}
              onChange={e => { setStockNumber(e.target.value); clearErr('stock') }}
              placeholder="مثال: STK-001"
              className={inp(!!errors.stock)}
            />
          </Field>

          <Field label="الكمية" required error={errors.qty}>
            <input
              type="number"
              inputMode="numeric"
              value={quantity}
              onChange={e => { setQuantity(e.target.value); clearErr('qty') }}
              placeholder="0"
              min="1"
              className={inp(!!errors.qty)}
            />
          </Field>

          <Field label="موقع المستودع" required error={errors.loc}>
            <input
              type="text"
              value={location}
              onChange={e => { setLocation(e.target.value); clearErr('loc') }}
              placeholder="مثال: رف A-3 / قسم 2"
              className={inp(!!errors.loc)}
            />
          </Field>

        </div>
      </section>

      {/* ── Optional ── */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gray-100 border-b border-gray-200 px-5 py-3">
          <h2 className="text-gray-500 font-bold text-sm tracking-wide">
            حقول اختيارية
          </h2>
        </div>
        <div className="p-5 space-y-5">

          <Field label="اسم الصنف">
            <input
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="اسم المنتج أو الصنف"
              className={inp(false)}
            />
          </Field>

          <Field label="حالة الصنف">
            <div className="flex flex-wrap gap-2 mt-1">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setItemStatus(prev => prev === s ? '' : s)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    itemStatus === s
                      ? STATUS_STYLE[s]
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <Field label="ملاحظات">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية..."
              rows={3}
              className={inp(false) + ' resize-none'}
            />
          </Field>

        </div>
      </section>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-5 rounded-2xl text-lg transition-all shadow-md shadow-blue-200"
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            جاري الحفظ...
          </span>
        ) : (
          '💾 حفظ الصنف'
        )}
      </button>
    </div>
  )
}

// ── helpers ────────────────────────────────────────────────

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-red-500 text-sm flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

function inp(hasErr: boolean) {
  return [
    'w-full border-2 rounded-xl px-4 py-3.5 text-base',
    'focus:outline-none focus:border-blue-500 transition-colors',
    hasErr
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 bg-gray-50',
  ].join(' ')
}
