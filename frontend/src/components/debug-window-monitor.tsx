'use client'

import { useEffect } from 'react'

/**
 * 디버깅용: window.open 호출 모니터링
 * WebView 앱에서 카카오톡 공유가 작동하지 않는 문제 디버깅
 */
export function DebugWindowMonitor() {
  useEffect(() => {
    if (globalThis.window === undefined) return

    console.log('🔍 [DEBUG-MONITOR] Installing window.open monitor...')

    // 원본 window.open 저장
    const originalOpen = globalThis.window.open

    // window.open 오버라이드
    globalThis.window.open = function (...args) {
      const [url, target, features] = args
      console.log('🪟 [DEBUG-MONITOR] window.open called!')
      console.log('  └─ URL:', url)
      console.log('  └─ Target:', target)
      console.log('  └─ Features:', features)
      console.log('  └─ Call stack:', new Error('Stack trace').stack)

      // 특수 URL 감지
      if (url) {
        if (typeof url === 'string') {
          if (url.startsWith('intent://')) {
            console.log('🎯 [DEBUG-MONITOR] Intent URL detected!')
          } else if (url.startsWith('kakaotalk://')) {
            console.log('🎯 [DEBUG-MONITOR] Kakao URL detected!')
          }
        }
      }

      // 원본 함수 호출
      const result = originalOpen.apply(globalThis, args as any)
      console.log('  └─ Result:', result)
      return result
    }

    console.log('✅ [DEBUG-MONITOR] window.open monitor installed')

    return () => {
      // 정리
      globalThis.window.open = originalOpen
      console.log('🔍 [DEBUG-MONITOR] window.open monitor removed')
    }
  }, [])

  return null
}
