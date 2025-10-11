'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { tokenManager } from '@/lib/api/client'

/**
 * 인증이 필요한 페이지에서 사용하는 훅
 * 로그인하지 않은 경우 /login으로 리다이렉트
 */
export function useRequireAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = tokenManager.get()
    
    if (!token) {
      // 토큰이 없으면 로그인 페이지로
      setIsLoading(false)
      router.replace('/login') // replace 사용 (히스토리에 추가 안 함)
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  }, []) // 의존성 배열 비우기 - 마운트 시 1번만 실행

  return { isAuthenticated, isLoading }
}

/**
 * 로그인 상태 확인만 하는 훅 (리다이렉트 없음)
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = tokenManager.get()
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  return { isAuthenticated, isLoading }
}
