// 카카오톡 공유 기능을 위한 유틸리티
import { loadKakaoSDK, initializeKakao } from './kakao-sdk-loader'
import { createLogger } from './logger'

const log = createLogger('KakaoShare')

declare global {
  interface Window {
    Kakao: any;
  }
}

export interface KakaoShareData {
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
}

class KakaoShareService {
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async init() {
    if (this.initialized) return this.initPromise || Promise.resolve();
    if (typeof window === 'undefined') return Promise.resolve();
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = (async () => {
      try {
        const jsKey = process.env.NEXT_PUBLIC_KAKAO_API_KEY;
        if (!jsKey) {
          log.warn('Kakao API key not configured')
          throw new Error('Kakao key not found');
        }
        await loadKakaoSDK()
        await initializeKakao(jsKey)
        this.initialized = true;
        log.info('Kakao Share Service initialized')
      } catch (error) {
        log.error('Failed to initialize Kakao Share Service', error)
        throw error;
      }
    })()
    return this.initPromise
  }

  async share(data: KakaoShareData): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      log.error('Kakao SDK not initialized')
      return false;
    }
    try {
      await window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl || 'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png',
          link: { mobileWebUrl: data.url, webUrl: data.url },
        },
        buttons: [{ title: '자세히 보기', link: { mobileWebUrl: data.url, webUrl: data.url } }],
      });
      log.info('Shared to Kakao successfully')
      return true;
    } catch (error) {
      log.error('Failed to share to Kakao', error)
      return false;
    }
  }

  async shareStory(data: KakaoShareData): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      log.error('Kakao SDK not initialized')
      return false;
    }
    try {
      await window.Kakao.Story.share({ url: data.url, text: `${data.title}\n${data.description}` });
      log.info('Shared to Kakao Story successfully')
      return true;
    } catch (error) {
      log.error('Failed to share to Kakao Story', error)
      return false;
    }
  }

  isReady(): boolean {
    return typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized();
  }
}

export const kakaoShareService = new KakaoShareService();

// 하위 호환성을 위한 alias
export const kakaoShare = kakaoShareService;

export async function shareToKakao(data: KakaoShareData): Promise<boolean> {
  try {
    await kakaoShareService.init();
    return await kakaoShareService.share(data);
  } catch (error) {
    log.error('Failed to share to Kakao', error)
    return false;
  }
}

export async function shareToKakaoStory(data: KakaoShareData): Promise<boolean> {
  try {
    await kakaoShareService.init();
    return await kakaoShareService.shareStory(data);
  } catch (error) {
    log.error('Failed to share to Kakao Story', error)
    return false;
  }
}
