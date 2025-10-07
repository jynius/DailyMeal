'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Share, MapPin, Star, Calendar, Eye, User } from 'lucide-react'
import { ShareModal } from '@/components/share-modal'
import type { RestaurantMap, Restaurant } from '@/types/restaurant'
import { useToast } from '@/components/ui/toast'

interface MapPageProps {
  params: Promise<{ id: string }>
}

export default function RestaurantMapPage({ params }: MapPageProps) {
  const router = useRouter()
  const toast = useToast()
  const resolvedParams = use(params)
  const [mapData, setMapData] = useState<RestaurantMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const { id } = resolvedParams
        
        // TODO: 실제 API 연동
        // const result = await restaurantMapApi.getById(id)
        
        // 임시 샘플 데이터
        const sampleMapData: RestaurantMap = {
          id: id,
          title: '홍대 맛집 투어',
          description: '대학가 분위기 속에서 맛볼 수 있는 다양한 맛집들을 모아봤어요. 친구들과 함께 가기 좋은 곳들입니다!',
          createdAt: '2024-10-05T10:00:00Z',
          updatedAt: '2024-10-05T10:00:00Z',
          isPublic: true,
          shareCount: 15,
          userId: 'user1',
          user: {
            id: 'user1',
            name: '맛집헌터',
            profileImage: '/default-profile.jpg'
          },
          author: {
            name: '맛집헌터',
            profileImage: '/default-profile.jpg'
          },
          restaurants: [
            {
              id: '1',
              name: '홍대 이탈리안',
              address: '서울시 마포구 홍익로',
              latitude: 37.5565,
              longitude: 126.9239,
              category: '양식',
              averageRating: 4.5,
              totalVisits: 3,
              firstVisit: '2024-08-15T19:00:00Z',
              lastVisit: '2024-10-01T20:30:00Z',
              representativePhoto: '/uploads/085bf7eb-f6d5-4bdb-89b6-bd8bba27a55f.png',
              priceRange: 'mid'
            },
            {
              id: '2',
              name: '홍대 떡볶이',
              address: '서울시 마포구 와우산로',
              category: '한식',
              averageRating: 4.2,
              totalVisits: 5,
              firstVisit: '2024-07-10T15:00:00Z',
              lastVisit: '2024-09-28T16:30:00Z',
              representativePhoto: '/uploads/33ed9be5-0348-4b59-acd2-6fcf5a386457.png',
              priceRange: 'budget'
            }
          ],
          stats: {
            totalRestaurants: 2,
            totalVisits: 8,
            averageRating: 4.35,
            categories: ['양식', '한식']
          }
        }
        
        setMapData(sampleMapData)
      } catch (error) {
        console.error('맛집 지도 로딩 실패:', error)
        toast.error('맛집 지도를 불러올 수 없습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchMapData()
  }, [resolvedParams, toast])

  const shareData = mapData ? {
    title: `${mapData.title} - DailyMeal 맛집지도`,
    description: mapData.description || '',
    url: typeof window !== 'undefined' ? window.location.href : '',
  } : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">맛집 지도를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!mapData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">맛집 지도를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 맛집 지도가 존재하지 않거나 삭제되었습니다.</p>
          <button 
            onClick={() => router.back()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded-lg"
          >
            <Share size={16} />
            <span>공유</span>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Map Header */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {mapData.title}
              </h1>
              {mapData.description && (
                <p className="text-gray-600 leading-relaxed">
                  {mapData.description}
                </p>
              )}
            </div>
            
            {mapData.isPublic && (
              <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                <Eye size={14} className="mr-1" />
                <span>공개</span>
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {mapData.author.profileImage ? (
                <Image
                  src={mapData.author.profileImage}
                  alt={mapData.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <User size={20} className="text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">{mapData.author.name}</div>
              <div className="text-sm text-gray-500">
                {new Date(mapData.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {mapData.stats.totalRestaurants}
              </div>
              <div className="text-sm text-gray-600">음식점</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {mapData.stats.totalVisits}
              </div>
              <div className="text-sm text-gray-600">총 방문</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {mapData.stats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">평균 별점</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {mapData.stats.categories.length}
              </div>
              <div className="text-sm text-gray-600">카테고리</div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-4">
            {mapData.stats.categories.map(category => (
              <span
                key={category}
                className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Restaurant List */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            포함된 음식점 ({mapData.restaurants.length})
          </h2>
          
          <div className="space-y-4">
            {mapData.restaurants.map((restaurant: Restaurant, index: number) => (
              <div 
                key={restaurant.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
                        
                        <div className="flex items-center mt-2 space-x-4">
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm text-gray-600 ml-1">{restaurant.averageRating}</span>
                          </div>
                          {restaurant.category && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {restaurant.category}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            방문 {restaurant.totalVisits}회
                          </span>
                        </div>
                      </div>
                      
                      {restaurant.representativePhoto && (
                        <div className="flex-shrink-0 ml-4">
                          <Image
                            src={restaurant.representativePhoto}
                            alt={restaurant.name}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareData && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareData={shareData}
        />
      )}
    </div>
  )
}

interface RestaurantMapCardProps {
  restaurant: Restaurant
  index: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RestaurantMapCard({ restaurant, index }: RestaurantMapCardProps) {
  const getPriceRangeText = (range?: string) => {
    switch (range) {
      case 'budget': return '₩'
      case 'mid': return '₩₩'  
      case 'expensive': return '₩₩₩'
      default: return '₩₩'
    }
  }

  return (
    <Link href={`/restaurants/${restaurant.id}`} className="block">
      <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        {/* Index */}
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
          {index}
        </div>

        {/* Photo */}
        <div className="w-16 h-16 relative bg-gray-100 rounded-lg flex-shrink-0">
          {restaurant.representativePhoto ? (
            <Image
              src={restaurant.representativePhoto}
              alt={restaurant.name}
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin size={20} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
            <div className="flex items-center ml-2">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1">{restaurant.averageRating}</span>
            </div>
          </div>

          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            {restaurant.category && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {restaurant.category}
              </span>
            )}
            <span className="text-gray-500">
              {getPriceRangeText(restaurant.priceRange)}
            </span>
            <div className="flex items-center text-gray-500">
              <Calendar size={12} className="mr-1" />
              <span>{restaurant.totalVisits}번 방문</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}