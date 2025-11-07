// 카카오톡 공유 기능을 위한 유틸리티
import { loadKakaoSDK, initializeKakao } from './kakao-sdk-loader'
import { createLogger } from './logger'

const log = createLogger('KakaoShare')

declare global {
  interface Window {
    Kakao: any
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

  async init() {
    if (this.initialized) return this.initPromise || Promise.resolve()
    if (typeof window === 'undefined') return Promise.resolve()
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
    if (typeof window === 'undefined') {
      log.warn('Cannot share on server-side')
      return false
    }

    if (!window.Kakao) {
      log.error('❌ Kakao SDK not loaded - window.Kakao is undefined')
      return false
    }

    if (!window.Kakao.isInitialized()) {
      log.error('❌ Kakao SDK not initialized')
      return false
    }

    // Kakao.Share 또는 Kakao.Link 확인
    const shareMethod = window.Kakao.Share || window.Kakao.Link

    if (!shareMethod) {
      log.error('❌ No share method available. Kakao.Share and Kakao.Link are both undefined.')
      log.error('Available Kakao properties:', Object.keys(window.Kakao))
      return false
    }

    log.info('Using Kakao share method:', shareMethod === window.Kakao.Share ? 'Share' : 'Link')

    try {
      log.info('Sharing to Kakao', {
        title: data.title,
        url: data.url, // 🔍 전체 URL 로그
        hasImage: !!data.imageUrl,
        imageUrl: data.imageUrl?.substring(0, 50) + '...',
      })

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

      log.info('🔍 Kakao share payload:', sharePayload) // debug → info로 변경

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
    if (typeof window === 'undefined') return false
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      log.error('Kakao SDK not initialized')
      return false
    }
    try {
      await window.Kakao.Story.share({ url: data.url, text: `${data.title}\n${data.description}` })
      log.info('Shared to Kakao Story successfully')
      return true
    } catch (error) {
      log.error('Failed to share to Kakao Story', error)
      return false
    }
  }

  isReady(): boolean {
    return typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized()
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
