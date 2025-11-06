'use client'

import { useState, useEffect } from 'react'
import { MapPin, Phone, ExternalLink, Loader2 } from 'lucide-react'
import { kakaoLocal, type RestaurantPlace } from '@/lib/kakao-local'
import { useLocation } from '@/contexts/location-context'
import { useKakaoMap } from '@/hooks/use-kakao-map'
import { createLogger } from '@/lib/logger'

const log = createLogger('NearbyRestaurants')

interface NearbyRestaurantsProps {
  radius?: number // 검색 반경 (미터)
  onSelectRestaurant?: (restaurant: RestaurantPlace) => void
  className?: string
}

export function NearbyRestaurants({
  radius = 1000,
  onSelectRestaurant,
  className = '',
}: NearbyRestaurantsProps) {
  const location = useLocation()
  const { isLoaded: isKakaoMapLoaded } = useKakaoMap()
  const [restaurants, setRestaurants] = useState<RestaurantPlace[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchType, setSearchType] = useState<'restaurant' | 'cafe'>('restaurant')

  // 위치 기반 식당 검색
  useEffect(() => {
    const searchNearbyPlaces = async () => {
      if (!location.latitude || !location.longitude) {
        log.info('📍 Waiting for location...')
        return
      }

      if (!isKakaoMapLoaded) {
        log.info('⏳ Waiting for Kakao Map SDK to load...')
        return
      }

      setIsSearching(true)

      try {
        const category = searchType === 'restaurant' ? 'FD6' : 'CE7'
        const results = await kakaoLocal.searchByCategory(
          location.latitude,
          location.longitude,
          radius,
          category
        )

        setRestaurants(results)
        log.info(
          `✅ Found ${results.length} ${searchType === 'restaurant' ? 'restaurants' : 'cafes'}`
        )
      } catch (error) {
        log.error('❌ Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }

    searchNearbyPlaces()
  }, [location.latitude, location.longitude, radius, searchType, isKakaoMapLoaded])

  const handleRestaurantClick = (restaurant: RestaurantPlace) => {
    log.info('🍽️ Restaurant selected:', restaurant.place_name)
    onSelectRestaurant?.(restaurant)
  }

  if (location.isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">위치 정보를 가져오는 중...</span>
      </div>
    )
  }

  if (location.error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-sm text-red-600">
          위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* 검색 타입 선택 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSearchType('restaurant')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            searchType === 'restaurant'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🍽️ 음식점
        </button>
        <button
          onClick={() => setSearchType('cafe')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            searchType === 'cafe'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ☕ 카페
        </button>
      </div>

      {/* 현재 위치 표시 */}
      {location.address && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-900">
              {location.address.split(',').slice(0, 2).join(',')}
            </span>
          </div>
        </div>
      )}

      {/* 검색 중 표시 */}
      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">주변 장소 검색 중...</span>
        </div>
      )}

      {/* 검색 결과 */}
      {!isSearching && restaurants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            반경 {radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`} 내{' '}
            {searchType === 'restaurant' ? '음식점' : '카페'} ({restaurants.length}개)
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => handleRestaurantClick(restaurant)}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* 장소 이름 */}
                    <h4 className="font-medium text-gray-900 truncate">{restaurant.place_name}</h4>

                    {/* 카테고리 */}
                    <p className="text-xs text-gray-500 mt-1">
                      {restaurant.category_name.split(' > ').slice(-2).join(' > ')}
                    </p>

                    {/* 주소 */}
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {restaurant.road_address_name || restaurant.address_name}
                    </p>

                    {/* 전화번호 */}
                    {restaurant.phone && (
                      <div className="flex items-center gap-1 mt-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{restaurant.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* 거리 */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-medium text-blue-600">
                      {kakaoLocal.formatDistance(restaurant.distance)}
                    </span>

                    {/* 카카오맵 링크 */}
                    {restaurant.place_url && (
                      <a
                        href={restaurant.place_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-gray-400 hover:text-blue-500"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 검색 결과 없음 */}
      {!isSearching && restaurants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>주변에 {searchType === 'restaurant' ? '음식점' : '카페'}이 없습니다.</p>
          <p className="text-sm mt-1">검색 반경을 늘려보세요.</p>
        </div>
      )}
    </div>
  )
}
