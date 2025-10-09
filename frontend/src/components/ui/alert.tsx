'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface AlertOptions {
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void
  showConfirm: (options: AlertOptions) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}

interface AlertState extends AlertOptions {
  isOpen: boolean
  isConfirm: boolean
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    isConfirm: false,
    message: '',
    type: 'info'
  })

  const showAlert = (options: AlertOptions) => {
    setAlertState({
      ...options,
      isOpen: true,
      isConfirm: false,
      confirmText: options.confirmText || '확인'
    })
  }

  const showConfirm = (options: AlertOptions) => {
    setAlertState({
      ...options,
      isOpen: true,
      isConfirm: true,
      confirmText: options.confirmText || '확인',
      cancelText: options.cancelText || '취소'
    })
  }

  const handleConfirm = async () => {
    if (alertState.onConfirm) {
      await alertState.onConfirm()
    }
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }

  const handleCancel = () => {
    if (alertState.onCancel) {
      alertState.onCancel()
    }
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }

  const getIcon = () => {
    switch (alertState.type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      default:
        return <Info className="w-6 h-6 text-blue-500" />
    }
  }

  const getColorClass = () => {
    switch (alertState.type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      <Dialog.Root open={alertState.isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-in fade-in duration-200" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Content 
              className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl animate-in fade-in zoom-in duration-200"
            >
              <div className={`flex items-start gap-4 p-4 rounded-lg border ${getColorClass()}`}>
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                {alertState.title && (
                  <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                    {alertState.title}
                  </Dialog.Title>
                )}
                <Dialog.Description className="text-sm text-gray-700 whitespace-pre-wrap">
                  {alertState.message}
                </Dialog.Description>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              {alertState.isConfirm && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="px-4 py-2"
                >
                  {alertState.cancelText}
                </Button>
              )}
              <Button
                onClick={handleConfirm}
                className={`px-4 py-2 ${
                  alertState.type === 'error' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : alertState.type === 'success'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {alertState.confirmText}
              </Button>
            </div>

            <Dialog.Close asChild>
              <button
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="닫기"
                onClick={handleCancel}
              >
                <X size={20} className="text-gray-400" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </AlertContext.Provider>
  )
}