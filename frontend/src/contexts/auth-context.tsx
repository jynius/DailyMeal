'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { tokenManager } from '@/lib/api'
import { createLogger } from '@/lib/logger'

const log = createLogger('AuthContext')

interface JwtPayload {
  exp: number
  [key: string]: any
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
  checkAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // 초기 상태를 동기적으로 설정 (SSR 안전)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false
    const token = tokenManager.get()
    if (!token) return false
    
    try {
      const decoded = jwtDecode<JwtPayload>(token)
      const isValid = decoded.exp * 1000 > Date.now()
      log.info('Initial auth check', { isValid })
      return isValid
    } catch {
      log.warn('Initial token invalid')
      return false
    }
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(true) // 초기값을 true로 변경 (이미 초기화됨)

  const checkAuth = useCallback(() => {
    log.debug('Checking auth...')
    const token = tokenManager.get()
    log.debug('Token exists', { hasToken: !!token })
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)
        const isValid = decoded.exp * 1000 > Date.now()
        log.debug('Token validation', { isValid, exp: new Date(decoded.exp * 1000) })
        if (isValid) {
          setIsAuthenticated(true)
        } else {
          log.warn('Token expired, removing')
          setIsAuthenticated(false)
          tokenManager.remove()
        }
      } catch (error) {
        log.error('Token decode error', error)
        setIsAuthenticated(false)
        tokenManager.remove()
      }
    } else {
      log.debug('No token found')
      setIsAuthenticated(false)
    }
    log.debug('Auth check complete')
  }, [])

  const login = useCallback((token: string) => {
    log.info('Login with token')
    tokenManager.set(token)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    log.info('Logout')
    tokenManager.remove()
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    // 마운트 시 한 번만 실행
    log.debug('Initial mount, checking auth')
    checkAuth()

    // Storage 이벤트 리스너 (다른 탭에서의 변경 감지)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        log.info('Storage changed, rechecking auth')
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, []) // checkAuth 의존성 제거로 무한 루프 방지

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
