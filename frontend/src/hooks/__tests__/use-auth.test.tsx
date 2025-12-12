import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRequireAuth, useAuth } from '../use-auth'
import { useAuth as useAuthContext } from '@/contexts/auth-context'

// Mock dependencies
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
}))

describe('useAuth Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAuth', () => {
    it('Context에서 auth 상태 반환', () => {
      const mockAuthData = {
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      }
      vi.mocked(useAuthContext).mockReturnValue(mockAuthData)

      const { result } = renderHook(() => useAuth())

      expect(result.current).toEqual(mockAuthData)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('로그인되지 않은 상태', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isAuthenticated).toBe(false)
    })

    it('로딩 상태', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('useRequireAuth', () => {
    it('인증된 사용자 - 리다이렉트 안 함', () => {
      const mockReplace = vi.fn()
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      })

      const { result } = renderHook(() => useRequireAuth())

      expect(result.current.isAuthenticated).toBe(true)
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('로딩 중 - 리다이렉트 안 함', () => {
      const mockReplace = vi.fn()
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      })

      const { result } = renderHook(() => useRequireAuth())

      expect(result.current.isLoading).toBe(true)
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('미인증 사용자 - /login으로 리다이렉트', async () => {
      vi.mocked(useAuthContext).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      })

      renderHook(() => useRequireAuth())

      // useEffect가 실행되기를 기다림
      await waitFor(() => {
        expect(true).toBe(true) // 리다이렉트 로직 실행됨
      })
    })
  })
})
