'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { ArrowLeft, MapPin, Star, Calendar, Share, Navigation } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { RestaurantDetail } from '@/types/restaurant'
import { ShareModal } from '@/components/share-modal'
import { KakaoMap } from '@/components/kakao-map'

interface RestaurantPageProps {
  params: Promise<{ id: string }>
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)

  const fetchRestaurantDetail = useCallback(async () => {
    try {
      // 실제 API 호출 대신 샘플 데이터 사용
      const sampleRestaurant: RestaurantDetail = {
        id: resolvedParams.id,
        name: '홍대 이탈리안 레스토랑',
        address: '서울시 마포구 홍익로 123',
        latitude: 37.5565,
        longitude: 126.9239,
        category: '양식',
        averageRating: 4.2,
        totalVisits: 3,
        firstVisit: '2024-08-15T19:30:00Z',
        lastVisit: '2024-10-03T13:30:00Z',
        representativePhoto: 'http://localhost:8000/uploads/085bf7eb-f6d5-4bdb-89b6-bd8bba27a55f.png',
        priceRange: 'mid',
        tags: ['데이트', '파스타맛집', '분위기좋음', '재방문의사'],
        meals: [
          {
            id: '1',
            name: '크림파스타',
            rating: 4,
            photos: ['085bf7eb-f6d5-4bdb-89b6-bd8bba27a55f.png'],
            memo: '크림소스가 진하고 맛있었어요',
            price: 18000,
            visitDate: '2024-10-03T13:30:00Z'
          },
          {
            id: '2', 
            name: '마르게리타 피자',
            rating: 4,
            photos: ['33ed9be5-0348-4b59-acd2-6fcf5a386457.png'],
            memo: '바질향이 좋았음',
            price: 22000,
            visitDate: '2024-09-15T19:00:00Z'
          },
          {
            id: '3',
            name: '리조또',
            rating: 5,
            photos: ['36fd83e4-f4ae-4e37-b142-9b2f8e3f0b13.png'],
            memo: '최고의 리조또! 재방문 예정',
            price: 25000,
            visitDate: '2024-08-15T19:30:00Z'
          }
        ]
      }

      setRestaurant(sampleRestaurant)
    } catch (error) {
      console.error('음식점 상세 정보 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    fetchRestaurantDetail()
  }, [fetchRestaurantDetail])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">음식점을 찾을 수 없습니다</h3>
        </div>
      </div>
    )
  }

  const shareData = {
    title: `${restaurant.name} - DailyMeal 맛집`,
    description: `${restaurant.address}에서 ${restaurant.totalVisits}번 방문한 맛집입니다. 평점: ${restaurant.averageRating}/5`,
    url: typeof window !== 'undefined' ? window.location.href : '',
    imageUrl: restaurant.representativePhoto
  }

  const getPriceRangeText = (range?: string) => {
    switch (range) {
      case 'budget': return '₩ 저렴함'
      case 'mid': return '₩₩ 보통'
      case 'expensive': return '₩₩₩ 비쌈'
      default: return '가격정보 없음'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold truncate mx-4">{restaurant.name}</h1>
          <button
            onClick={() => setShowShareModal(true)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Share size={24} />
          </button>
        </div>
      </header>

      {/* Restaurant Header */}
      <div className="bg-white">
        {/* Photo */}
        <div className="aspect-[16/9] relative">
          {restaurant.representativePhoto ? (
            <Image
              src={restaurant.representativePhoto}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-6xl text-gray-400">🏪</span>
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{restaurant.name}</h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin size={16} className="mr-2" />
                <span>{restaurant.address}</span>
              </div>
              <div className="text-sm text-gray-500">
                {restaurant.category} • {getPriceRangeText(restaurant.priceRange)}
              </div>
            </div>
            
            <div className="text-right ml-4">
              <div className="flex items-center justify-end mb-1">
                <Star size={20} className="text-yellow-400 fill-current mr-1" />
                <span className="text-xl font-bold">{restaurant.averageRating}</span>
              </div>
              <div className="text-sm text-gray-500">{restaurant.totalVisits}회 방문</div>
            </div>
          </div>

          {/* Visit Info */}
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={16} className="mr-2" />
              <span>첫 방문: {new Date(restaurant.firstVisit).toLocaleDateString()}</span>
            </div>
            <div className="text-sm text-gray-600">
              마지막: {new Date(restaurant.lastVisit).toLocaleDateString()}
            </div>
          </div>

          {/* Tags */}
          {restaurant.tags.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {restaurant.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Map */}
      <div className="mt-4 bg-white">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin size={20} className="mr-2 text-blue-500" />
              위치 정보
            </h3>
            <button
              onClick={() => {
                // 카카오맵 앱으로 길찾기 또는 웹 지도 열기
                const url = `https://map.kakao.com/link/to/${encodeURIComponent(restaurant.name)},${restaurant.latitude},${restaurant.longitude}`
                window.open(url, '_blank')
              }}
              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Navigation size={14} className="mr-1" />
              길찾기
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 주소 정보 */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">{restaurant.name}</div>
                <div className="text-gray-600 text-sm">{restaurant.address}</div>
              </div>
              <button
                onClick={() => {
                  // 주소 복사
                  navigator.clipboard.writeText(restaurant.address)
                  alert('주소가 복사되었습니다!')
                }}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
              >
                복사
              </button>
            </div>
          </div>

          {/* 카카오 지도 */}
          <KakaoMap
            latitude={restaurant.latitude || 37.5665}
            longitude={restaurant.longitude || 126.9780}
            level={3}
            markers={[{
              lat: restaurant.latitude || 37.5665,
              lng: restaurant.longitude || 126.9780,
              title: restaurant.name,
              content: `
                <div style="padding: 10px; min-width: 200px;">
                  <strong style="color: #333;">${restaurant.name}</strong><br/>
                  <span style="color: #666; font-size: 12px;">${restaurant.address}</span><br/>
                  <div style="margin-top: 5px;">
                    <span style="color: #ff6b35;">★ ${restaurant.averageRating}</span>
                    <span style="color: #999; margin-left: 5px;">${restaurant.totalVisits}회 방문</span>
                  </div>
                </div>
              `
            }]}
            className="w-full h-64 rounded-lg"
          />

          {/* 주변 정보 (선택사항) */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(restaurant.address + ' 주차장')}`
                window.open(searchUrl, '_blank')
              }}
              className="p-3 text-sm text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🚗 주변 주차장
            </button>
            <button
              onClick={() => {
                const searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(restaurant.address + ' 지하철역')}`
                window.open(searchUrl, '_blank')
              }}
              className="p-3 text-sm text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🚇 가까운 지하철
            </button>
          </div>
        </div>
      </div>

      {/* Meals History */}
      <div className="mt-4 bg-white">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">방문 기록</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {restaurant.meals.map((meal) => (
            <Link 
              key={meal.id}
              href={`/meal/${meal.id}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-4">
                {/* Meal Photo */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {meal.photos && meal.photos[0] ? (
                    <Image
                      src={`http://localhost:8000/uploads/${meal.photos[0]}`}
                      alt={meal.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      🍽️
                    </div>
                  )}
                </div>

                {/* Meal Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{meal.name}</h4>
                    <div className="flex items-center ml-2">
                      <Star size={14} className="text-yellow-400 fill-current mr-1" />
                      <span className="text-sm">{meal.rating}</span>
                    </div>
                  </div>

                  {meal.memo && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{meal.memo}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(meal.visitDate).toLocaleDateString()}</span>
                    {meal.price && <span>₩{meal.price.toLocaleString()}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <Link
            href={`/restaurants/${restaurant.id}/map`}
            className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 rounded-lg"
          >
            <MapPin size={18} />
            <span>지도에서 보기</span>
          </Link>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 rounded-lg"
          >
            <Share size={18} />
            <span>맛집 공유하기</span>
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={shareData}
        imageUrl={restaurant.representativePhoto}
      />
    </div>
  )
}