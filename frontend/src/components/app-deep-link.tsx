'use client'

import { useEffect } from 'react'

interface AppDeepLinkProps {
  shareId: string
}

export function AppDeepLink({ shareId }: AppDeepLinkProps) {
  useEffect(() => {
    // 모바일인지 확인
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    // 이미 앱 열기를 시도했는지 확인 (중복 시도 방지)
    const attempted = sessionStorage.getItem(`app-open-attempted-${shareId}`)
    if (attempted) return

    sessionStorage.setItem(`app-open-attempted-${shareId}`, 'true')

    // 앱 열기 시도
    tryOpenInApp()
  }, [shareId])

  const tryOpenInApp = () => {
    const deepLinkUrl = `dailymeal://share/meal/${shareId}`

    // Custom Scheme Deep Link 시도 (앱이 설치되어 있으면 열림)
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = deepLinkUrl
    document.body.appendChild(iframe)

    // 1초 후 iframe 제거
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        iframe.remove()
      }
    }, 1000)
  }

  return null // 렌더링할 UI 없음
}
