'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Star, Calendar, Users, DollarSign, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { KakaoMap } from '@/components/kakao-map'

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
  params: { id: string }
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurantDetail()
  }, [params.id])

  const fetchRestaurantDetail = async () => {
    try {
      setLoading(true)
      const { mealRecordsApi } = await import('@/lib/api/client')
      
      const response = await mealRecordsApi.getAll(1, 1000)
      const allMeals = response.data

      const targetMeal = allMeals.find((m: any) => m.id === params.id)
      if (!targetMeal || !targetMeal.location) {
        throw new Error('Restaurant not found')
      }

      const restaurantMeals = allMeals.filter(
        (meal: any) => meal.location === targetMeal.location
      )

      const totalRating = restaurantMeals.reduce((sum: number, meal: any) => sum + (meal.rating || 0), 0)
      const totalPrice = restaurantMeals.reduce((sum: number, meal: any) => sum + (meal.price || 0), 0)
      const dates = restaurantMeals.map((meal: any) => new Date(meal.createdAt))
      const firstVisit = new Date(Math.min(...dates.map(d => d.getTime()))).toISOString()
      const lastVisit = new Date(Math.max(...dates.map(d => d.getTime()))).toISOString()

      const restaurantDetail: RestaurantDetail = {
        id: params.id,
        name: targetMeal.location,
        address: targetMeal.address || '주소 정보 없음',
        latitude: targetMeal.latitude,
        longitude: targetMeal.longitude,
        mealCount: restaurantMeals.length,
        avgRating: totalRating / restaurantMeals.length,
        totalPrice: totalPrice,
        firstVisit: firstVisit,
        lastVisit: lastVisit,
        meals: restaurantMeals.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }

      setRestaurant(restaurantDetail)
    } catch (error) {
      console.error('Failed to fetch restaurant detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">식당 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
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
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const avgPrice = restaurant.totalPrice / restaurant.mealCount

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10 pt-safe">
        <div className="flex items-center gap-3 mt-2">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold truncate flex-1">{restaurant.name}</h1>
        </div>
      </header>

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
            <div className="text-lg font-bold text-gray-900">{restaurant.avgRating.toFixed(1)}</div>
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
            <div className="text-lg font-bold text-gray-900">{formatPrice(Math.round(avgPrice / 1000))}k</div>
            <div className="text-xs text-gray-600">평균 가격</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>첫 방문: {new Date(restaurant.firstVisit).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>최근: {new Date(restaurant.lastVisit).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
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

      <div className="mt-4 bg-white">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">방문 기록 ({restaurant.meals.length})</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {restaurant.meals.map((meal) => (
            <Link key={meal.id} href={`/meal/${meal.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
              <div className="flex gap-3">
                <div className="w-20 h-20 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                  {meal.photo ? (
                    <Image
                      src={meal.photo.startsWith('http') ? meal.photo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${meal.photo}`}
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
      </div>
    </div>
  )
}
