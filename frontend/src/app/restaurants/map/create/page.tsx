'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, ArrowLeft, Eye, EyeOff, MapPin, Star } from 'lucide-react'
import type { Restaurant } from '@/types/restaurant'
import { useToast } from '@/components/ui/toast'

export default function CreateMapPage() {
  const router = useRouter()
  const toast = useToast()
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurants, setSelectedRestaurants] = useState<Set<string>>(new Set())
  const [mapData, setMapData] = useState({
    title: '',
    description: '',
    isPublic: true
  })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          toast.error('로그인이 필요합니다')
          return
        }

        const response = await fetch('http://localhost:8000/restaurants', {
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
    }

    fetchRestaurants()
  }, [toast])

  const handleRestaurantToggle = (restaurantId: string) => {
    const newSelected = new Set(selectedRestaurants)
    if (newSelected.has(restaurantId)) {
      newSelected.delete(restaurantId)
    } else {
      newSelected.add(restaurantId)
    }
    setSelectedRestaurants(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedRestaurants.size === restaurants.length) {
      setSelectedRestaurants(new Set())
    } else {
      setSelectedRestaurants(new Set(restaurants.map(r => r.id)))
    }
  }

  const handleCreateMap = async () => {
    if (!mapData.title.trim()) {
      toast.error('맛집 지도 제목을 입력해주세요')
      return
    }

    if (selectedRestaurants.size === 0) {
      toast.error('공유할 음식점을 선택해주세요')
      return
    }

    setCreating(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('로그인이 필요합니다')
        return
      }

      const createMapDto = {
        title: mapData.title,
        description: mapData.description,
        restaurantIds: Array.from(selectedRestaurants),
        isPublic: mapData.isPublic
      }

      const response = await fetch('http://localhost:8000/restaurants/maps', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createMapDto)
      })

      if (!response.ok) {
        throw new Error('맛집 지도 생성에 실패했습니다')
      }

      const newMapData = await response.json()
      
      toast.success('맛집 지도가 생성되었습니다!')
      
      // 생성된 지도 페이지로 이동
      router.push(`/restaurants/maps/${newMapData.id}`)
      
    } catch (error) {
      console.error('맛집 지도 생성 실패:', error)
      toast.error('맛집 지도 생성에 실패했습니다')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">음식점 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-3">
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">맛집 지도 만들기</h1>
          </div>
          <button
            onClick={handleCreateMap}
            disabled={creating || selectedRestaurants.size === 0}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? '생성중...' : '생성하기'}
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Map Info Form */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">지도 정보</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={mapData.title}
              onChange={(e) => setMapData({ ...mapData, title: e.target.value })}
              placeholder="예: 홍대 맛집 투어, 강남 브런치 카페..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={mapData.description}
              onChange={(e) => setMapData({ ...mapData, description: e.target.value })}
              placeholder="이 맛집 지도에 대한 간단한 설명을 작성해보세요..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {mapData.isPublic ? (
                <Eye size={20} className="text-green-500 mr-2" />
              ) : (
                <EyeOff size={20} className="text-gray-400 mr-2" />
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {mapData.isPublic ? '공개' : '비공개'}
                </div>
                <div className="text-sm text-gray-500">
                  {mapData.isPublic 
                    ? '다른 사람들이 내 맛집 지도를 볼 수 있습니다' 
                    : '나만 볼 수 있습니다'
                  }
                </div>
              </div>
            </div>
            <button
              onClick={() => setMapData({ ...mapData, isPublic: !mapData.isPublic })}
              className={`w-12 h-6 rounded-full transition-colors ${
                mapData.isPublic ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                mapData.isPublic ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Restaurant Selection */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              음식점 선택 ({selectedRestaurants.size}/{restaurants.length})
            </h2>
            <button
              onClick={handleSelectAll}
              className="text-blue-500 text-sm font-medium"
            >
              {selectedRestaurants.size === restaurants.length ? '전체 해제' : '전체 선택'}
            </button>
          </div>

          <div className="space-y-3">
            {restaurants.map(restaurant => (
              <div key={restaurant.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <button
                  onClick={() => handleRestaurantToggle(restaurant.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    selectedRestaurants.has(restaurant.id)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 text-transparent hover:border-blue-500'
                  }`}
                >
                  {selectedRestaurants.has(restaurant.id) ? (
                    <Plus size={14} className="rotate-45" />
                  ) : (
                    <Plus size={14} />
                  )}
                </button>

                <div className="w-12 h-12 relative bg-gray-100 rounded-lg flex-shrink-0">
                  {restaurant.representativePhoto ? (
                    <Image
                      src={restaurant.representativePhoto}
                      alt={restaurant.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin size={16} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{restaurant.name}</h3>
                    <div className="flex items-center ml-2">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">{restaurant.averageRating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{restaurant.address}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {restaurant.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {restaurant.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {restaurant.totalVisits}번 방문
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        {selectedRestaurants.size > 0 && (
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">미리보기</h2>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900">
                {mapData.title || '맛집 지도 제목'}
              </h3>
              {mapData.description && (
                <p className="text-gray-600 mt-2">{mapData.description}</p>
              )}
              
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span>🏪 {selectedRestaurants.size}개 음식점</span>
                <span>⭐ {(
                  restaurants
                    .filter(r => selectedRestaurants.has(r.id))
                    .reduce((sum, r) => sum + r.averageRating, 0) / selectedRestaurants.size
                ).toFixed(1)}</span>
                <span>📍 {
                  Array.from(new Set(
                    restaurants
                      .filter(r => selectedRestaurants.has(r.id))
                      .map(r => r.category)
                      .filter(Boolean)
                  )).join(', ')
                }</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}