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

// Helper function to generate UUID outside component
const generateToastId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// Helper to filter out toast by id
const filterToastById = (toasts: ToastState[], id: string) => toasts.filter((t) => t.id !== id)

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => filterToastById(prev, id))
  }, [])

  const scheduleRemoval = React.useCallback((id: string, duration: number) => {
    setTimeout(() => {
      setToasts((prev) => filterToastById(prev, id))
    }, duration)
  }, [])

  const showToast = React.useCallback(
    (options: ToastOptions) => {
      const id = generateToastId()
      const duration = options.duration ?? 5000

      const newToast: ToastState = {
        id,
        isOpen: true,
        type: 'info',
        duration,
        ...options,
      }

      setToasts((prev) => [...prev, newToast])
      scheduleRemoval(id, duration)
    },
    [scheduleRemoval]
  )

  const success = React.useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'success' })
    },
    [showToast]
  )

  const error = React.useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'error', duration: 7000 })
    },
    [showToast]
  )

  const warning = React.useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'warning', duration: 6000 })
    },
    [showToast]
  )

  const info = React.useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'info' })
    },
    [showToast]
  )

  const value = React.useMemo(
    () => ({ showToast, success, error, warning, info }),
    [showToast, success, error, warning, info]
  )

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
    <ToastContext.Provider value={value}>
      {children}
      <Toast.Provider swipeDirection="right" duration={5000}>
        {toasts.map(({ id, isOpen, message, title, type }) => (
          <Toast.Root
            key={id}
            open={isOpen}
            onOpenChange={(open) => !open && removeToast(id)}
            className={`fixed top-4 right-4 w-96 p-4 rounded-lg border shadow-lg z-50 animate-in slide-in-from-right duration-300 ${getColorClass(type || 'info')}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getIcon(type || 'info')}</div>
              <div className="flex-1 min-w-0">
                {title && <Toast.Title className="font-semibold text-sm mb-1">{title}</Toast.Title>}
                <Toast.Description className="text-sm opacity-90">{message}</Toast.Description>
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
        <Toast.Viewport className="fixed top-0 right-0 flex flex-col p-4 gap-3 w-96 max-w-full z-[100]" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}
