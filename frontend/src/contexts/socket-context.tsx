'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { tokenManager } from '@/lib/api/client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectedUsers: number
  notifications: RealTimeNotification[]
  clearNotifications: () => void
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
}

interface RealTimeNotification {
  id: string
  type: 'NEW_MEAL' | 'NEW_RESTAURANT' | 'LIKE_UPDATE' | 'NEW_COMMENT' | 'NOTIFICATION'
  data: Record<string, unknown>
  timestamp: string
  read: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectedUsers: 0,
  notifications: [],
  clearNotifications: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState(0)
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([])
  const [networkStatus, setNetworkStatus] = useState(true) // 초기값을 고정으로 설정
  const [mounted, setMounted] = useState(false) // 마운트 상태 추가

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const joinRoom = useCallback((room: string) => {
    if (socket) {
      socket.emit('joinRoom', { room })
    }
  }, [socket])

  const leaveRoom = useCallback((room: string) => {
    if (socket) {
      socket.emit('leaveRoom', { room })
    }
  }, [socket])

  // 클라이언트에서만 실행되는 마운트 체크
  useEffect(() => {
    setMounted(true)
    
    // 네트워크 상태를 클라이언트에서만 설정
    if (typeof navigator !== 'undefined') {
      setNetworkStatus(navigator.onLine)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return // 마운트되기 전에는 실행하지 않음
    
    // 토큰 확인 - 로그인하지 않았으면 Socket 연결하지 않음
    const token = tokenManager.get()
    if (!token) {
      // 로그인이 필요한 경우에만 조용히 스킵 (로그 최소화)
      return
    }
    
    // Socket.IO 서버 URL 설정
    // 프로덕션: 현재 도메인 사용 (상대 경로)
    // 개발: localhost:8000 사용
    const isDev = process.env.NODE_ENV === 'development'
    const serverUrl = isDev ? 'http://localhost:8000' : ''
    
    if (isDev) {
      console.log('🔌 Socket.IO connecting:', serverUrl || 'current domain')
    }
    
    // Socket.IO 연결 - 에러에 강한 설정
    const newSocket = io(serverUrl, {
      path: '/api/socket.io',  // ✅ /api 경로 사용!
      withCredentials: false,
      transports: ['polling', 'websocket'], // polling을 먼저 시도
      timeout: 10000,
      reconnection: true, // 자동 재연결 활성화
      reconnectionDelay: 5000, // 5초 후 재연결
      reconnectionAttempts: 3, // 최대 3번 시도
      forceNew: true,
      auth: {
        token // 토큰 전달
      }
    })

    setSocket(newSocket)

    // 연결 이벤트
    newSocket.on('connect', () => {
      if (isDev) console.log('✅ Socket connected:', newSocket.id)
      setIsConnected(true)

      // 사용자 인증 (토큰이 있을 경우)
      const token = tokenManager.get()
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          newSocket.emit('userAuth', {
            userId: payload.sub,
            username: payload.username || 'Anonymous'
          })
        } catch (error) {
          if (isDev) console.error('Token decode error:', error)
        }
      }
    })

    newSocket.on('disconnect', (reason) => {
      if (isDev) console.log('Socket disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      if (isDev) console.warn('Socket connection error (will retry):', error.message)
      // 에러를 조용히 처리 - 사용자에게 알림 없음
    })

    // 연결된 사용자 수 업데이트
    newSocket.on('userCount', (count: number) => {
      setConnectedUsers(count)
    })

    // 실시간 알림 수신
    newSocket.on('newMeal', (data) => {
      const notification: RealTimeNotification = {
        id: crypto.randomUUID(), // Date.now() 대신 UUID 사용
        type: 'NEW_MEAL',
        data: data.data,
        timestamp: data.timestamp,
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50)) // 최대 50개 유지
    })

    newSocket.on('newRestaurant', (data) => {
      const notification: RealTimeNotification = {
        id: crypto.randomUUID(),
        type: 'NEW_RESTAURANT',
        data: data.data,
        timestamp: data.timestamp,
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
    })

    newSocket.on('likeUpdate', (data) => {
      const notification: RealTimeNotification = {
        id: crypto.randomUUID(),
        type: 'LIKE_UPDATE',
        data: data.data,
        timestamp: data.timestamp,
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
    })

    newSocket.on('newComment', (data) => {
      const notification: RealTimeNotification = {
        id: crypto.randomUUID(),
        type: 'NEW_COMMENT',
        data: data.data,
        timestamp: data.timestamp,
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
    })

    newSocket.on('notification', (data) => {
      const notification: RealTimeNotification = {
        id: crypto.randomUUID(),
        type: 'NOTIFICATION',
        data: data.data,
        timestamp: data.timestamp,
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
    })

    // 인증 성공 응답
    newSocket.on('authSuccess', (data) => {
      if (isDev) console.log('Authentication successful:', data)
    })

    // 정리
    return () => {
      if (isDev) console.log('🔌 Cleaning up socket connection')
      newSocket.close()
    }
  }, [mounted]) // mounted 상태에 의존

  const contextValue: SocketContextType = {
    socket,
    isConnected, // 단순히 소켓 연결 상태만 반영
    connectedUsers,
    notifications,
    clearNotifications,
    joinRoom,
    leaveRoom,
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}