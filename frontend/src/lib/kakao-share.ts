// 카카오톡 공유 기능을 위한 유틸리티
import { loadKakaoSDK, initializeKakao } from './kakao-sdk-loader'
import { createLogger } from './logger'

const log = createLogger('KakaoShare')

declare global {
  interface Window {
    Kakao: any
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }
}

export interface KakaoShareData {
  title: string
  description: string
  imageUrl?: string
  url: string
}

class KakaoShareService {
  private initialized = false
  private initPromise: Promise<void> | null = null

  /**
   * WebView 환경인지 감지
   */
  private isWebView(): boolean {
    return globalThis.window?.ReactNativeWebView !== undefined
  }

  async init() {
    if (this.initialized) return this.initPromise
    if (globalThis.window === undefined) return
    if (this.initPromise) return this.initPromise

    this.initPromise = (async () => {
      try {
        const jsKey = process.env.NEXT_PUBLIC_KAKAO_API_KEY

        log.info('Initializing Kakao SDK', {
          hasKey: !!jsKey,
          keyPreview: jsKey ? jsKey.substring(0, 10) + '...' : 'N/A',
        })

        if (!jsKey) {
          const error = 'NEXT_PUBLIC_KAKAO_API_KEY not configured in .env'
          log.error(error)
          throw new Error(error)
        }

        await loadKakaoSDK()
        log.info('Kakao SDK loaded, initializing with key...')

        await initializeKakao(jsKey)
        this.initialized = true
        log.info('✅ Kakao Share Service initialized successfully')
      } catch (error) {
        log.error('❌ Failed to initialize Kakao Share Service', error)
        throw error
      }
    })()
    return this.initPromise
  }

  async share(data: KakaoShareData): Promise<boolean> {
    if (globalThis.window === undefined) {
      log.warn('Cannot share on server-side')
      return false
    }

    // 🔥 WebView 환경 감지 (로그만 출력, 웹뷰에서도 카카오 SDK 사용)
    if (this.isWebView()) {
      log.info('📱 WebView detected - using Kakao SDK in WebView')
    }

    if (!globalThis.window?.Kakao) {
      log.error('❌ Kakao SDK not loaded - window.Kakao is undefined')
      return false
    }

    if (!globalThis.window.Kakao.isInitialized()) {
      log.error('❌ Kakao SDK not initialized')
      return false
    }

    // Kakao.Share 또는 Kakao.Link 확인
    const shareMethod = globalThis.window?.Kakao.Share || globalThis.window?.Kakao.Link

    if (!shareMethod) {
      log.error('❌ No share method available. Kakao.Share and Kakao.Link are both undefined.')
      log.error('Available Kakao properties:', Object.keys(globalThis.window?.Kakao))
      return false
    }

    log.info(
      'Using Kakao share method:',
      shareMethod === globalThis.window?.Kakao.Share ? 'Share' : 'Link'
    )

    // 🔍 카카오톡 설치 여부 확인 (모바일만)
    // 참고: 설치 여부와 관계없이 공유는 시도합니다.
    // - 모바일 + 설치됨: 카카오톡 앱으로 공유
    // - 모바일 + 미설치: 브라우저의 intent:// 처리 (Play Store 이동)
    // - 데스크탑: 카카오톡 for Windows/Mac 또는 QR 코드
    if (shareMethod.isAvailableInAppShare) {
      const isInstalled = shareMethod.isAvailableInAppShare()
      log.info('📱 Kakao Talk installed:', isInstalled)
    }

    try {
      log.info('Sharing to Kakao', {
        title: data.title,
        url: data.url,
        hasImage: !!data.imageUrl,
        imageUrl: data.imageUrl?.substring(0, 50) + '...',
      })

      // 🔧 WebView 환경: Kakao SDK 우회하고 직접 공유 URL 생성
      if (this.isWebView()) {
        log.debug('Original data.url: ' + data.url, 'KakaoShare')

        // localhost를 실제 도메인으로 변환 (Kakao 도메인 검증 통과)
        const shareUrl = data.url
          .replace('http://localhost:3000', 'https://www.dailymeal.life')
          .replace('http://192.170.1.58:3000', 'https://www.dailymeal.life')

        log.debug('Converted shareUrl: ' + shareUrl, 'KakaoShare')

        // Kakao 공유 페이지 URL 직접 생성
        const kakaoShareUrl = new URL('https://sharer.kakao.com/talk/friends/picker/link')
        kakaoShareUrl.searchParams.set('app_key', process.env.NEXT_PUBLIC_KAKAO_API_KEY || '')
        kakaoShareUrl.searchParams.set('validation_action', 'default')
        kakaoShareUrl.searchParams.set(
          'validation_params',
          JSON.stringify({
            templateObject: {
              objectType: 'feed',
              content: {
                title: data.title,
                description: data.description,
                imageUrl:
                  data.imageUrl ||
                  'https://k.kakaocdn.net/14/dn/btqvX1CL6kz/sSBw1mbWkyZTkk1Mpt9nw1/o.jpg',
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
              buttons: [
                {
                  title: '자세히 보기',
                  link: {
                    mobileWebUrl: shareUrl,
                    webUrl: shareUrl,
                  },
                },
              ],
            },
          })
        )

        log.info('🔗 Opening Kakao share URL:', kakaoShareUrl.toString())

        // 외부 브라우저로 열기
        globalThis.window.open(kakaoShareUrl.toString(), '_blank')

        return true
      }

      // 일반 웹/PWA: Kakao SDK 사용
      const sharePayload = {
        objectType: 'feed',
        content: {
          title: data.title,
          description: data.description,
          imageUrl:
            data.imageUrl ||
            'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png',
          link: {
            mobileWebUrl: data.url,
            webUrl: data.url,
          },
        },
        buttons: [
          {
            title: '자세히 보기',
            link: {
              mobileWebUrl: data.url,
              webUrl: data.url,
            },
          },
        ],
      }

      log.info('🔍 Kakao share payload:', sharePayload)

      // Kakao.Share.sendDefault 또는 Kakao.Link.sendDefault 사용
      const result = await shareMethod.sendDefault(sharePayload)

      log.info('✅ Kakao Share API 호출 완료', { result })

      return true
    } catch (error) {
      log.error('❌ Failed to share to Kakao', error)
      return false
    }
  }

  async shareStory(data: KakaoShareData): Promise<boolean> {
    if (globalThis.window === undefined) return false
    if (!globalThis.window?.Kakao.isInitialized()) {
      log.error('Kakao SDK not initialized')
      return false
    }
    try {
      await globalThis.window.Kakao.Story.share({
        url: data.url,
        text: `${data.title}\n${data.description}`,
      })
      log.info('Shared to Kakao Story successfully')
      return true
    } catch (error) {
      log.error('Failed to share to Kakao Story', error)
      return false
    }
  }

  isReady(): boolean {
    return globalThis.window?.Kakao.isInitialized()
  }

  /**
   * 카카오톡 앱 설치 여부 확인 (모바일만)
   * @returns true: 설치됨, false: 미설치 또는 확인 불가
   */
  isKakaoTalkInstalled(): boolean {
    if (!globalThis.window?.Kakao?.isInitialized()) {
      return false
    }

    const shareMethod = globalThis.window.Kakao.Share || globalThis.window.Kakao.Link
    // 데스크탑이거나 API 없으면 true 반환 (비활성화 안 함)
    if (!shareMethod?.isAvailableInAppShare) {
      return true
    }

    try {
      const isInstalled = shareMethod.isAvailableInAppShare()
      log.info('📱 KakaoTalk installation check:', isInstalled)
      return isInstalled
    } catch (error) {
      log.warn('Failed to check KakaoTalk installation:', error)
      return true // 확인 실패 시 비활성화 안 함
    }
  }
}

export const kakaoShareService = new KakaoShareService()

// 하위 호환성을 위한 alias
export const kakaoShare = kakaoShareService

export async function shareToKakao(data: KakaoShareData): Promise<boolean> {
  try {
    await kakaoShareService.init()
    return await kakaoShareService.share(data)
  } catch (error) {
    log.error('Failed to share to Kakao', error)
    return false
  }
}

export async function shareToKakaoStory(data: KakaoShareData): Promise<boolean> {
  try {
    await kakaoShareService.init()
    return await kakaoShareService.shareStory(data)
  } catch (error) {
    log.error('Failed to share to Kakao Story', error)
    return false
  }
}
