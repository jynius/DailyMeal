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
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    log.info('Auth check', { isAuthenticated })

    // 인증되지 않은 경우 로그인으로 리다이렉트
    if (!isAuthenticated) {
      // AuthContext가 이미 토큰 검증을 마쳤으므로 (mounted 상태),
      // isAuthenticated가 false라면 유효한 토큰이 없는 것임.
      // 따라서 추가 토큰 체크 없이 바로 리다이렉트.
      log.warn('Not authenticated, redirecting to /login')
      router.push('/login')
    }
  }, [mounted, isAuthenticated, router])

  // SSR 중일 때만 스피너
  if (!mounted) {
    return <Spinner fullScreen />
  }

  // 인증 완료 시 children 렌더링
  if (isAuthenticated) {
    return <>{children}</>
  }

  // 인증 안 됐으면 스피너 (리다이렉트 중)
  return <Spinner fullScreen />
}
