'use client'

import { useState } from 'react'
import { ArrowLeft, TrendingUp, Star, MapPin, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BottomNavigation } from '@/components/bottom-navigation'

export default function StatisticsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  // 샘플 데이터
  const stats = {
    week: {
      totalMeals: 12,
      totalReviews: 8,
      averageRating: 4.2,
      topRestaurants: [
        { name: '김밥천국', visits: 3, rating: 4.5 },
        { name: '피자헛', visits: 2, rating: 4.0 },
      ],
      categoryBreakdown: {
        '한식': 5,
        '양식': 3,
        '중식': 2,
        '일식': 2,
      }
    },
    month: {
      totalMeals: 48,
      totalReviews: 32,
      averageRating: 4.3,
      topRestaurants: [
        { name: '김밥천국', visits: 12, rating: 4.5 },
        { name: '스타벅스', visits: 8, rating: 4.2 },
        { name: '맥도날드', visits: 6, rating: 3.8 },
      ],
      categoryBreakdown: {
        '한식': 20,
        '양식': 12,
        '중식': 8,
        '일식': 8,
      }
    },
    year: {
      totalMeals: 576,
      totalReviews: 384,
      averageRating: 4.1,
      topRestaurants: [
        { name: '김밥천국', visits: 144, rating: 4.5 },
        { name: '스타벅스', visits: 96, rating: 4.2 },
        { name: '맥도날드', visits: 72, rating: 3.8 },
      ],
      categoryBreakdown: {
        '한식': 240,
        '양식': 144,
        '중식': 96,
        '일식': 96,
      }
    }
  }

  const currentStats = stats[period]

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">통계</h1>
        </div>
        
        {/* 기간 선택 */}
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === 'week' ? '주간' : p === 'month' ? '월간' : '연간'}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* 전체 통계 */}
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-blue-500" />
            <h2 className="font-semibold text-gray-900">전체 통계</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{currentStats.totalMeals}</div>
              <div className="text-xs text-gray-600 mt-1">총 식사</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{currentStats.totalReviews}</div>
              <div className="text-xs text-gray-600 mt-1">평가 수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{currentStats.averageRating}</div>
              <div className="text-xs text-gray-600 mt-1">평균 평점</div>
            </div>
          </div>
        </section>

        {/* 자주 간 맛집 */}
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-green-500" />
            <h2 className="font-semibold text-gray-900">자주 간 맛집</h2>
          </div>
          
          <div className="space-y-3">
            {currentStats.topRestaurants.map((restaurant, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{restaurant.name}</div>
                    <div className="text-xs text-gray-500">{restaurant.visits}회 방문</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{restaurant.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 카테고리별 분석 */}
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-orange-500" />
            <h2 className="font-semibold text-gray-900">카테고리별 분석</h2>
          </div>
          
          <div className="space-y-3">
            {Object.entries(currentStats.categoryBreakdown).map(([category, count]) => {
              const percentage = (count / currentStats.totalMeals * 100).toFixed(0)
              return (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">{category}</span>
                    <span className="text-sm font-medium text-gray-900">{count}회 ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 인사이트 */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">💡 인사이트</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• 가장 자주 방문한 곳은 <strong>{currentStats.topRestaurants[0].name}</strong>입니다</li>
            <li>• <strong>한식</strong>을 가장 많이 드셨어요</li>
            <li>• 평균 평점이 지난 기간보다 <strong>0.2점 상승</strong>했습니다</li>
          </ul>
        </section>
      </div>

      <BottomNavigation />
    </div>
  )
}
