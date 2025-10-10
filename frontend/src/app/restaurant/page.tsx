'use client'

import { useState, useEffect } from 'react'
import { MapPin, Star, Map as MapIcon, List } from 'lucide-react'
import { BottomNavigation } from '@/components/bottom-navigation'
import { KakaoMap } from '@/components/kakao-map'
import { useRequireAuth } from '@/hooks/use-auth'
import Link from 'next/link'

interface Restaurant {
  id: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  mealCount: number  // 이 식당에서 먹은 횟수
  avgRating: number  // 평균 평점
  lastVisited: string  // 마지막 방문일
  photos: string[]  // 대표 사진들
  isFriendVisit?: boolean  // 친구 방문 여부
  friendName?: string  // 친구 이름
}

type SortOption = 'recent' | 'count' | 'rating'

export default function RestaurantsPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map') // 지도/리스트 뷰 토글
  const [sortOption, setSortOption] = useState<SortOption>('recent') // 정렬 옵션
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  // 페이지 로드 시 현재 위치 가져오기
  useEffect(() => {
    // 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error)
          // 기본 위치 (서울 시청)
          setCurrentLocation({ lat: 37.5665, lng: 126.9780 })
        }
      )
    }
  }, [])

  // 식당 데이터 로드 (식사 기록에서 자동 생성)
  useEffect(() => {
    if (isAuthenticated) {
      fetchRestaurants()
    }
  }, [isAuthenticated])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const { mealRecordsApi, friendsApi } = await import('@/lib/api/client')
      
      // 내 식사 기록과 친구 목록 가져오기
      const [myMealsResponse, friends] = await Promise.all([
        mealRecordsApi.getAll(1, 1000), // 모든 데이터 가져오기
        friendsApi.getFriends().catch(() => [])
      ])

      const myMeals = myMealsResponse.data

      // 친구들의 식사 기록 가져오기는 일단 스킵 (API 엔드포인트 필요)
      // TODO: 친구의 식사 기록을 가져오는 별도 API 필요
      
      // 식당별로 그룹핑 (장소명 기준)
      const restaurantMap = new Map<string, Restaurant>()

      // 내 식사 기록 처리
      myMeals.forEach((meal: any) => {
        if (!meal.location) return
        
        const existing = restaurantMap.get(meal.location)
        if (existing) {
          existing.mealCount++
          const totalRating = existing.avgRating * (existing.mealCount - 1) + (meal.rating || 0)
          existing.avgRating = totalRating / existing.mealCount
          if (new Date(meal.createdAt) > new Date(existing.lastVisited)) {
            existing.lastVisited = meal.createdAt
          }
          if (meal.photo && !existing.photos.includes(meal.photo)) {
            existing.photos.push(meal.photo)
          }
        } else {
          restaurantMap.set(meal.location, {
            id: meal.id,
            name: meal.location,
            address: meal.address || '주소 정보 없음',
            latitude: meal.latitude,
            longitude: meal.longitude,
            mealCount: 1,
            avgRating: meal.rating || 0,
            lastVisited: meal.createdAt,
            photos: meal.photo ? [meal.photo] : []
          })
        }
      })
      
      const restaurantData = Array.from(restaurantMap.values())
      setRestaurants(restaurantData)
      setPopularRestaurants(restaurantData.slice(0, 4))
    } catch (error) {
      console.error('Failed to fetch restaurants:', error)
      
      // 에러 시 임시 데이터 사용
      const mockData: Restaurant[] = [
        {
          id: '1',
          name: '맛있는 파스타',
          address: '서울 마포구 홍대입구역',
          mealCount: 5,
          avgRating: 4.5,
          lastVisited: '2025-10-08',
          photos: ['/placeholder.jpg']
        },
        {
          id: '2',
          name: '김치찌개 전문점',
          address: '서울 강남구 강남역',
          mealCount: 3,
          avgRating: 5,
          lastVisited: '2025-10-07',
          photos: ['/placeholder.jpg']
        }
      ]
      setRestaurants(mockData)
      setPopularRestaurants(mockData.slice(0, 4))
    } finally {
      setLoading(false)
    }
  }

  // 정렬된 식당 목록
  const sortedRestaurants = (() => {
    const list = [...restaurants]
    
    // 정렬 적용
    switch (sortOption) {
      case 'recent':
        return list.sort((a, b) => new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime())
      case 'count':
        return list.sort((a, b) => b.mealCount - a.mealCount)
      case 'rating':
        return list.sort((a, b) => b.avgRating - a.avgRating)
      default:
        return list
    }
  })()

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10 pt-safe">
        <h1 className="text-xl font-bold text-gray-900 mt-2">맛집</h1>
      </header>

      {/* 인기 맛집 */}
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
                <span className="text-xs text-gray-600">
                  {restaurant.avgRating.toFixed(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="p-4 bg-white border-b">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 py-2 rounded-lg transition-colors text-sm font-medium ${
              viewMode === 'map'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <MapIcon size={18} className="inline mr-1" />
            지도
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 rounded-lg transition-colors text-sm font-medium ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <List size={18} className="inline mr-1" />
            목록
          </button>
        </div>
      </div>

      {/* Map or List View */}
      {viewMode === 'map' ? (
        <div className="bg-white border-y">
          <div className="h-96 relative">
            {currentLocation ? (
              <KakaoMap
                latitude={currentLocation.lat}
                longitude={currentLocation.lng}
                level={5}
                markers={sortedRestaurants
                  .filter(r => r.latitude && r.longitude)
                  .map(r => ({
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
                    `
                  }))}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  <MapPin size={48} className="mx-auto mb-2 text-gray-400 animate-pulse" />
                  <p className="text-sm">현재 위치를 가져오는 중...</p>
                </div>
              </div>
            )}
            
            {/* 지도 위 카드 리스트 (하단에 가로 스크롤) */}
            {sortedRestaurants.length > 0 && currentLocation && (
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
                      <div className="text-xs text-blue-600">
                        {restaurant.mealCount}번 방문
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Restaurant List */
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
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">맛집 불러오는 중...</p>
          </div>
        ) : sortedRestaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 mb-2">
              아직 등록된 맛집이 없습니다
            </p>
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
                    <h4 className="text-base font-semibold text-gray-900">
                      {restaurant.name}
                    </h4>
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
                            ? "text-yellow-400 fill-current" 
                            : "text-gray-300"
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
                    최근 방문: {new Date(restaurant.lastVisited).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <BottomNavigation />
    </div>
  )
}