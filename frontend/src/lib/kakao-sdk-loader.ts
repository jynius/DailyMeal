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

      // 10초 타임아웃
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!isLoaded) {
          log.error('Kakao SDK loading timeout')
        }
      }, 10000)
    })
  }

  isLoading = true
  log.info('Loading Kakao SDK dynamically from CDN...')

  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script')
      // Kakao JavaScript SDK v2.7.2 - CDN
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
      script.async = true
      script.crossOrigin = 'anonymous'
      script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4'

      script.onload = () => {
        // 대문자 Kakao 확인
        if (!window.Kakao) {
          log.error('❌ window.Kakao not found after script load')
          log.info('Available: window.kakao (maps):', !!window.kakao)
          isLoading = false
          reject(new Error('Kakao SDK 로드 실패: window.Kakao not found'))
          return
        }

        log.info('✅ Kakao SDK loaded successfully', {
          version: window.Kakao?.VERSION,
          hasKakao: !!window.Kakao,
        })

        // Note: Share, Auth 등의 모듈은 init() 호출 후에 사용 가능합니다

        isLoaded = true
        isLoading = false
        resolve()
      }

      script.onerror = (error) => {
        const errorMsg = 'Failed to load Kakao SDK from CDN'
        log.error('❌ ' + errorMsg, {
          error,
          src: script.src,
          readyState: (error as any)?.target?.readyState,
        })
        isLoading = false
        reject(new Error(errorMsg))
      }

      log.debug('Appending Kakao SDK script to <head>')
      document.head.appendChild(script)
    } catch (error) {
      const errorMsg = 'Error appending Kakao SDK script'
      log.error('❌ ' + errorMsg, error)
      isLoading = false
      reject(new Error(errorMsg))
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
    const error = 'Kakao SDK not loaded - window.Kakao is undefined'
    log.error('❌ ' + error)
    throw new Error(error)
  }

  if (!window.Kakao.isInitialized()) {
    try {
      log.info('Initializing Kakao with app key...')
      window.Kakao.init(appKey)
      log.info('✅ Kakao SDK initialized', {
        appKey: appKey.substring(0, 10) + '...',
        isInitialized: window.Kakao.isInitialized(),
      })
    } catch (error) {
      log.error('❌ Failed to initialize Kakao SDK', error)
      throw error
    }
  } else {
    log.debug('Kakao SDK already initialized')
  }
}
