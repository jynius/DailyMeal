'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { createLogger } from '@/lib/logger'
import { tokenManager } from '@/lib/api'
import Spinner from '@/components/ui/spinner'

const log = createLogger('AuthGuard')

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    log.info('useEffect triggered', { isAuthenticated, isLoading })

    // 로딩이 완료되고 인증되지 않은 경우
    if (!isLoading && !isAuthenticated) {
      // 토큰이 실제로 없는지 다시 확인
      const token = tokenManager.get()
      if (!token) {
        log.warn('Not authenticated and no token, redirecting to /login')
        setShouldRedirect(true)
        router.push('/login')
      } else {
        log.info('Token exists but auth context not updated yet, waiting...')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // 로딩 중일 때
  if (isLoading) {
    log.info('Loading authentication, showing spinner')
    return <Spinner fullScreen />
  }

  // 인증되지 않았고 리다이렉트가 필요한 경우
  if (!isAuthenticated && shouldRedirect) {
    log.info('Not authenticated, showing spinner while redirecting')
    return <Spinner fullScreen />
  }

  // 인증되지 않았지만 토큰이 있는 경우 (컨텍스트 업데이트 대기)
  if (!isAuthenticated) {
    const token = tokenManager.get()
    if (token) {
      log.info('Token exists, waiting for auth context update')
      return <Spinner fullScreen />
    }
    log.info('No token and not authenticated, showing spinner')
    return <Spinner fullScreen />
  }

  log.info('Authenticated, rendering children')
  return <>{children}</>
}
