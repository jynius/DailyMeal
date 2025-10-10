'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Star, MapPin, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BottomNavigation } from '@/components/bottom-navigation'
import { profileApi, UserStatistics } from '@/lib/api/profile'
import { useToast } from '@/components/ui/toast'

export default function StatisticsPage() {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStatistics | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await profileApi.getStatistics()
        setStats(data)
      } catch (error) {
        console.error('통계 로딩 실패:', error)
        toast.error('통계를 불러올 수 없습니다', '오류')
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">통계 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">통계를 불러올 수 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10 pt-safe">
        <div className="flex items-center gap-3 mt-2">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">통계</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-blue-500" />
            <h2 className="font-semibold text-gray-900">전체 통계</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalReviews}</div>
              <div className="text-xs text-gray-600 mt-1">총 평가</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalRestaurants}</div>
              <div className="text-xs text-gray-600 mt-1">방문 맛집</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
              <div className="text-xs text-gray-600 mt-1">평균 평점</div>
            </div>
          </div>
        </section>

        {stats.monthlyStats && stats.monthlyStats.length > 0 && (
          <section className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-purple-500" />
              <h2 className="font-semibold text-gray-900">월별 활동</h2>
            </div>
            
            <div className="space-y-3">
              {stats.monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="text-sm text-gray-600">{stat.month}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-900">
                      <strong>{stat.reviewCount}</strong>개
                    </span>
                    <span className="text-blue-500">
                      ⭐ {stat.averageRating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {stats.topRatedRestaurants && stats.topRatedRestaurants.length > 0 && (
          <section className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-green-500" />
              <h2 className="font-semibold text-gray-900">자주 간 맛집 TOP 5</h2>
            </div>
            
            <div className="space-y-3">
              {stats.topRatedRestaurants.map((restaurant, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{restaurant.name}</div>
                      <div className="text-xs text-gray-500">{restaurant.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-gray-900">{restaurant.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500">{restaurant.visitCount}회</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {stats.totalReviews === 0 && (
          <section className="bg-white rounded-lg border p-8 text-center">
            <p className="text-gray-500">아직 평가 기록이 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">첫 식사 기록을 남겨보세요!</p>
          </section>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
