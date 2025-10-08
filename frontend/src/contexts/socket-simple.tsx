'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectedUsers: number
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectedUsers: 0,
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

  useEffect(() => {
    console.log('🔌 Initializing Socket.IO connection...')
    
    // 매우 간단한 Socket.IO 연결
    const newSocket = io('http://localhost:8000', {
      transports: ['polling'] // 일단 polling만 사용
    })

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error)
      setIsConnected(false)
    })

    newSocket.on('userCount', (count: number) => {
      console.log('👥 Connected users:', count)
      setConnectedUsers(count)
    })

    setSocket(newSocket)

    return () => {
      console.log('🔌 Cleaning up socket connection')
      newSocket.close()
    }
  }, [])

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    connectedUsers,
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}