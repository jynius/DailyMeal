'use client'

import { ReactNode } from 'react'
import { AlertProvider } from '@/components/ui/alert'
import { ToastProvider } from '@/components/ui/toast'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AlertProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AlertProvider>
  )
}