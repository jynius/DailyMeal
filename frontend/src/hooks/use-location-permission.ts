'use client'

import { useEffect, useState } from 'react'
import { useLocation } from '@/contexts/location-context'
import { useAlert } from '@/components/ui/alert'

interface UseLocationPermissionOptions {
  /** 자동으로 권한 요청 프롬프트를 표시할지 여부 (기본: true) */
  autoPrompt?: boolean
  /** 프롬프트 제목 커스터마이징 */
  promptTitle?: string
  /** 프롬프트 메시지 커스터마이징 */
  promptMessage?: string
}

/**
 * 위치 권한 요청을 위한 커스텀 훅
 * 
 * 사용 예시:
 * ```tsx
 * useLocationPermission({
 *   autoPrompt: true,
 *   promptTitle: '📍 위치 권한 필요',
 *   promptMessage: '주변 맛집을 찾기 위해 위치 권한이 필요합니다.'
 * })
 * ```
 */
export function useLocationPermission(options: UseLocationPermissionOptions = {}) {
  const {
    autoPrompt = true,
    promptTitle = '📍 위치 권한 필요',
    promptMessage = '이 기능을 사용하려면 위치 권한이 필요합니다.\n\n권한을 허용하시겠습니까?'
  } = options

  const location = useLocation()
  const alert = useAlert()
  const [hasShownPrompt, setHasShownPrompt] = useState(false)

  const hasLocation = !!(location.latitude && location.longitude)
  const isLocationError = !!location.error && location.permissionState === 'denied'

  // 자동 프롬프트 표시
  useEffect(() => {
    if (
      autoPrompt &&
      !hasShownPrompt &&
      !location.isLoading &&
      !hasLocation &&
      !isLocationError
    ) {
      setHasShownPrompt(true)
      alert.showConfirm({
        title: promptTitle,
        message: promptMessage,
        type: 'info',
        confirmText: '허용하기',
        cancelText: '나중에',
        onConfirm: () => {
          location.fetchLocation()
        },
      })
    }
  }, [autoPrompt, hasShownPrompt, location.isLoading, hasLocation, isLocationError])

  return location
}
