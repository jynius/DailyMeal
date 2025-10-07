'use client'

import { useState, useEffect } from 'react'
import { MapPin, Star, Calendar, Users, Share, Plus } from 'lucide-react'
import { BottomNavigation } from '@/components/bottom-navigation'
import { useToast } from '@/components/ui/toast'
import { ShareModal } from '@/components/share-modal'
import Link from 'next/link'
import Image from 'next/image'
import type { Restaurant } from '@/types/restaurant'
import type { ShareData } from '@/lib/share-utils'

export default function RestaurantsPage() {
  const toast = useToast()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'전체' | '최근' | '즐겨찾기' | '카테고리'>('전체')
  const [filter, setFilter] = useState<'all' | 'recent' | 'favorite' | 'category'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareData, setShareData] = useState<ShareData | null>(null)

  useEffect(() => {
    fetchRestaurants()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [toast])

  const handleShareRestaurant = (restaurant: Restaurant, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const shareData: ShareData = {
      title: `${restaurant.name} - DailyMeal 맛집`,
      description: `${restaurant.address}에 위치한 ${restaurant.category || ''} 맛집입니다. ⭐${restaurant.averageRating} (${restaurant.totalVisits}회 방문)`,
      url: typeof window !== 'undefined' ? `${window.location.origin}/restaurants/${restaurant.id}` : ''
    }
    
    setShareData(shareData)
    setShareModalOpen(true)
  }

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (filter === 'all') return true
    if (filter === 'recent') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return new Date(restaurant.lastVisit) > oneWeekAgo
    }
    if (filter === 'favorite') return restaurant.averageRating >= 4.5
    if (filter === 'category') return restaurant.category === selectedCategory
    return true
  })

  const categories = Array.from(new Set(restaurants.map(r => r.category).filter(Boolean)))

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">내 맛집</h1>
          <Link 
            href="/restaurants/map/create"
            className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm"
          >
            <Plus size={16} />
            <span>맛집지도</span>
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex space-x-2 mb-3">
          {[
            { key: 'all', label: '전체' },
            { key: 'recent', label: '최근' },
            { key: 'favorite', label: '즐겨찾기' },
            { key: 'category', label: '카테고리' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                filter === filterOption.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {filter === 'category' && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category || '')}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Restaurant List */}
      <div className="p-4 space-y-4">
        {filteredRestaurants.map((restaurant) => (
          <Link 
            key={restaurant.id}
            href={`/restaurants/${restaurant.id}`}
            className="block"
          >
            <div className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Restaurant Photo */}
              <div className="aspect-[16/9] relative bg-gray-100">
                {restaurant.representativePhoto ? (
                  <Image
                    src={restaurant.representativePhoto}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">🏪</span>
                  </div>
                )}
              </div>

              {/* Restaurant Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{restaurant.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin size={14} className="mr-1" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center ml-2">
                    <Star size={16} className="text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium">{restaurant.averageRating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Users size={14} className="mr-1" />
                      <span>{restaurant.totalVisits}회 방문</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>{new Date(restaurant.lastVisit).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {restaurant.category}
                    </span>
                    <button
                      onClick={(e) => handleShareRestaurant(restaurant, e)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      title="음식점 공유하기"
                    >
                      <Share size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">음식점이 없습니다</h3>
          <p className="text-gray-600 mb-6">식사를 기록하면 자동으로 음식점이 추가됩니다</p>
          <Link 
            href="/add"
            className="inline-flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            <Plus size={20} />
            <span>첫 식사 기록하기</span>
          </Link>
        </div>
      )}

      <BottomNavigation />
      
      {/* Share Modal */}
      {shareData && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareData={shareData}
        />
      )}
    </div>
  )
}