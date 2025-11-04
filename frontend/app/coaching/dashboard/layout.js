'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CoachingDashboardLayout({ children }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/coaching/login')
    } else if (user.platform !== 'coaching') {
      router.push('/platform-selection')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  // Redirect to main dashboard layout for coaching users
  router.push('/dashboard')
  return null
}