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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const checkAuth = useCallback(() => {
    console.log('[AuthContext] Checking auth...')
    const token = tokenManager.get()
    console.log('[AuthContext] Token exists:', !!token)
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)
        const isValid = decoded.exp * 1000 > Date.now()
        console.log('[AuthContext] Token valid:', isValid, 'exp:', new Date(decoded.exp * 1000))
        if (isValid) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          tokenManager.remove()
        }
      } catch (error) {
        console.log('[AuthContext] Token decode error:', error)
        setIsAuthenticated(false)
        tokenManager.remove()
      }
    } else {
      setIsAuthenticated(false)
    }
    
    // 초기 로딩은 한 번만 false로 설정
    if (!isInitialized) {
      setIsLoading(false)
      setIsInitialized(true)
    }
    console.log('[AuthContext] Auth check complete')
  }, [isInitialized])

  const login = useCallback((token: string) => {
    console.log('[AuthContext] Login with token')
    tokenManager.set(token)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    console.log('[AuthContext] Logout')
    tokenManager.remove()
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    checkAuth()

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [checkAuth])

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
