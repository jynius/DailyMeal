'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
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
    log.info('useState initializer - Token exists', { 
      hasToken: !!token,
      tokenLength: token?.length,
      cookieExists: document.cookie.includes('token=')
    })
    if (!token) return false

    try {
      const decoded = jwtDecode<JwtPayload>(token)
      const isValid = decoded.exp * 1000 > Date.now()
      log.info('useState initializer - Initial auth check', {
        isValid,
        exp: new Date(decoded.exp * 1000),
      })
      return isValid
    } catch (error) {
      log.warn('useState initializer - Initial token invalid', error)
      return false
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(true) // 초기값을 true로 변경 (이미 초기화됨)

  const checkAuth = useCallback(() => {
    log.info('checkAuth() called')
    const token = tokenManager.get()
    log.info('checkAuth - Token retrieved', { hasToken: !!token, tokenLength: token?.length })

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)
        const now = Date.now()
        const expTime = decoded.exp * 1000
        const isValid = expTime > now

        log.info('checkAuth - Token validation', {
          isValid,
          exp: new Date(expTime).toISOString(),
          timeUntilExp: Math.round((expTime - now) / 1000) + 's',
        })

        if (isValid) {
          log.info('checkAuth - Setting authenticated = true')
          setIsAuthenticated(true)
        } else {
          log.warn('checkAuth - Token expired, removing and setting authenticated = false')
          setIsAuthenticated(false)
          tokenManager.remove()
        }
      } catch (error) {
        log.error(
          'checkAuth - Token decode error, removing and setting authenticated = false',
          error
        )
        setIsAuthenticated(false)
        tokenManager.remove()
      }
    } else {
      log.info('checkAuth - No token found, setting authenticated = false')
      setIsAuthenticated(false)
    }
    log.info('checkAuth() complete')
  }, [])

  const login = useCallback((token: string) => {
    log.info('Login with token', { tokenLength: token.length })
    tokenManager.set(token)
    
    // 토큰이 제대로 저장되었는지 확인
    const savedToken = tokenManager.get()
    log.info('Token saved and verified', { 
      saved: !!savedToken, 
      matches: savedToken === token,
      cookieSet: document.cookie.includes('token=')
    })
    
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    log.info('Logout')
    tokenManager.remove()
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    // 마운트 시 한 번만 실행
    log.info('useEffect - Initial mount, checking auth')
    checkAuth()

    // Storage 이벤트 리스너 (다른 탭에서의 변경 감지)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        log.info('useEffect - Storage changed, rechecking auth')
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      log.debug('useEffect - Cleanup')
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
