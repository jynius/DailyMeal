'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void
        LatLng: new (lat: number, lng: number) => unknown
        Map: new (container: HTMLElement, options: unknown) => unknown
        Marker: new (options: unknown) => unknown
        InfoWindow: new (options: unknown) => unknown
        event: {
          addListener: (target: unknown, type: string, handler: unknown) => void
        }
      }
    }
  }
}

export function useKakaoMap() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 이미 로드되어 있으면 바로 사용 가능
    if (window.kakao && window.kakao.maps) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY

    if (!apiKey || apiKey === 'your_kakao_map_api_key_here') {
      // 개발 환경에서는 더미 지도 사용
      console.warn('카카오 지도 API 키가 설정되지 않음. 더미 지도를 사용합니다.')
      setError('API 키 없음')
      return
    }

    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
    script.async = true

    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsLoaded(true)
      })
    }

    script.onerror = () => {
      setError('카카오 지도 로드 실패')
    }

    document.head.appendChild(script)

    return () => {
      // 컴포넌트 언마운트시 스크립트 정리
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return { isLoaded, error }
}