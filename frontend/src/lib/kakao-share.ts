// 카카오톡 공유 기능을 위한 유틸리티

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

  // 카카오 SDK 초기화 (SDK는 layout.tsx에서 로드됨)
  init() {
    if (this.initialized) return this.initPromise || Promise.resolve();
    
    if (typeof window === 'undefined') return Promise.resolve();
    
    // 이미 초기화 중이면 기존 Promise 반환
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve, reject) => {
      // 카카오 API 키 (지도 + JavaScript SDK 공통)
      const jsKey = process.env.NEXT_PUBLIC_KAKAO_API_KEY;
      if (!jsKey) {
        console.warn('카카오 API 키가 설정되지 않았습니다.');
        reject(new Error('Kakao key not found'));
        return;
      }

      // SDK가 이미 로드되어 있는지 확인
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          try {
            window.Kakao.init(jsKey);
            this.initialized = true;
            console.log('✅ Kakao SDK initialized');
            resolve();
          } catch (error) {
            console.error('❌ Kakao SDK 초기화 실패:', error);
            reject(error);
          }
        } else {
          this.initialized = true;
          console.log('✅ Kakao SDK already initialized');
          resolve();
        }
        return;
      }

      // SDK 로드를 기다림 (최대 10초)
      let attempts = 0;
      const maxAttempts = 100; // 10초 (100ms * 100)
      
      const checkKakao = setInterval(() => {
        attempts++;
        
        if (window.Kakao) {
          clearInterval(checkKakao);
          if (!window.Kakao.isInitialized()) {
            try {
              window.Kakao.init(jsKey);
              this.initialized = true;
              console.log('✅ Kakao SDK initialized');
              resolve();
            } catch (error) {
              console.error('❌ Kakao SDK 초기화 실패:', error);
              reject(error);
            }
          } else {
            this.initialized = true;
            console.log('✅ Kakao SDK already initialized');
            resolve();
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(checkKakao);
          const error = new Error('Kakao SDK 로드 타임아웃');
          console.error('❌', error.message);
          reject(error);
        }
      }, 100);
    });
    
    return this.initPromise;
  }

  // 카카오톡 공유하기
  async share(data: KakaoShareData): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      console.error('Kakao SDK가 초기화되지 않았습니다.');
      return false;
    }

    try {
      await window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl || 'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png',
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
      });
      return true;
    } catch (error) {
      console.error('카카오톡 공유 실패:', error);
      return false;
    }
  }

  // 카카오톡 스토리 공유하기
  async shareStory(data: KakaoShareData): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      console.error('Kakao SDK가 초기화되지 않았습니다.');
      return false;
    }

    try {
      await window.Kakao.Story.share({
        url: data.url,
        text: `${data.title}\n${data.description}`,
      });
      return true;
    } catch (error) {
      console.error('카카오 스토리 공유 실패:', error);
      return false;
    }
  }

  // SDK 초기화 상태 확인
  isReady(): boolean {
    return typeof window !== 'undefined' && 
           window.Kakao && 
           window.Kakao.isInitialized();
  }
}

export const kakaoShare = new KakaoShareService();
