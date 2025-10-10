// 공유 기능을 위한 유틸리티 함수들
import { kakaoShare, type KakaoShareData } from './kakao-share'

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
        console.error('공유 실패:', err)
        return false
      }
    }
    return false
  },

  // URL 복사
  async copyToClipboard(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      // 폴백: 구식 방법
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    }
  },

  // 카카오톡 공유 (SDK 사용)
  async shareKakao(data: ShareData) {
    // 이미지 URL을 절대 경로로 변환
    let imageUrl = data.imageUrl
    if (imageUrl && !imageUrl.startsWith('http')) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      imageUrl = `${apiUrl}${imageUrl}`
    }
    
    const kakaoData: KakaoShareData = {
      title: data.title,
      description: data.description,
      url: data.url,
      imageUrl: imageUrl,
    }
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
      const url = window.URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (err) {
      console.error('이미지 다운로드 실패:', err)
      return false
    }
  }
}