'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/storage'
import { WorkerSession } from '@/lib/types'
import Navbar from '@/components/Navbar'
import SupervisorDashboard from '@/components/SupervisorDashboard'

export default function SupervisorPage() {
  const [session, setSession] = useState<WorkerSession | null | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    const s = getSession()
    if (!s) {
      router.replace('/')
    } else if (s.role !== 'supervisor') {
      router.replace('/')
    } else {
      setSession(s)
    }
  }, [router])

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar session={session} onLogout={() => { setSession(null); router.replace('/') }} />
      <SupervisorDashboard />
    </div>
  )
}
