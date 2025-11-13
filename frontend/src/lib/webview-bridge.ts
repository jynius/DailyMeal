/**
 * WebView Bridge for React Native App
 *
 * 이 스크립트는 WebView 환경에서만 실행되어 다음 기능을 제공합니다:
 * 1. location.href setter 오버라이드로 Intent URL 가로채기
 * 2. window.open 오버라이드로 팝업 URL 가로채기
 * 3. Intent/Kakao URL을 React Native로 전송
 */

export function initializeWebViewBridge() {
  console.log('🚀 [WebView Bridge] Initializing...')

  // React Native WebView 환경 체크는 로그만 남기고, 브리지는 항상 설치
  if (globalThis.window?.ReactNativeWebView) {
    console.log('✅ [WebView Bridge] ReactNativeWebView detected!')
  } else {
    console.log('⚠️ [WebView Bridge] ReactNativeWebView not available yet (may be injected later)')
  }

  // ========== 1. location.href setter 오버라이드 ==========
  const originalLocationDescriptor = Object.getOwnPropertyDescriptor(globalThis.location, 'href')
  const originalLocationSetter = originalLocationDescriptor ? originalLocationDescriptor.set : null

  Object.defineProperty(globalThis.location, 'href', {
    set: function (url: string) {
      console.log('🔗 [WebView Bridge] location.href setter called:', url)

      // Intent URL 감지
      if (url?.startsWith('intent://')) {
        console.log('📱 [WebView Bridge] ✅ INTENT URL DETECTED!')
        console.log('📱 [WebView Bridge] URL:', url.substring(0, 200))

        if (globalThis.window?.ReactNativeWebView) {
          globalThis.window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'INTENT_URL',
              url: url,
            })
          )
        } else {
          console.error('❌ [WebView Bridge] ReactNativeWebView not available!')
        }
        return // 실제 네비게이션 차단
      }

      // Kakao URL 감지
      if (url?.startsWith('kakaotalk://') || url?.startsWith('kakaokompassauth://')) {
        console.log('📱 [WebView Bridge] ✅ KAKAO URL DETECTED!')

        if (globalThis.window?.ReactNativeWebView) {
          globalThis.window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'KAKAO_URL',
              url: url,
            })
          )
        } else {
          console.error('❌ [WebView Bridge] ReactNativeWebView not available!')
        }
        return
      }

      // 일반 URL은 정상 처리
      console.log('➡️ [WebView Bridge] Normal URL, passing through')
      if (originalLocationSetter) {
        originalLocationSetter.call(globalThis.location, url)
      }
    },
    get: function () {
      return originalLocationDescriptor
        ? originalLocationDescriptor.get!.call(globalThis.location)
        : undefined
    },
  })

  // ========== 2. window.open 오버라이드 ==========
  const originalOpen = globalThis.open
  globalThis.open = function (
    url?: string | URL,
    target?: string,
    features?: string
  ): Window | null {
    const urlString = url?.toString() || ''
    console.log('🪟 [WebView Bridge] window.open called:', urlString)

    if (urlString.startsWith('intent://')) {
      console.log('📱 [WebView Bridge] Intent in window.open')
      if (globalThis.window?.ReactNativeWebView) {
        globalThis.window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'INTENT_URL',
            url: urlString,
          })
        )
      }
      return null
    }

    if (urlString.startsWith('kakaotalk://') || urlString.startsWith('kakaokompassauth://')) {
      console.log('📱 [WebView Bridge] Kakao in window.open')
      if (globalThis.window?.ReactNativeWebView) {
        globalThis.window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'KAKAO_URL',
            url: urlString,
          })
        )
      }
      return null
    }

    return originalOpen.call(globalThis, url, target, features)
  }

  console.log('✅ [WebView Bridge] All hooks installed successfully')
}

// TypeScript 타입 확장
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }
}
