'use client'

import { ReactNode } from 'react'
import { AlertProvider } from '@/components/ui/alert'
import { ToastProvider } from '@/components/ui/toast'
import { SocketProvider } from '@/contexts/socket-simple'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AlertProvider>
      <ToastProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </ToastProvider>
    </AlertProvider>
  )
}