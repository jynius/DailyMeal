// 공유 기능을 위한 유틸리티 함수들

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

  // 소셜 미디어 공유 URL 생성
  getSocialShareUrl(platform: 'kakao' | 'facebook' | 'twitter' | 'instagram', data: ShareData) {
    const encodedUrl = encodeURIComponent(data.url)
    const encodedText = encodeURIComponent(data.description)
    // const encodedTitle = encodeURIComponent(data.title)

    switch (platform) {
      case 'kakao':
        // 카카오톡은 SDK 필요, 여기서는 기본 공유
        return `https://story.kakao.com/share?url=${encodedUrl}&text=${encodedText}`
      
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
      
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
      
      case 'instagram':
        // 인스타그램은 직접 URL 공유 불가, 클립보드 복사 안내
        return null
      
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