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

  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    // Socket.IO 연결
    const newSocket = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    setSocket(newSocket)

    // 연결 이벤트
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
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
          console.error('Token decode error:', error)
        }
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    // 연결된 사용자 수 업데이트
    newSocket.on('userCount', (count: number) => {
      setConnectedUsers(count)
    })

    // 실시간 알림 수신
    newSocket.on('newMeal', (data) => {
      const notification: RealTimeNotification = {
        id: Date.now().toString(),
        type: 'NEW_MEAL',
        data: data.data,
        timestamp: data.timestamp,
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50)) // 최대 50개 유지
    })

    newSocket.on('newRestaurant', (data) => {
      const notification: RealTimeNotification = {
        id: Date.now().toString(),
        type: 'NEW_RESTAURANT',
        data: data.data,
        timestamp: data.timestamp,
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
    })

    newSocket.on('likeUpdate', (data) => {
      const notification: RealTimeNotification = {
        id: Date.now().toString(),
        type: 'LIKE_UPDATE',
        data: data.data,
        timestamp: data.timestamp,
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
    })

    newSocket.on('newComment', (data) => {
      const notification: RealTimeNotification = {
        id: Date.now().toString(),
        type: 'NEW_COMMENT',
        data: data.data,
        timestamp: data.timestamp,
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
    })

    newSocket.on('notification', (data) => {
      const notification: RealTimeNotification = {
        id: Date.now().toString(),
        type: 'NOTIFICATION',
        data: data.data,
        timestamp: data.timestamp,
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
    })

    // 인증 성공 응답
    newSocket.on('authSuccess', (data) => {
      console.log('Authentication successful:', data)
    })

    // 정리
    return () => {
      newSocket.close()
    }
  }, [])

  const contextValue: SocketContextType = {
    socket,
    isConnected,
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