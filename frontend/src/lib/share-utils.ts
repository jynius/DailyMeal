// 공유 기능을 위한 유틸리티 함수들
import { kakaoShare, type KakaoShareData } from './kakao-share'
import { createLogger } from './logger'

const log = createLogger('ShareUtils')

export interface ShareData {
  title: string
  description: string
  url: string
  imageUrl?: string
}

export const shareUtils = {
  // 네이티브 공유 (모바일)
  async nativeShare(data: ShareData) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.url,
        })
        return true
      } catch (err) {
        log.error('공유 실패:', err)
        return false
      }
    }
    return false
  },

  // URL 복사
  async copyToClipboard(url: string) {
    try {
      // 모던 Clipboard API 사용
      await navigator.clipboard.writeText(url)
      return true
    } catch (clipboardError) {
      // 폴백: Clipboard API가 지원되지 않는 경우
      // (예: HTTPS가 아닌 환경, 구형 브라우저)
      log.warn('Clipboard API failed, using fallback method', clipboardError)

      try {
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        // deprecated API이지만 폴백으로만 사용
        // eslint-disable-next-line deprecation/deprecation
        const successful = document.execCommand('copy')
        textArea.remove()
        return successful
      } catch (fallbackError) {
        log.error('Fallback copy method also failed', fallbackError)
        return false
      }
    }
  },

  // 카카오톡 공유 (SDK 사용)
  async shareKakao(data: ShareData) {
    // ShareData는 meal-card.tsx에서 이미 절대 경로로 변환된 imageUrl을 받음
    // 따라서 추가 변환 없이 그대로 사용
    const kakaoData: KakaoShareData = {
      title: data.title,
      description: data.description,
      url: data.url,
      imageUrl: data.imageUrl, // 이미 절대 경로
    }

    log.info('📤 Preparing Kakao share data:', {
      ...kakaoData,
      imageUrl: kakaoData.imageUrl ? 'Present ✅' : 'Missing ❌',
    })

    return await kakaoShare.share(kakaoData)
  },

  // 소셜 미디어 공유 URL 생성
  getSocialShareUrl(platform: 'facebook' | 'twitter', data: ShareData) {
    const encodedUrl = encodeURIComponent(data.url)
    const encodedText = encodeURIComponent(data.description)

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`

      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`

      default:
        return null
    }
  },

  // 이미지 다운로드
  async downloadImage(imageUrl: string, filename: string) {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = globalThis.window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      globalThis.window.URL.revokeObjectURL(url)

      return true
    } catch (err) {
      log.error('이미지 다운로드 실패:', err)
      return false
    }
  },
}
