'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/storage'
import { WorkerSession } from '@/lib/types'
import Navbar from '@/components/Navbar'
import MyRecords from '@/components/MyRecords'

export default function MyRecordsPage() {
  const [session, setSession] = useState<WorkerSession | null | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    const s = getSession()
    if (!s) {
      router.replace('/')
    } else {
      setSession(s)
    }
  }, [router])

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar session={session} onLogout={() => { setSession(null); router.replace('/') }} />
      <MyRecords session={session} />
    </div>
  )
}
