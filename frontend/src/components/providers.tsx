'use client'

import { ReactNode } from 'react'
import { AlertProvider } from '@/components/ui/alert'
import { ToastProvider } from '@/components/ui/toast'
import { SocketProvider } from '@/contexts/socket-context'
import { RealTimeNotifications } from '@/components/realtime-notifications'
import { usePathname } from 'next/navigation'
import { tokenManager } from '@/lib/api/client'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname()
  
  // 공개 페이지 체크
  const isPublicPage = pathname?.startsWith('/share/') || 
                       pathname === '/login' || 
                       pathname === '/signup'

  return (
    <AlertProvider>
      <ToastProvider>
        <SocketProvider>
          {/* 공개 페이지가 아닐 때만 실시간 알림 표시 */}
          {!isPublicPage && <RealTimeNotifications />}
          {children}
        </SocketProvider>
      </ToastProvider>
    </AlertProvider>
  )
}