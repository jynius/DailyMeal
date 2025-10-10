/**
 * Kakao SDK Dynamic Loader
 * 
 * Kakao SDK를 필요한 시점에만 동적으로 로드합니다.
 * Root Layout에서 전역 로드하는 것보다 성능상 유리합니다.
 */

import { createLogger } from './logger'

const log = createLogger('KakaoSDK')

let isLoading = false
let isLoaded = false

/**
 * Kakao SDK 동적 로드
 */
export async function loadKakaoSDK(): Promise<void> {
  // 이미 로드된 경우
  if (isLoaded && window.Kakao) {
    log.debug('Kakao SDK already loaded')
    return
  }

  // 로딩 중인 경우 대기
  if (isLoading) {
    log.debug('Kakao SDK loading in progress, waiting...')
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (isLoaded && window.Kakao) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    })
  }

  isLoading = true
  log.info('Loading Kakao SDK dynamically')

  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script')
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.8/kakao.min.js'
      script.async = true
      
      script.onload = () => {
        log.info('Kakao SDK loaded successfully', { version: window.Kakao?.VERSION })
        isLoaded = true
        isLoading = false
        resolve()
      }
      
      script.onerror = (error) => {
        log.error('Failed to load Kakao SDK', error)
        isLoading = false
        reject(new Error('Kakao SDK 로드 실패'))
      }
      
      document.head.appendChild(script)
    } catch (error) {
      log.error('Error appending Kakao SDK script', error)
      isLoading = false
      reject(error)
    }
  })
}

/**
 * Kakao SDK 로드 여부 확인
 */
export function isKakaoSDKLoaded(): boolean {
  return isLoaded && !!window.Kakao
}

/**
 * Kakao 앱 키로 초기화
 */
export async function initializeKakao(appKey: string): Promise<void> {
  await loadKakaoSDK()
  
  if (!window.Kakao) {
    throw new Error('Kakao SDK not loaded')
  }
  
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(appKey)
    log.info('Kakao SDK initialized', { appKey: appKey.substring(0, 10) + '...' })
  }
}
