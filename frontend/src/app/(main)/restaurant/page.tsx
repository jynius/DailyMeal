'use client'

import { useState, useEffect } from 'react'
import { MapPin, Star, Map as MapIcon, List } from 'lucide-react'
import { KakaoMap } from '@/components/kakao-map'
import { useLocationPermission } from '@/hooks/use-location-permission'
import { useAlert } from '@/components/ui/alert'
import Link from 'next/link'
import Spinner from '@/components/ui/spinner'

interface Restaurant {
  id: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  mealCount: number
  avgRating: number
  lastVisited: string
  photos: string[]
  isFriendVisit?: boolean
  friendName?: string
}

type SortOption = 'recent' | 'count' | 'rating'

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [sortOption, setSortOption] = useState<SortOption>('recent')

  // 위치 권한 관리를 커스텀 훅으로 통합 (자동 프롬프트 표시)
  const location = useLocationPermission({
    autoPrompt: true,
    promptTitle: '📍 위치 권한 필요',
    promptMessage:
      '주변 맛집을 지도에 표시하려면 위치 권한이 필요합니다.\n\n권한을 허용하시겠습니까?',
  })

  const { latitude, longitude } = location
  const alert = useAlert()

  useEffect(() => {
    fetchRestaurants()
  }, [latitude, longitude])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const { restaurantsApi } = await import('@/lib/api')

      const params: { lat?: number; lon?: number; radius?: number } = {}
      if (latitude && longitude) {
        params.lat = latitude
        params.lon = longitude
        params.radius = 5 // 기본 반경 5km
      }

      const response = await restaurantsApi.getRestaurants(params)

      const restaurantData = response.map((r: any) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        latitude: r.latitude,
        longitude: r.longitude,
        mealCount: r.totalVisits,
        avgRating: r.averageRating,
        lastVisited: r.lastVisit,
        photos: r.representativePhoto ? [r.representativePhoto] : [],
      }))

      setRestaurants(restaurantData)
      setPopularRestaurants(
        [...restaurantData].sort((a, b) => b.mealCount - a.mealCount).slice(0, 4)
      )
    } catch (error) {
      console.error('Failed to fetch restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedRestaurants = (() => {
    const list = [...restaurants]

    switch (sortOption) {
      case 'recent':
        return list.sort(
          (a, b) => new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime()
        )
      case 'count':
        return list.sort((a, b) => b.mealCount - a.mealCount)
      case 'rating':
        return list.sort((a, b) => b.avgRating - a.avgRating)
      default:
        return list
    }
  })()

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      <div className="p-4 bg-white border-b">
        <h4 className="text-sm font-medium text-gray-600 mb-2">인기 맛집</h4>
        <div className="grid grid-cols-2 gap-2">
          {popularRestaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurant/${restaurant.id}`}
              className="flex items-center justify-between bg-gray-50 px-2 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-900 truncate">
                  {restaurant.name}
                </span>
                <span className="text-[10px] text-blue-600 whitespace-nowrap">
                  ({restaurant.mealCount})
                </span>
              </div>
              <div className="flex items-center gap-0.5 ml-1">
                <Star size={12} className="text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600">{restaurant.avgRating.toFixed(1)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-b">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 py-2 rounded-lg transition-colors text-sm font-medium ${
              viewMode === 'map' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <MapIcon size={18} className="inline mr-1" />
            지도
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 rounded-lg transition-colors text-sm font-medium ${
              viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <List size={18} className="inline mr-1" />
            목록
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="bg-white border-y">
          <div className="h-96 relative">
            {location.latitude && location.longitude ? (
              <KakaoMap
                latitude={location.latitude}
                longitude={location.longitude}
                level={5}
                markers={sortedRestaurants
                  .filter((r) => r.latitude && r.longitude)
                  .map((r) => ({
                    lat: r.latitude!,
                    lng: r.longitude!,
                    title: r.name,
                    content: `
                      <div style="padding: 8px; min-width: 150px;">
                        <div style="font-weight: bold; margin-bottom: 4px;">${r.name}</div>
                        <div style="font-size: 12px; color: #666;">${r.address}</div>
                        <div style="font-size: 12px; color: #2563eb; margin-top: 4px;">
                          방문 ${r.mealCount}회 · ⭐ ${r.avgRating.toFixed(1)}
                        </div>
                      </div>
                    `,
                  }))}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500 px-4">
                  <MapPin size={48} className="mx-auto mb-2 text-gray-400 animate-pulse" />
                  {location.isLoading ? (
                    <p className="text-sm">현재 위치를 가져오는 중...</p>
                  ) : location.error ? (
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-2">
                        위치 정보를 가져올 수 없습니다
                      </p>
                      <p className="text-xs text-gray-600 mb-3">{location.error.message}</p>
                      <button
                        onClick={() => {
                          alert.showConfirm({
                            title: '📍 위치 권한 재요청',
                            message:
                              '위치 권한을 다시 요청하시겠습니까?\n\n브라우저 설정에서 위치 권한이 차단된 경우,\n설정에서 직접 허용해주셔야 합니다.',
                            type: 'warning',
                            confirmText: '다시 시도',
                            cancelText: '취소',
                            onConfirm: () => {
                              location.fetchLocation()
                            },
                          })
                        }}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        다시 시도
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm mb-3">위치 권한을 허용해주세요</p>
                      <button
                        onClick={() => {
                          alert.showConfirm({
                            title: '📍 위치 권한 필요',
                            message:
                              '주변 맛집을 지도에 표시하려면 위치 권한이 필요합니다.\n\n권한을 허용하시겠습니까?',
                            type: 'info',
                            confirmText: '허용하기',
                            cancelText: '취소',
                            onConfirm: () => {
                              location.fetchLocation()
                            },
                          })
                        }}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        위치 권한 요청
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {sortedRestaurants.length > 0 && location.latitude && location.longitude && (
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {sortedRestaurants.slice(0, 10).map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurant/${restaurant.id}`}
                      className="flex-shrink-0 w-64 bg-white rounded-lg shadow-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {restaurant.name}
                        </h4>
                        <div className="flex items-center ml-2">
                          <Star size={14} className="text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-0.5">
                            {restaurant.avgRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <MapPin size={12} className="mr-1" />
                        <span className="line-clamp-1">{restaurant.address}</span>
                      </div>
                      <div className="text-xs text-blue-600">{restaurant.mealCount}번 방문</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                내 맛집 ({sortedRestaurants.length})
              </h3>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">최근 방문 순</option>
                <option value="count">방문 횟수 순</option>
                <option value="rating">별점 순</option>
              </select>
            </div>

            {loading ? (
              <Spinner container="page" text="맛집 불러오는 중..." />
            ) : sortedRestaurants.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 mb-2">아직 등록된 맛집이 없습니다</p>
                <p className="text-sm text-gray-400">
                  식사를 기록하고 평가하면 자동으로 맛집이 생성됩니다!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedRestaurants.map((restaurant) => (
                  <Link
                    key={restaurant.id}
                    href={`/restaurant/${restaurant.id}`}
                    className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900">{restaurant.name}</h4>
                        {restaurant.isFriendVisit && (
                          <span className="inline-block mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            👤 {restaurant.friendName}님의 맛집
                          </span>
                        )}
                      </div>
                      <div className="flex items-center ml-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < Math.round(restaurant.avgRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                          {restaurant.avgRating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin size={14} className="mr-1" />
                      <span>{restaurant.address}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 font-medium">
                        {restaurant.mealCount}번 방문
                      </span>
                      <span className="text-gray-400">
                        최근 방문:{' '}
                        {new Date(restaurant.lastVisited).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
