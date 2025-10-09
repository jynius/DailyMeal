'use client'

import { ReactNode } from 'react'
import { AlertProvider } from '@/components/ui/alert'
import { ToastProvider } from '@/components/ui/toast'
import { SocketProvider } from '@/contexts/socket-context'
import { RealTimeNotifications } from '@/components/realtime-notifications'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AlertProvider>
      <ToastProvider>
        <SocketProvider>
          <RealTimeNotifications />
          {children}
        </SocketProvider>
      </ToastProvider>
    </AlertProvider>
  )
}