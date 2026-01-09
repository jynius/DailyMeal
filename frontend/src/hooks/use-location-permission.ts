'use client'

import { useEffect, useState } from 'react'
import { useLocation } from '@/contexts/location-context'

interface UseLocationPermissionOptions {
  /** 자동으로 권한 요청 프롬프트를 표시할지 여부 (기본: true) */
  autoPrompt?: boolean
}

/**
 * 위치 권한 요청을 위한 커스텀 훅
 * 
 * 사용 예시:
 * ```tsx
 * useLocationPermission({ autoPrompt: true })
 * ```
 */
export function useLocationPermission(options: UseLocationPermissionOptions = {}) {
  const {
    autoPrompt = true,
  } = options

  const location = useLocation()
  const [hasShownPrompt, setHasShownPrompt] = useState(false)

  const hasLocation = !!(location.latitude && location.longitude)
  const isLocationError = !!location.error && location.permissionState === 'denied'

  // 자동으로 위치 권한 요청 (브라우저 네이티브 프롬프트)
  useEffect(() => {
    if (
      autoPrompt &&
      !hasShownPrompt &&
      !location.isLoading &&
      !hasLocation &&
      location.permissionState === 'prompt'
    ) {
      setHasShownPrompt(true)
      // 브라우저 네이티브 Geolocation 권한 프롬프트 표시
      location.fetchLocation()
    }
  }, [autoPrompt, hasShownPrompt, location.isLoading, hasLocation, location.permissionState, location.fetchLocation])

  return location
}
