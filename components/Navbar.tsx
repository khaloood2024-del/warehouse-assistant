'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WorkerSession } from '@/lib/types'
import { clearSession } from '@/lib/storage'

interface Props {
  session: WorkerSession
  onLogout: () => void
}

export default function Navbar({ session, onLogout }: Props) {
  const pathname = usePathname()

  const handleLogout = () => {
    clearSession()
    onLogout()
  }

  const linkClass = (href: string) =>
    `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
      pathname === href
        ? 'bg-white text-blue-600'
        : 'text-white/80 hover:text-white hover:bg-white/20'
    }`

  return (
    <header className="bg-blue-600 shadow-md sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Name + role */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">📦</span>
          <div className="min-w-0">
            <p className="text-white font-bold leading-tight truncate text-sm">{session.name}</p>
            <p className="text-blue-200 text-xs leading-tight">
              {session.role === 'supervisor' ? '🔑 مشرف' : '👷 عامل'}
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-shrink-0">
          <Link href="/" className={linkClass('/')}>
            ➕ إضافة
          </Link>
          <Link href="/my-records" className={linkClass('/my-records')}>
            📋 سجلاتي
          </Link>
          {session.role === 'supervisor' && (
            <Link href="/supervisor" className={linkClass('/supervisor')}>
              📊 لوحة
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            خروج
          </button>
        </nav>
      </div>
    </header>
  )
}
