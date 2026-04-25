'use client'

import { useState, useEffect } from 'react'
import { getSession } from '@/lib/storage'
import { WorkerSession } from '@/lib/types'
import LoginForm from '@/components/LoginForm'
import Navbar from '@/components/Navbar'
import AddRecordForm from '@/components/AddRecordForm'

export default function HomePage() {
  const [session, setSession] = useState<WorkerSession | null | undefined>(undefined)

  useEffect(() => {
    setSession(getSession())
  }, [])

  if (session === undefined) return null

  if (!session) {
    return <LoginForm onLogin={setSession} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar session={session} onLogout={() => setSession(null)} />
      <AddRecordForm session={session} />
    </div>
  )
}
