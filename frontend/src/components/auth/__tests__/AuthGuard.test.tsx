import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import AuthGuard from '../AuthGuard'
import { useAuth } from '@/contexts/auth-context'
import { tokenManager } from '@/lib/api'
import { useRouter } from 'next/navigation'

// Mocks
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  tokenManager: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('AuthGuard', () => {
  const mockPush = vi.fn()
  const TestChildren = () => <div>Protected Content</div>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any)
  })

  it('인증된 사용자에게 children 렌더링', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@test.com', name: 'Test' },
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    } as any)

    render(
      <AuthGuard>
        <TestChildren />
      </AuthGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('미인증 사용자 /login 리다이렉트', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    } as any)
    vi.mocked(tokenManager.get).mockReturnValue(null)

    render(
      <AuthGuard>
        <TestChildren />
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('SSR 중 스피너 표시', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    } as any)

    const { container } = render(
      <AuthGuard>
        <TestChildren />
      </AuthGuard>
    )

    // 첫 렌더링에서는 스피너가 있어야 함
    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })

  it('토큰은 있지만 인증 상태가 false면 스피너', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    } as any)
    vi.mocked(tokenManager.get).mockReturnValue('valid-token')

    const { container } = render(
      <AuthGuard>
        <TestChildren />
      </AuthGuard>
    )

    await waitFor(() => {
      expect(container.querySelector('.animate-spin')).toBeTruthy()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })
})
