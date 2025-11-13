'use client'

import { useEffect } from 'react'
import { initializeWebViewBridge } from '@/lib/webview-bridge'

// 디버그: 파일이 로드되었는지 확인
console.log('🟢 [WebViewBridgeInit] Component file loaded!')

// 즉시 실행 (React 렌더링 전에 초기화)
if (globalThis.window !== undefined) {
  console.log('🟡 [WebViewBridgeInit] Calling initializeWebViewBridge() immediately...')
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
    console.log('🔵 [WebViewBridgeInit] useEffect called, initializing bridge...')
    initializeWebViewBridge()
  }, [])

  return null
}
