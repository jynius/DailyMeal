'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Star, Calendar, Users, DollarSign, Image as ImageIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { KakaoMap } from '@/components/kakao-map'
import { Header } from '@/components/header'
import Spinner from '@/components/ui/spinner'
import { transformImageUrl } from '@/lib/constants'
import { LocationGroupInfo } from '@/components/location-group-info'

interface MealRecord {
  id: string
  name: string
  photo?: string
  rating?: number
  memo?: string
  price?: number
  createdAt: string
  category?: string
  companionNames?: string
}

interface RestaurantDetail {
  id: string
  locationGroupId?: string // LocationGroup ID 추가 (방문자 표시용)
  name: string
  address: string
  latitude?: number
  longitude?: number
  mealCount: number
  avgRating: number
  totalPrice: number
  firstVisit: string
  lastVisit: string
  meals: MealRecord[]
}

interface RestaurantPageProps {
  params: Promise<{ id: string }>
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  if (!id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner />
      </div>
    )
  }
  
  return <RestaurantContent id={id} />
}

function RestaurantContent({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurantDetail()
  }, [id, searchParams])

  const fetchRestaurantDetail = async () => {
    try {
      setLoading(true)
      const { restaurantsApi } = await import('@/lib/api')
      
      // placeId 또는 URL-encoded name으로 조회
      const placeIdOrName = id.includes('%') ? decodeURIComponent(id) : id
      
      // Backend API를 통해 레스토랑 정보 조회 (사용자 기록 + Kakao 캐시)
      const restaurantData = await restaurantsApi.getRestaurantDetail(placeIdOrName)
      
      if (!restaurantData) {
        // API에서도 찾지 못한 경우 - 쿼리 파라미터에서 가져오기 (fallback)
        const address = searchParams.get('address') || '주소 정보 없음'
        const lat = searchParams.get('lat')
        const lng = searchParams.get('lng')
        const rating = searchParams.get('rating')
        const price = searchParams.get('price')
        const name = searchParams.get('name') || placeIdOrName
        
        const restaurantDetail: RestaurantDetail = {
          id: placeIdOrName,
          name: name,
          address: address,
          latitude: lat ? parseFloat(lat) : undefined,
          longitude: lng ? parseFloat(lng) : undefined,
          mealCount: 0,
          avgRating: rating ? parseFloat(rating) : 0,
          totalPrice: price ? parseFloat(price) : 0,
          firstVisit: new Date().toISOString(),
          lastVisit: new Date().toISOString(),
          meals: []
        }
        setRestaurant(restaurantDetail)
        return
      }
      
      // Backend에서 받은 데이터 설정
      console.log('Restaurant data received:', restaurantData)
      console.log('Latitude:', restaurantData?.latitude, 'Longitude:', restaurantData?.longitude)
      setRestaurant(restaurantData)
    } catch (error) {
      console.error('Failed to fetch restaurant detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Spinner container="page" size="lg" text="식당 정보를 불러오는 중..." />
  }

  if (!restaurant) {
    return (
      <>
        <Header title="맛집 정보" showBackButton />
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">식당 정보를 찾을 수 없습니다</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              돌아가기
            </button>
          </div>
        </div>
      </>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const avgPrice = restaurant.totalPrice / restaurant.mealCount

  return (
    <>
      <Header title={restaurant.name} showBackButton />
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
        {/* 방문하지 않은 맛집 알림 */}
        {restaurant.mealCount === 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 text-center">
            <p className="text-sm font-medium mb-1">🎯 AI 추천 맛집</p>
            <p className="text-xs opacity-90">아직 방문하지 않은 맛집입니다. 방문 후 기록을 남겨보세요!</p>
          </div>
        )}

      <div className="bg-white p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{restaurant.name}</h2>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin size={16} className="mr-2 flex-shrink-0" />
              <span className="text-sm">{restaurant.address}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Star size={18} className="text-yellow-500 fill-current" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {restaurant.mealCount > 0 ? restaurant.avgRating.toFixed(1) : '-'}
            </div>
            <div className="text-xs text-gray-600">평균 평점</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Calendar size={18} className="text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{restaurant.mealCount}회</div>
            <div className="text-xs text-gray-600">방문 횟수</div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <DollarSign size={18} className="text-purple-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {restaurant.mealCount > 0 ? formatPrice(Math.round(avgPrice / 1000)) + 'k' : '-'}
            </div>
            <div className="text-xs text-gray-600">평균 가격</div>
          </div>
        </div>

        {restaurant.mealCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>첫 방문: {new Date(restaurant.firstVisit).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span>최근: {new Date(restaurant.lastVisit).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        )}
      </div>

      {restaurant.latitude && restaurant.longitude && (
        <div className="mt-4 bg-white">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin size={20} className="mr-2 text-blue-500" />
              위치
            </h3>
          </div>
          <div className="p-4">
            <KakaoMap
              latitude={restaurant.latitude}
              longitude={restaurant.longitude}
              level={3}
              markers={[{
                lat: restaurant.latitude,
                lng: restaurant.longitude,
                title: restaurant.name
              }]}
              className="w-full h-64 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* 이 맛집을 방문한 친구들 표시 */}
      {restaurant.locationGroupId && (
        <div className="mt-4">
          <LocationGroupInfo 
            locationGroupId={restaurant.locationGroupId} 
            restaurantName={restaurant.name} 
          />
        </div>
      )}

      <div className="mt-4 bg-white">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">방문 기록 ({restaurant.meals.length})</h3>
        </div>

        {restaurant.meals.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                <Star size={32} className="text-purple-500" />
              </div>
            </div>
            <p className="text-gray-600 mb-2">아직 방문 기록이 없습니다</p>
            <p className="text-sm text-gray-400">이 맛집을 방문하고 첫 번째 기록을 남겨보세요!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {restaurant.meals.map((meal) => (
            <Link key={meal.id} href={`/meal/${meal.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
              <div className="flex gap-3">
                <div className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                  {meal.photo ? (
                    <Image
                      src={transformImageUrl(meal.photo)}
                      alt={meal.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{meal.name}</h4>
                    {meal.rating && (
                      <div className="flex items-center ml-2 flex-shrink-0">
                        <Star size={14} className="text-yellow-400 fill-current mr-0.5" />
                        <span className="text-sm font-medium text-gray-700">{meal.rating}</span>
                      </div>
                    )}
                  </div>

                  {meal.memo && <p className="text-sm text-gray-600 mb-2 line-clamp-1">{meal.memo}</p>}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      {meal.price && <span className="font-medium text-blue-600">{formatPrice(meal.price)}원</span>}
                      {meal.companionNames && (
                        <span className="flex items-center">
                          <Users size={12} className="mr-1" />
                          {meal.companionNames}
                        </span>
                      )}
                    </div>
                    <span>{new Date(meal.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
