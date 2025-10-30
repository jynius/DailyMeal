'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth as useAuthContext } from '@/contexts/auth-context'

/**
 * 인증이 필요한 페이지에서 사용하는 훅
 * 로그인하지 않은 경우 /login으로 리다이렉트
 * 
 * @deprecated AuthGuard 컴포넌트를 사용하세요.
 * @example
 * // 이전 방식 (deprecated)
 * const { isAuthenticated, isLoading } = useRequireAuth()
 * 
 * // 새로운 방식
 * import AuthGuard from '@/components/auth/AuthGuard'
 * 
 * export default function Page() {
 *   return (
 *     <AuthGuard>
 *       <YourContent />
 *     </AuthGuard>
 *   )
 * }
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('[useRequireAuth] Not authenticated, redirecting to /login')
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  return { isAuthenticated, isLoading }
}

/**
 * 로그인 상태 확인만 하는 훅 (리다이렉트 없음)
 * Context 기반으로 통합됨
 */
export function useAuth() {
  return useAuthContext()
}
