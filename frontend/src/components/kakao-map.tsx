'use client'

import { useEffect, useRef, useState } from 'react'
import { useKakaoMap } from '@/hooks/use-kakao-map'
import { MapPin, Navigation, Loader2 } from 'lucide-react'

interface MapProps {
  latitude?: number
  longitude?: number
  level?: number
  markers?: Array<{
    lat: number
    lng: number
    title?: string
    content?: string
  }>
  onLocationSelect?: (lat: number, lng: number) => void
  className?: string
}

export function KakaoMap({ 
  latitude = 37.5665, 
  longitude = 126.9780, 
  level = 3,
  markers = [],
  onLocationSelect,
  className = "w-full h-64"
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const { isLoaded, error } = useKakaoMap()
    const [mapState, setMapState] = useState<{
    map: unknown | null
    initialized: boolean
  }>({
    map: null,
    initialized: false
  })
  const [currentPosition, setCurrentPosition] = useState<{ lat: number, lng: number } | null>(null)

  const { map } = mapState

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCurrentPosition({ lat, lng })
          
          if (map) {
            const moveLatLon = new window.kakao.maps.LatLng(lat, lng)
            ;(map as unknown as { setCenter: (position: unknown) => void }).setCenter(moveLatLon)
          }
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error)
        }
      )
    }
  }

  // 지도 초기화
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: level,
      }

      const kakaoMap = new window.kakao.maps.Map(mapRef.current, options)
      setMapState({ map: kakaoMap, initialized: true })

      // 지도 클릭 이벤트
      if (onLocationSelect) {
        window.kakao.maps.event.addListener(kakaoMap, 'click', (mouseEvent: { latLng: { getLat: () => number, getLng: () => number } }) => {
          const latlng = mouseEvent.latLng
          onLocationSelect(latlng.getLat(), latlng.getLng())
        })
      }
    }
  }, [isLoaded, latitude, longitude, level, onLocationSelect, map])

  // 마커 추가
  useEffect(() => {
    if (map && markers.length > 0) {
      markers.forEach((markerData) => {
        const markerPosition = new window.kakao.maps.LatLng(markerData.lat, markerData.lng)
        
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          title: markerData.title,
        })

        ;(marker as unknown as { setMap: (map: unknown) => void }).setMap(map)

        // 인포윈도우 추가
        if (markerData.content) {
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;">${markerData.content}</div>`,
          })

          window.kakao.maps.event.addListener(marker, 'click', () => {
            ;(infowindow as unknown as { open: (map: unknown, marker: unknown) => void }).open(map, marker)
          })
        }
      })
    }
  }, [markers, map])

  // API 키가 없거나 에러 발생시 더미 지도
  if (error) {
    return (
      <div className={`${className} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center`}>
        <MapPin size={48} className="text-gray-400 mb-4" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">지도 미리보기</h3>
          <p className="text-sm text-gray-500 mb-4">
            카카오 지도 API 키를 설정하면<br />
            실제 지도가 표시됩니다
          </p>
          {markers.length > 0 && (
            <div className="text-xs text-gray-400">
              📍 {markers.length}개의 위치가 있습니다
            </div>
          )}
        </div>
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