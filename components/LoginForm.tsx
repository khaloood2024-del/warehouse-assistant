'use client'

import { useState } from 'react'
import { saveSession } from '@/lib/storage'
import { WorkerSession } from '@/lib/types'

const SUPERVISOR_CODE = 'admin'

interface Props {
  onLogin: (session: WorkerSession) => void
}

export default function LoginForm({ onLogin }: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('يرجى إدخال اسمك أولاً')
      return
    }
    const role: WorkerSession['role'] =
      code.trim() === SUPERVISOR_CODE ? 'supervisor' : 'worker'
    const session: WorkerSession = { name: trimmed, role }
    saveSession(session)
    onLogin(session)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">📦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">مساعد المستودع</h1>
          <p className="text-gray-500 text-sm mt-1">نظام تسجيل المخزون</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              الاسم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="أدخل اسمك الكامل"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              كود المشرف{' '}
              <span className="text-gray-400 font-normal text-xs">(للمشرفين فقط)</span>
            </label>
            <input
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="اتركه فارغاً إذا كنت عاملاً"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 py-2.5 rounded-xl">
              ⚠️ {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl text-base transition-all shadow-md"
          >
            دخول →
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          كود المشرف الافتراضي:{' '}
          <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">admin</span>
        </p>
      </div>
    </div>
  )
}
