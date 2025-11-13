'use client'

import { useEffect } from 'react'
import { initializeWebViewBridge } from '@/lib/webview-bridge'

// 즉시 실행 - 모듈 로드 시 바로 alert
if (globalThis.window?.ReactNativeWebView) {
  alert('🔴 [Module Level] ReactNativeWebView detected at module load!')
}

/**
 * WebView Bridge Initializer
 *
 * React Native WebView 환경에서만 동작하는 브리지를 초기화합니다.
 * PWA 환경에서는 아무 동작도 하지 않습니다.
 */
export function WebViewBridgeInit() {
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    console.log('🟢 [WebViewBridgeInit] Component mounted in browser')
    console.log('🟡 [WebViewBridgeInit] Calling initializeWebViewBridge()...')

    // 디버그: Alert로 상세 정보 확인
    const hasReactNativeWebView = !!globalThis.window?.ReactNativeWebView
    alert(
      `WebViewBridgeInit:\nReactNativeWebView: ${hasReactNativeWebView ? 'YES ✅' : 'NO ❌'}\n\nNow initializing bridge...`
    )

    initializeWebViewBridge()

    // 초기화 후 다시 확인
    setTimeout(() => {
      alert('Bridge initialized!\nNow try Kakao Share.')
    }, 1000)
  }, [])

  return null
}
