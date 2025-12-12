import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { SocketProvider, useSocket } from '../socket-context'
import { tokenManager } from '@/lib/api'
import { io } from 'socket.io-client'

// Mock dependencies
vi.mock('@/lib/api', () => ({
  tokenManager: {
    get: vi.fn(),
  },
}))

vi.mock('socket.io-client', () => ({
  io: vi.fn(),
}))

// Mock socket instance
const mockSocket = {
  id: 'test-socket-id',
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  close: vi.fn(),
  connected: false,
}

// Test component
function TestComponent() {
  const { socket, isConnected, connectedUsers, notifications, joinRoom, leaveRoom, clearNotifications } = useSocket()
  
  return (
    <div>
      <div data-testid="connection-status">{isConnected ? 'connected' : 'disconnected'}</div>
      <div data-testid="socket-id">{socket?.id || 'no-socket'}</div>
      <div data-testid="users-count">{connectedUsers}</div>
      <div data-testid="notifications-count">{notifications.length}</div>
      <button onClick={() => joinRoom('test-room')}>Join Room</button>
      <button onClick={() => leaveRoom('test-room')}>Leave Room</button>
      <button onClick={clearNotifications}>Clear Notifications</button>
    </div>
  )
}

describe('SocketContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSocket.on.mockClear()
    mockSocket.emit.mockClear()
    vi.mocked(io).mockReturnValue(mockSocket as any)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('SocketProvider', () => {
    it('토큰 없으면 소켓 연결 안 함', () => {
      vi.mocked(tokenManager.get).mockReturnValue(null)

      render(
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      )

      expect(io).not.toHaveBeenCalled()
      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
    })

    it('토큰 있으면 소켓 연결', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInVzZXJuYW1lIjoidGVzdHVzZXIifQ.test'
      vi.mocked(tokenManager.get).mockReturnValue(mockToken)

      render(
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      )

      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Socket.IO 옵션 확인
      const ioCall = vi.mocked(io).mock.calls[0]
      expect(ioCall[1]).toMatchObject({
        path: '/api/socket.io',
        transports: ['polling', 'websocket'],
        reconnection: true,
      })
    })

    it('connect 이벤트 처리', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInVzZXJuYW1lIjoidGVzdHVzZXIifQ.test'
      vi.mocked(tokenManager.get).mockReturnValue(mockToken)

      render(
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      )

      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled()
      })

      // connect 이벤트 핸들러 찾기
      const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1]
      expect(connectHandler).toBeDefined()

      // connect 이벤트 시뮬레이션
      await act(async () => {
        connectHandler?.()
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
      })
    })

    it('disconnect 이벤트 처리', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInVzZXJuYW1lIjoidGVzdHVzZXIifQ.test'
      vi.mocked(tokenManager.get).mockReturnValue(mockToken)

      render(
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      )

      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled()
      })

      // disconnect 이벤트 핸들러
      const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')?.[1]
      
      await act(async () => {
        disconnectHandler?.('transport close')
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
      })
    })

    it('joinRoom 호출', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInVzZXJuYW1lIjoidGVzdHVzZXIifQ.test'
      vi.mocked(tokenManager.get).mockReturnValue(mockToken)

      render(
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      )

      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      const joinButton = screen.getByText('Join Room')
      await act(async () => {
        joinButton.click()
      })

      expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', { room: 'test-room' })
    })

    it('leaveRoom 호출', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInVzZXJuYW1lIjoidGVzdHVzZXIifQ.test'
      vi.mocked(tokenManager.get).mockReturnValue(mockToken)

      render(
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      )

      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      const leaveButton = screen.getByText('Leave Room')
      await act(async () => {
        leaveButton.click()
      })

      expect(mockSocket.emit).toHaveBeenCalledWith('leaveRoom', { room: 'test-room' })
    })

    it('clearNotifications 동작', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInVzZXJuYW1lIjoidGVzdHVzZXIifQ.test'
      vi.mocked(tokenManager.get).mockReturnValue(mockToken)

      render(
        <SocketProvider>
          <TestComponent />
        </SocketProvider>
      )

      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // 초기 알림 개수
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0')

      const clearButton = screen.getByText('Clear Notifications')
      await act(async () => {
        clearButton.click()
      })

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0')
    })
  })

  describe('useSocket hook', () => {
    // Note: Provider 없이 사용하는 경우는 실제로 런타임 에러를 발생시키므로
    // 테스트가 복잡해짐. React error boundary 패턴 필요.
    // 실제 사용에서는 Provider 하위에서만 사용하므로 생략.

    it('Provider 내에서 정상 사용', () => {
      vi.mocked(tokenManager.get).mockReturnValue(null)

      expect(() => {
        render(
          <SocketProvider>
            <TestComponent />
          </SocketProvider>
        )
      }).not.toThrow()
    })
  })
})
