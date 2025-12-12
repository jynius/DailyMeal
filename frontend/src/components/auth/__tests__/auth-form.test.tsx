import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { AuthForm } from '../auth-form'
import { authApi, tokenManager } from '@/lib/api'
import { connectFriend } from '@/lib/api/share'
import { useRouter, useSearchParams } from 'next/navigation'

// Mocks
vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
  tokenManager: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/lib/api/share', () => ({
  connectFriend: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

vi.mock('@/components/ui/toast', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  })),
}))

vi.mock('@/components/ui/alert', () => ({
  useAlert: vi.fn(() => ({
    showAlert: vi.fn((config) => {
      // Simulate alert with immediate callback
      if (config.onConfirm) config.onConfirm()
    }),
    showConfirm: vi.fn((config) => {
      if (config.onConfirm) config.onConfirm()
    }),
  })),
}))

describe('AuthForm', () => {
  const mockPush = vi.fn()
  const mockSearchParams = new URLSearchParams()

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
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)
  })

  it('초기 로그인 모드 렌더링', () => {
    render(<AuthForm />)

    expect(screen.getByRole('heading', { name: /로그인/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
  })

  it('회원가입 모드로 전환', async () => {
    const user = userEvent.setup()
    render(<AuthForm initialMode="login" />)

    const toggleButton = screen.getByText(/계정이 없으신가요/i)
    await user.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByLabelText(/이름/i)).toBeInTheDocument()
    })
  })

  it('로그인 성공 시 토큰 저장', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({
      token: 'test-token',
      user: { id: '1', email: 'test@test.com', name: 'Test' },
    })

    render(<AuthForm />)

    await user.type(screen.getByLabelText(/이메일/i), 'test@test.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123')

    const loginButton = screen.getByRole('button', { name: /로그인/i })
    await user.click(loginButton)

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      })
      expect(tokenManager.set).toHaveBeenCalledWith('test-token')
    })
  })

  it('회원가입 시 이름 입력 필드 표시', () => {
    render(<AuthForm initialMode="register" />)

    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument()
  })
})
