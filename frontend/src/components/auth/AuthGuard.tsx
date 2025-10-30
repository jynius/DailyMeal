'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import Spinner from '@/components/ui/spinner'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('[AuthGuard] Not authenticated, redirecting to /login');
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    console.log('[AuthGuard] Checking authentication...');
    return <Spinner fullScreen />
  }

  if (!isAuthenticated) {
    // useEffect에서 리디렉션을 처리하므로, 여기서는 null을 렌더링하여 깜빡임을 방지합니다.
    return null;
  }

  console.log('[AuthGuard] Authenticated, rendering children');
  return <>{children}</>
}
