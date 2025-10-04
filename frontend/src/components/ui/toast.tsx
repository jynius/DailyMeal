'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface ToastOptions {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  title?: string
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastState extends ToastOptions {
  id: string
  isOpen: boolean
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const showToast = (options: ToastOptions) => {
    const id = Date.now().toString()
    const newToast: ToastState = {
      id,
      isOpen: true,
      type: 'info',
      duration: 5000,
      ...options
    }

    setToasts(prev => [...prev, newToast])

    // 자동 제거
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, newToast.duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const success = (message: string, title?: string) => 
    showToast({ message, title, type: 'success' })

  const error = (message: string, title?: string) => 
    showToast({ message, title, type: 'error', duration: 7000 })

  const warning = (message: string, title?: string) => 
    showToast({ message, title, type: 'warning', duration: 6000 })

  const info = (message: string, title?: string) => 
    showToast({ message, title, type: 'info' })

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      <Toast.Provider swipeDirection="right" duration={5000}>
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            open={toast.isOpen}
            onOpenChange={(open) => !open && removeToast(toast.id)}
            className={`fixed top-4 right-4 w-96 p-4 rounded-lg border shadow-lg z-50 animate-in slide-in-from-right duration-300 ${getColorClass(toast.type || 'info')}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(toast.type || 'info')}
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <Toast.Title className="font-semibold text-sm mb-1">
                    {toast.title}
                  </Toast.Title>
                )}
                <Toast.Description className="text-sm opacity-90">
                  {toast.message}
                </Toast.Description>
              </div>
              <Toast.Close asChild>
                <button
                  className="flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
                  aria-label="닫기"
                >
                  <X size={16} className="opacity-60" />
                </button>
              </Toast.Close>
            </div>
          </Toast.Root>
        ))}
        
        <Toast.Viewport className="fixed top-0 right-0 p-4 w-96 max-w-full z-50" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}