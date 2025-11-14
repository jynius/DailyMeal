'use client'

import { useEffect } from 'react'
import { initializeBridge } from '@/lib/webview-bridge'

/**
 * WebView Bridge Initializer
 *
 * React Native WebView 환경에서만 동작하는 브리지를 초기화합니다.
 * PWA 환경에서는 아무 동작도 하지 않습니다.
 */
export function WebViewBridgeInit() {
  useEffect(() => {
    // Bridge 초기화 함수 실행
    initializeBridge()
  }, [])

  return null
}
