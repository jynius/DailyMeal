'use client'

import { useState, useEffect } from 'react'
import { Search, Clock, MapPin, Star, X } from 'lucide-react'
import { BottomNavigation } from '@/components/bottom-navigation'
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
}

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [popularRestaurants, setPopularRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  // 최근 검색어 로드
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // 식당 데이터 로드 (식사 기록에서 자동 생성)
  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      // TODO: API 연동 - 식사 기록을 식당별로 그룹핑
      // const { mealRecordsApi } = await import('@/lib/api/client')
      // const data = await mealRecordsApi.getRestaurantsByMeals()
      
      // 임시 데이터
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
    } catch (error) {
      console.error('Failed to fetch restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    if (!term.trim()) return
    
    // 검색어 저장
    const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
    
    // TODO: 검색 수행
    console.log('Search for:', term)
  }

  const removeRecentSearch = (term: string) => {
    const updated = recentSearches.filter(t => t !== term)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const filteredRestaurants = searchTerm 
    ? restaurants.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : restaurants

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">맛집</h1>
      </header>

      {/* Search Bar */}
      <div className="p-4 bg-white">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="맛집, 메뉴를 검색해보세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 최근 검색어 (검색창 바로 아래) */}
        {recentSearches.length > 0 && !searchTerm && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">최근 검색어</h4>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, index) => (
                <div 
                  key={index}
                  className="flex items-center bg-gray-100 rounded-full px-3 py-1.5"
                >
                  <Clock size={14} className="text-gray-400 mr-1.5" />
                  <button 
                    onClick={() => setSearchTerm(term)}
                    className="text-sm text-gray-700"
                  >
                    {term}
                  </button>
                  <button 
                    onClick={() => removeRecentSearch(term)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 인기 맛집 (검색어 밑에) */}
        {popularRestaurants.length > 0 && !searchTerm && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">인기 맛집</h4>
            <div className="grid grid-cols-2 gap-2">
              {popularRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${restaurant.id}`}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 line-clamp-1">
                      {restaurant.name}
                    </span>
                    <div className="flex items-center ml-1">
                      <Star size={12} className="text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-0.5">
                        {restaurant.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin size={12} className="mr-1" />
                    <span className="line-clamp-1">{restaurant.address.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {restaurant.mealCount}번 방문
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="bg-white border-y">
        <div className="aspect-[2/1] bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">지도 (추후 구현)</p>
          </div>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {searchTerm ? '검색 결과' : '내 맛집'} ({filteredRestaurants.length})
          </h3>
          <select className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1">
            <option>최근 방문순</option>
            <option>평점순</option>
            <option>방문 횟수순</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">맛집 불러오는 중...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 mb-2">
              {searchTerm ? '검색 결과가 없습니다' : '아직 등록된 맛집이 없습니다'}
            </p>
            <p className="text-sm text-gray-400">
              식사를 기록하고 평가하면 자동으로 맛집이 생성됩니다!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-base font-semibold text-gray-900 flex-1">
                    {restaurant.name}
                  </h4>
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

      <BottomNavigation />
    </div>
  )
}
