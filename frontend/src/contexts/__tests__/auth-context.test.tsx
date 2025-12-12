import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../auth-context'
import { tokenManager } from '@/lib/api'

// Mock dependencies
vi.mock('@/lib/api', () => ({
  tokenManager: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn((token: string) => {
    if (token === 'valid-token') {
      return { exp: Math.floor(Date.now() / 1000) + 3600 } // 1시간 후 만료
    }
    if (token === 'expired-token') {
      return { exp: Math.floor(Date.now() / 1000) - 3600 } // 1시간 전 만료
    }
    throw new Error('Invalid token')
  }),
}))

// Test component to use the hook
function TestComponent() {
  const { isAuthenticated, isLoading, login, logout, checkAuth } = useAuth()
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="loading-status">{isLoading ? 'loading' : 'not-loading'}</div>
      <button onClick={() => login('valid-token')}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={checkAuth}>Check Auth</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('AuthProvider', () => {
    it('초기 상태: 토큰 없음 - not authenticated', () => {
      vi.mocked(tokenManager.get).mockReturnValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
    })

    it('초기 상태: 유효한 토큰 - authenticated', () => {
      vi.mocked(tokenManager.get).mockReturnValue('valid-token')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    })

    it('초기 상태: 만료된 토큰 - not authenticated & 토큰 제거', () => {
      vi.mocked(tokenManager.get).mockReturnValue('expired-token')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
    })

    it('login() - 토큰 저장 및 authenticated 설정', async () => {
      vi.mocked(tokenManager.get).mockReturnValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')

      const loginButton = screen.getByText('Login')
      await act(async () => {
        loginButton.click()
      })

      expect(tokenManager.set).toHaveBeenCalledWith('valid-token')
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    })

    it('logout() - 토큰 제거 및 not authenticated 설정', async () => {
      vi.mocked(tokenManager.get).mockReturnValue('valid-token')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')

      const logoutButton = screen.getByText('Logout')
      await act(async () => {
        logoutButton.click()
      })

      expect(tokenManager.remove).toHaveBeenCalled()
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
    })

    it('checkAuth() - 토큰 재검증', async () => {
      let tokenValue = 'valid-token'
      vi.mocked(tokenManager.get).mockImplementation(() => tokenValue)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')

      // 토큰을 만료된 것으로 변경
      tokenValue = 'expired-token'

      const checkButton = screen.getByText('Check Auth')
      await act(async () => {
        checkButton.click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      })
      expect(tokenManager.remove).toHaveBeenCalled()
    })

    it('storage 이벤트 - 다른 탭에서 토큰 변경 감지', async () => {
      vi.mocked(tokenManager.get).mockReturnValue('valid-token')

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')

      // 다른 탭에서 토큰 제거 시뮬레이션
      vi.mocked(tokenManager.get).mockReturnValue(null)
      
      await act(async () => {
        window.dispatchEvent(new StorageEvent('storage', { key: 'token' }))
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      })
    })
  })

  describe('useAuth hook', () => {
    it('Provider 없이 사용 시 에러', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleError.mockRestore()
    })

    it('Provider 내에서 정상 사용', () => {
      vi.mocked(tokenManager.get).mockReturnValue(null)

      expect(() => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      }).not.toThrow()
    })
  })
})
