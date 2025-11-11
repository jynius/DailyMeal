'use client'

import { useEffect, useRef, useState } from 'react'
import { useKakaoMap } from '@/hooks/use-kakao-map'
import { useLocation } from '@/contexts/location-context'
import { MapPin, Navigation, Loader2 } from 'lucide-react'

interface MapProps {
  readonly latitude?: number
  readonly longitude?: number
  readonly level?: number
  readonly markers?: Array<{
    lat: number
    lng: number
    title?: string
    content?: string
  }>
  readonly onLocationSelect?: (lat: number, lng: number) => void
  readonly className?: string
}

export function KakaoMap({
  latitude = 37.5665,
  longitude = 126.978,
  level = 3,
  markers = [],
  onLocationSelect,
  className = 'w-full h-64',
}: Readonly<MapProps>) {
  const mapRef = useRef<HTMLDivElement>(null)
  const { isLoaded, error } = useKakaoMap()
  const [mapState, setMapState] = useState<{
    map: unknown
    initialized: boolean
  }>({
    map: null,
    initialized: false,
  })
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null)
  const {
    permissionState,
    fetchLocation,
    latitude: contextLat,
    longitude: contextLng,
  } = useLocation()

  const { map } = mapState

  // ✅ Context에서 위치 가져오기 (권한 관리 자동)
  const getCurrentLocation = () => {
    if (permissionState === 'denied') {
      console.warn('위치 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.')
      return
    }

    // Context의 fetchLocation 호출 (권한 있으면 팝업 없음)
    fetchLocation()
  }

  // Context에서 위치 받아오면 지도 중심 이동
  useEffect(() => {
    if (contextLat && contextLng && map) {
      const lat = contextLat
      const lng = contextLng
      setCurrentPosition({ lat, lng })

      const moveLatLon = new globalThis.window.kakao.maps.LatLng(lat, lng)
      ;(map as { setCenter: (position: unknown) => void }).setCenter(moveLatLon)
    }
  }, [contextLat, contextLng, map])

  // 컴포넌트 마운트시 권한 있으면 자동 위치 가져오기
  useEffect(() => {
    if (isLoaded && map && !currentPosition && permissionState === 'granted') {
      getCurrentLocation()
    }
  }, [isLoaded, map, currentPosition, permissionState])

  // 지도 초기화
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const options = {
        center: new globalThis.window.kakao.maps.LatLng(latitude, longitude),
        level: level,
      }

      const kakaoMap = new globalThis.window.kakao.maps.Map(mapRef.current, options)
      setMapState({ map: kakaoMap, initialized: true })

      // 지도 클릭 이벤트
      if (onLocationSelect) {
        globalThis.window.kakao.maps.event.addListener(
          kakaoMap,
          'click',
          (mouseEvent: { latLng: { getLat: () => number; getLng: () => number } }) => {
            const latlng = mouseEvent.latLng
            onLocationSelect(latlng.getLat(), latlng.getLng())
          }
        )
      }
    }
  }, [isLoaded, latitude, longitude, level, onLocationSelect, map])

  // 마커 추가
  useEffect(() => {
    if (map && markers.length > 0) {
      for (const markerData of markers) {
        const markerPosition = new globalThis.window.kakao.maps.LatLng(
          markerData.lat,
          markerData.lng
        )

        const marker = new globalThis.window.kakao.maps.Marker({
          position: markerPosition,
          title: markerData.title,
        })

        ;(marker as { setMap: (map: unknown) => void }).setMap(map)

        // 인포윈도우 추가
        if (markerData.content) {
          const infowindow = new globalThis.window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;">${markerData.content}</div>`,
          })

          globalThis.window.kakao.maps.event.addListener(marker, 'click', () => {
            ;(infowindow as { open: (map: unknown, marker: unknown) => void }).open(map, marker)
          })
        }
      }
    }
  }, [markers, map])

  // 🔧 API 키 에러시 간단한 안내 메시지 (모든 Hook 호출 후)
  if (error) {
    return (
      <div
        className={`${className} bg-gray-50 rounded-lg flex flex-col items-center justify-center`}
      >
        <MapPin size={40} className="text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 text-center px-4">카카오 지도를 사용할 수 없습니다</p>
        <p className="text-xs text-gray-500 text-center px-4 mt-1">API 키 설정이 필요합니다</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`${className} bg-gray-50 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">지도 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden border border-gray-200`}>
      <div ref={mapRef} className="w-full h-full" />

      {/* 현재 위치 버튼 */}
      <button
        onClick={getCurrentLocation}
        className="absolute top-3 right-3 bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        title="현재 위치로 이동"
      >
        <Navigation size={18} className="text-gray-600" />
      </button>

      {/* 현재 위치 표시 */}
      {currentPosition && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 border border-gray-200">
          📍 현재 위치: {currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)}
        </div>
      )}
    </div>
  )
}
