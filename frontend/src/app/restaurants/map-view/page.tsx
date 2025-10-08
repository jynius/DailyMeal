'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Search, MapPin, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { KakaoMap } from '@/components/kakao-map'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'
import type { Restaurant } from '@/types/restaurant'
import { APP_CONFIG } from '@/lib/constants'

export default function RestaurantMapViewPage() {
  const router = useRouter()
  const toast = useToast()
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 })

  const fetchRestaurants = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('로그인이 필요합니다')
        return
      }

      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/restaurants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('음식점 목록을 가져올 수 없습니다')
      }

      const restaurantsData = await response.json()
      setRestaurants(restaurantsData)
    } catch (error) {
      console.error('음식점 목록 로딩 실패:', error)
      toast.error('음식점 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  useEffect(() => {
    // 필터링 로직
    let filtered = restaurants
    
    if (searchQuery) {
      filtered = filtered.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(restaurant => restaurant.category === selectedCategory)
    }
    
    setFilteredRestaurants(filtered)
    
    // 지도 중심점 조정 (첫 번째 음식점 위치로)
    if (filtered.length > 0 && filtered[0].latitude && filtered[0].longitude) {
      setMapCenter({
        lat: filtered[0].latitude,
        lng: filtered[0].longitude
      })
    }
  }, [restaurants, searchQuery, selectedCategory])

  const categories = Array.from(new Set(restaurants.map(r => r.category).filter(Boolean)))

  // 지도 마커 데이터 생성
  const mapMarkers = filteredRestaurants
    .filter(restaurant => restaurant.latitude && restaurant.longitude)
    .map(restaurant => ({
      lat: restaurant.latitude!,
      lng: restaurant.longitude!,
      title: restaurant.name,
      content: `
        <div style="padding: 8px; min-width: 150px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong style="color: #333; font-size: 14px;">${restaurant.name}</strong><br/>
          <span style="color: #666; font-size: 11px;">${restaurant.category}</span><br/>
          <span style="color: #888; font-size: 11px;">${restaurant.address}</span><br/>
          <div style="margin-top: 4px;">
            <span style="color: #ff6b35;">★ ${restaurant.averageRating || 0}</span>
            <span style="color: #999; margin-left: 5px; font-size: 11px;">${restaurant.totalVisits || 0}회 방문</span>
          </div>
        </div>
      `,
      restaurant
    }))

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-gray-600">지도를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-1 mr-3">
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">맛집 지도</h1>
          </div>
          <div className="text-sm text-gray-500">
            {filteredRestaurants.length}개 음식점
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="p-4 bg-white border-b space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="음식점 이름이나 주소로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === ''
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category || '')}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative">
        <KakaoMap
          latitude={mapCenter.lat}
          longitude={mapCenter.lng}
          level={5}
          markers={mapMarkers}
          className="w-full h-96"
        />
        
        {/* Map Overlay Info */}
        {selectedRestaurant && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{selectedRestaurant.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedRestaurant.address}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-400 fill-current mr-1" />
                    <span className="text-sm">{selectedRestaurant.averageRating || 0}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedRestaurant.totalVisits || 0}회 방문
                  </div>
                </div>
              </div>
              <Link 
                href={`/restaurants/${selectedRestaurant.id}`}
                className="ml-3 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                상세보기
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Restaurant List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">음식점 목록</h2>
          <Link 
            href="/restaurants"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            목록으로 보기
          </Link>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-8">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">음식점이 없습니다</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory 
                ? '검색 조건을 변경해보세요' 
                : '첫 번째 음식점을 등록해보세요'}
            </p>
            <Link 
              href="/restaurants/add"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <MapPin size={16} className="mr-2" />
              음식점 등록
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedRestaurant(restaurant)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{restaurant.category}</p>
                    <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
                  </div>
                  <div className="text-right ml-3">
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 fill-current mr-1" />
                      <span className="text-sm">{restaurant.averageRating || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {restaurant.totalVisits || 0}회 방문
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}