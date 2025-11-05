'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { createLogger } from '@/lib/logger'
import Spinner from '@/components/ui/spinner'

const log = createLogger('AuthGuard')

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    log.info('useEffect triggered', { isAuthenticated, isLoading })
    if (!isLoading && !isAuthenticated) {
      log.warn('Not authenticated, redirecting to /login')
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    log.info('Loading authentication, showing spinner')
    return <Spinner fullScreen />
  }

  if (!isAuthenticated) {
    log.info('Not authenticated, showing spinner while redirecting')
    // useEffect에서 리디렉션을 처리하므로, 여기서는 null을 렌더링하여 깜빡임을 방지합니다.
    return <Spinner fullScreen />
  }

  log.info('Authenticated, rendering children')
  return <>{children}</>
}
