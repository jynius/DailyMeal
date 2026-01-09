import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthProvider } from '@/contexts/auth-context'
import AuthGuard from '@/components/auth/AuthGuard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { authApi, mealRecordsApi, friendsApi } from '@/lib/api'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// Mock modules
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api')
  return {
    ...actual,
    authApi: {
      login: vi.fn(),
      register: vi.fn(),
    },
    mealRecordsApi: {
      getAll: vi.fn(),
    },
    friendsApi: {
      getFriends: vi.fn(),
      getReceivedRequests: vi.fn(),
      getSentRequests: vi.fn(),
    },
  }
})

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}))

vi.mock('@/components/ui/alert', () => ({
  useAlert: () => ({
    showAlert: vi.fn(),
    showConfirm: vi.fn(),
  }),
}))

vi.mock('@/lib/api/share', () => ({
  connectFriend: vi.fn(),
}))

vi.mock('@/hooks/use-kakao-map', () => ({
  useKakaoMap: () => ({
    isLoaded: false,
    error: null,
  }),
}))

// Test wrapper
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

describe('로그인 플로우 통합 테스트', () => {
  const mockReplace = vi.fn()
  const mockPush = vi.fn()
  let searchParams: URLSearchParams

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    searchParams = new URLSearchParams()
    
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as any)
    
    vi.mocked(useSearchParams).mockReturnValue(searchParams as any)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('기본 로그인 케이스', () => {
    it('로그인 성공 시 홈(/)으로 리다이렉트', async () => {
      const user = userEvent.setup()
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjk5OTk5OTk5OTl9.test'
      
      vi.mocked(authApi.login).mockResolvedValue({
        token: mockToken,
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        message: '로그인 성공',
      } as any)

      render(
        <TestWrapper>
          <AuthForm initialMode="login" />
        </TestWrapper>
      )

      // 로그인 폼 입력
      await user.type(screen.getByLabelText(/이메일/i), 'test@test.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      // 로그인 성공 및 리다이렉트 확인
      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          email: 'test@test.com',
          password: 'password123',
        })
        expect(mockReplace).toHaveBeenCalledWith('/')
      }, { timeout: 3000 })
    })

    it('로그인 실패 시 에러 메시지 표시', async () => {
      const user = userEvent.setup()
      
      vi.mocked(authApi.login).mockRejectedValue(
        new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
      )

      render(
        <TestWrapper>
          <AuthForm initialMode="login" />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/이메일/i), 'wrong@test.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        expect(screen.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/i)).toBeInTheDocument()
      })
      
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  describe('returnUrl 리다이렉션 케이스', () => {
    it('로그인 성공 시 returnUrl로 리다이렉트', async () => {
      const user = userEvent.setup()
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjk5OTk5OTk5OTl9.test'
      
      // returnUrl 파라미터 설정
      searchParams.set('returnUrl', '/feed')
      
      vi.mocked(authApi.login).mockResolvedValue({
        token: mockToken,
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        message: '로그인 성공',
      } as any)

      render(
        <TestWrapper>
          <AuthForm initialMode="login" />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/이메일/i), 'test@test.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/feed')
      }, { timeout: 3000 })
    })

    it('로그인 성공 시 /restaurant로 리다이렉트', async () => {
      const user = userEvent.setup()
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjk5OTk5OTk5OTl9.test'
      
      searchParams.set('returnUrl', '/restaurant')
      
      vi.mocked(authApi.login).mockResolvedValue({
        token: mockToken,
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        message: '로그인 성공',
      } as any)

      render(
        <TestWrapper>
          <AuthForm initialMode="login" />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/이메일/i), 'test@test.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/restaurant')
      }, { timeout: 3000 })
    })

    it('로그인 성공 시 /friends로 리다이렉트', async () => {
      const user = userEvent.setup()
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjk5OTk5OTk5OTl9.test'
      
      searchParams.set('returnUrl', '/friends')
      
      vi.mocked(authApi.login).mockResolvedValue({
        token: mockToken,
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        message: '로그인 성공',
      } as any)

      render(
        <TestWrapper>
          <AuthForm initialMode="login" />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/이메일/i), 'test@test.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/friends')
      }, { timeout: 3000 })
    })
  })

  describe('토큰 저장 확인', () => {
    it('로그인 성공 시 토큰이 localStorage에 저장됨', async () => {
      const user = userEvent.setup()
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjk5OTk5OTk5OTl9.test'
      
      vi.mocked(authApi.login).mockResolvedValue({
        token: mockToken,
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        message: '로그인 성공',
      } as any)

      render(
        <TestWrapper>
          <AuthForm initialMode="login" />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/이메일/i), 'test@test.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        const savedToken = localStorage.getItem('token')
        expect(savedToken).toBe(mockToken)
      }, { timeout: 3000 })
    })

    it('로그인 성공 시 토큰이 쿠키에도 저장됨', async () => {
      const user = userEvent.setup()
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjk5OTk5OTk5OTl9.test'
      
      vi.mocked(authApi.login).mockResolvedValue({
        token: mockToken,
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        message: '로그인 성공',
      } as any)

      render(
        <TestWrapper>
          <AuthForm initialMode="login" />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/이메일/i), 'test@test.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      await user.click(screen.getByRole('button', { name: /로그인/i }))

      await waitFor(() => {
        expect(document.cookie).toContain(`token=${mockToken}`)
      }, { timeout: 3000 })
    })
  })

  describe('회원가입 케이스', () => {
    it('회원가입 성공 시 홈으로 리다이렉트', async () => {
      const user = userEvent.setup()
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJleHAiOjk5OTk5OTk5OTl9.test'
      
      vi.mocked(authApi.register).mockResolvedValue({
        token: mockToken,
        user: { id: '2', email: 'newuser@test.com', name: 'New User' },
        message: '회원가입 성공',
      } as any)

      render(
        <TestWrapper>
          <AuthForm initialMode="register" />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/이름/i), 'New User')
      await user.type(screen.getByLabelText(/이메일/i), 'newuser@test.com')
      await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
      
      // 약관 동의 체크박스
      const termsCheckbox = screen.getByLabelText(/서비스 이용약관/i)
      const privacyCheckbox = screen.getByLabelText(/개인정보 처리방침/i)
      await user.click(termsCheckbox)
      await user.click(privacyCheckbox)
      
      await user.click(screen.getByRole('button', { name: /회원가입/i }))

      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith({
          email: 'newuser@test.com',
          password: 'password123',
          name: 'New User',
        })
        expect(mockReplace).toHaveBeenCalledWith('/')
      }, { timeout: 3000 })
    })
  })
})

describe('로그인 후 페이지 렌더링 테스트', () => {
  const mockReplace = vi.fn()
  const mockPush = vi.fn()
  let currentPath = '/login'

  // Mock 페이지 컴포넌트
  function MockFeedPage() {
    return (
      <AuthGuard>
        <div data-testid="feed-page">
          <h1>피드</h1>
          <p>식사 기록을 불러오는 중...</p>
        </div>
      </AuthGuard>
    )
  }

  function MockFriendsPage() {
    return (
      <AuthGuard>
        <div data-testid="friends-page">
          <h1>친구</h1>
          <p>친구 목록 로딩중...</p>
        </div>
      </AuthGuard>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    currentPath = '/login'
    
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: (path: string) => {
        currentPath = path
        mockReplace(path)
      },
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as any)
    
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any)
    vi.mocked(usePathname).mockImplementation(() => currentPath)
    
    // API Mocks
    vi.mocked(mealRecordsApi.getAll).mockResolvedValue([])
    vi.mocked(friendsApi.getFriends).mockResolvedValue([])
    vi.mocked(friendsApi.getReceivedRequests).mockResolvedValue([])
    vi.mocked(friendsApi.getSentRequests).mockResolvedValue([])
  })

  it('로그인 성공 후 /feed 페이지가 렌더링됨', async () => {
    const user = userEvent.setup()
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjk5OTk5OTk5OTl9.test'
    
    // returnUrl 설정
    const searchParams = new URLSearchParams({ returnUrl: '/feed' })
    vi.mocked(useSearchParams).mockReturnValue(searchParams as any)
    
    vi.mocked(authApi.login).mockResolvedValue({
      token: mockToken,
      user: { id: '1', email: 'test@test.com', name: 'Test User' },
      message: '로그인 성공',
    } as any)

    // 1단계: 로그인 페이지 렌더링
    const { rerender } = render(
      <TestWrapper>
        <AuthForm initialMode="login" />
      </TestWrapper>
    )

    // 2단계: 로그인 수행
    await user.type(screen.getByLabelText(/이메일/i), 'test@test.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await user.click(screen.getByRole('button', { name: /로그인/i }))

    // 3단계: 리다이렉트 확인
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/feed')
      expect(currentPath).toBe('/feed')
    })

    // 4단계: 페이지 리렌더링 (리다이렉트 후)
    vi.mocked(usePathname).mockReturnValue('/feed')
    rerender(
      <TestWrapper>
        <MockFeedPage />
      </TestWrapper>
    )

    // 5단계: Feed 페이지가 렌더링되었는지 확인
    await waitFor(() => {
      const feedPage = screen.getByTestId('feed-page')
      expect(feedPage).toBeInTheDocument()
      expect(within(feedPage).getByText('피드')).toBeInTheDocument()
    })

    // AuthGuard를 통과했으므로 스피너가 아닌 실제 컨텐츠 표시
    expect(screen.queryByText(/로그인/i)).not.toBeInTheDocument()
  })

  it('로그인 성공 후 /friends 페이지가 렌더링됨', async () => {
    const user = userEvent.setup()
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJleHAiOjk5OTk5OTk5OTl9.test'
    
    const searchParams = new URLSearchParams({ returnUrl: '/friends' })
    vi.mocked(useSearchParams).mockReturnValue(searchParams as any)
    
    vi.mocked(authApi.login).mockResolvedValue({
      token: mockToken,
      user: { id: '1', email: 'test@test.com', name: 'Test User' },
      message: '로그인 성공',
    } as any)

    const { rerender } = render(
      <TestWrapper>
        <AuthForm initialMode="login" />
      </TestWrapper>
    )

    await user.type(screen.getByLabelText(/이메일/i), 'test@test.com')
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123')
    await user.click(screen.getByRole('button', { name: /로그인/i }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/friends')
      expect(currentPath).toBe('/friends')
    })

    vi.mocked(usePathname).mockReturnValue('/friends')
    rerender(
      <TestWrapper>
        <MockFriendsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const friendsPage = screen.getByTestId('friends-page')
      expect(friendsPage).toBeInTheDocument()
      expect(within(friendsPage).getByText('친구')).toBeInTheDocument()
    })

    expect(screen.queryByText(/로그인/i)).not.toBeInTheDocument()
  })

  it('로그인 없이 보호된 페이지 접근 시 AuthGuard가 차단', async () => {
    // 토큰 없는 상태
    localStorage.clear()
    
    vi.mocked(usePathname).mockReturnValue('/feed')

    render(
      <TestWrapper>
        <MockFeedPage />
      </TestWrapper>
    )

    // AuthGuard가 로그인 페이지로 리다이렉트
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    // 실제 컨텐츠는 렌더링되지 않음
    expect(screen.queryByTestId('feed-page')).not.toBeInTheDocument()
  })
})
