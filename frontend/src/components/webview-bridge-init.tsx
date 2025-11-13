'use client'

import { useEffect } from 'react'
import { initializeWebViewBridge } from '@/lib/webview-bridge'

// 즉시 실행 (React 렌더링 전에 초기화)
if (globalThis.window !== undefined) {
  initializeWebViewBridge()
}

/**
 * WebView Bridge Initializer
 *
 * React Native WebView 환경에서만 동작하는 브리지를 초기화합니다.
 * PWA 환경에서는 아무 동작도 하지 않습니다.
 */
export function WebViewBridgeInit() {
  useEffect(() => {
    initializeWebViewBridge()
  }, [])

  return null
}
