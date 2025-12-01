'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { LocationProvider } from '@/contexts/location-context'
import { SocketProvider } from '@/contexts/socket-context'
import { ToastProvider } from '@/components/ui/toast'
import { AlertProvider } from './ui/alert'

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <ToastProvider>
          <LocationProvider>
            <AuthProvider>
              <SocketProvider>{children}</SocketProvider>
            </AuthProvider>
          </LocationProvider>
        </ToastProvider>
      </AlertProvider>
    </QueryClientProvider>
  )
}
