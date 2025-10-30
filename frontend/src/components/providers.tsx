'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { LocationProvider } from '@/contexts/location-context'
import { SocketProvider } from '@/contexts/socket-context'
import { ToastProvider } from '@/components/ui/toast'
import { AlertProvider } from './ui/alert'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <ToastProvider>
        <LocationProvider>
          <AuthProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthProvider>
        </LocationProvider>
      </ToastProvider>
    </AlertProvider>
  )
}
