'use client'

import { useState } from 'react'
import { MapPin, Search, Check } from 'lucide-react'
import { KakaoMap } from './kakao-map'

interface LocationSelectorProps {
  onLocationSelect: (location: { 
    lat: number
    lng: number
    address?: string
    placeName?: string
  }) => void
  initialLocation?: {
    lat: number
    lng: number
    address?: string
    placeName?: string
  }
}

export function LocationSelector({ onLocationSelect, initialLocation }: LocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    place_name: string
    road_address_name: string
    x: string
    y: string
  }>>([])
  const [isSearching, setIsSearching] = useState(false)

  // 지도에서 위치 선택
  const handleMapClick = (lat: number, lng: number) => {
    const newLocation = { lat, lng }
    setSelectedLocation(newLocation)
    
    // 역지오코딩으로 주소 가져오기 (실제 구현시)
    // geocodeLocation(lat, lng)
  }

  // 주소 검색 (카카오 로컬 API 사용)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    
    // 실제 구현시 카카오 로컬 API 호출
    // 현재는 더미 데이터
    setTimeout(() => {
      const dummyResults = [
        {
          place_name: `${searchQuery} 맛집 1`,
          road_address_name: '서울 강남구 테헤란로 123',
          x: '127.0276', // longitude
          y: '37.4979', // latitude
        },
        {
          place_name: `${searchQuery} 카페`,
          road_address_name: '서울 강남구 강남대로 456',
          x: '127.0286',
          y: '37.4989',
        },
      ]
      setSearchResults(dummyResults)
      setIsSearching(false)
    }, 1000)
  }

  // 검색 결과에서 위치 선택
  const handleResultSelect = (result: { place_name: string, road_address_name: string, x: string, y: string }) => {
    const location = {
      lat: parseFloat(result.y),
      lng: parseFloat(result.x),
      address: result.road_address_name,
      placeName: result.place_name,
    }
    setSelectedLocation(location)
    setSearchResults([])
    setSearchQuery('')
  }

  // 선택 확정
  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
    }
  }

  return (
    <div className="space-y-4">
      {/* 검색 섹션 */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="장소나 주소를 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSearching ? '검색 중...' : '검색'}
          </button>
        </div>

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultSelect(result)}
                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{result.place_name}</div>
                <div className="text-sm text-gray-500">{result.road_address_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 지도 */}
      <KakaoMap
        latitude={selectedLocation?.lat || 37.5665}
        longitude={selectedLocation?.lng || 126.9780}
        level={3}
        markers={selectedLocation ? [{
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          title: selectedLocation.placeName || '선택된 위치',
          content: selectedLocation.address || '선택된 위치',
        }] : []}
        onLocationSelect={handleMapClick}
        className="w-full h-64"
      />

      {/* 선택된 위치 정보 */}
      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <MapPin size={18} className="text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">선택된 위치</span>
              </div>
              {selectedLocation.placeName && (
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {selectedLocation.placeName}
                </div>
              )}
              {selectedLocation.address && (
                <div className="text-sm text-gray-600 mb-2">
                  {selectedLocation.address}
                </div>
              )}
              <div className="text-xs text-gray-500">
                좌표: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </div>
            </div>
            <button
              onClick={handleConfirm}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
            >
              <Check size={16} className="mr-1" />
              확인
            </button>
          </div>
        </div>
      )}

      {/* 도움말 */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        💡 <strong>사용법:</strong> 위의 검색창에서 장소를 찾거나, 지도를 직접 클릭하여 위치를 선택할 수 있습니다.
      </div>
    </div>
  )
}