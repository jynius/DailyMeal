// frontend/src/components/ai/PatternAnalysisCard.tsx

import type { PatternAnalysisResponse } from '@/lib/api'
import { Clock, Calendar, Home, Users } from 'lucide-react'

interface PatternAnalysisCardProps {
  data: PatternAnalysisResponse
}

export default function PatternAnalysisCard({ data }: PatternAnalysisCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'home':
        return '🏠'
      case 'delivery':
        return '🚗'
      case 'restaurant':
        return '🍽️'
      default:
        return '🍴'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'home':
        return '집밥'
      case 'delivery':
        return '배달'
      case 'restaurant':
        return '외식'
      default:
        return category
    }
  }

  return (
    <div className="space-y-6">
      {/* 총 식사 횟수 */}
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-3xl font-bold text-blue-600">{data.totalMeals}</div>
        <div className="text-sm text-gray-600 mt-1">총 식사 기록</div>
      </div>

      {/* 시간대별 분포 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={18} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">시간대별 식사</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-16">아침</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div className="bg-yellow-400 h-full flex items-center justify-end pr-2"
                style={{ width: `${data.timeDistribution.breakfast}%` }}
              >
                <span className="text-xs font-medium text-gray-900">
                  {data.timeDistribution.breakfast.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-16">점심</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div className="bg-orange-400 h-full flex items-center justify-end pr-2"
                style={{ width: `${data.timeDistribution.lunch}%` }}
              >
                <span className="text-xs font-medium text-gray-900">
                  {data.timeDistribution.lunch.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-16">저녁</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div className="bg-blue-400 h-full flex items-center justify-end pr-2"
                style={{ width: `${data.timeDistribution.dinner}%` }}
              >
                <span className="text-xs font-medium text-gray-900">
                  {data.timeDistribution.dinner.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-16">야식</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-purple-400 h-full flex items-center justify-end pr-2"
                style={{ width: `${data.timeDistribution.lateNight}%` }}
              >
                <span className="text-xs font-medium text-gray-900">
                  {data.timeDistribution.lateNight.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 요일별 패턴 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">요일별 패턴</h3>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {data.weekdayPattern.map((day) => {
            const days = ['일', '월', '화', '수', '목', '금', '토']
            const maxCount = Math.max(...data.weekdayPattern.map((d) => d.count))
            const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0

            return (
              <div key={day.weekday} className="flex flex-col items-center gap-1">
                <div className="w-full h-24 bg-gray-100 rounded relative flex items-end justify-center">
                  <div className="w-full bg-blue-500 rounded transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="absolute bottom-1 text-xs font-medium text-white">
                    {day.count}
                  </span>
                </div>
                <span className="text-xs text-gray-600">{days[day.weekday]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 카테고리별 분포 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Home size={18} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">식사 유형</h3>
        </div>
        <div className="space-y-2">
          {data.preferredCategories.map((cat) => (
            <div key={cat.category} className="flex items-center gap-2">
              <span className="text-xl">{getCategoryIcon(cat.category)}</span>
              <span className="text-sm text-gray-600 w-16">{getCategoryName(cat.category)}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-green-400 h-full flex items-center justify-end pr-2"
                  style={{ width: `${cat.percentage}%` }}
                >
                  <span className="text-xs font-medium text-gray-900">
                    {cat.count}회 ({cat.percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 식사 동반자 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={18} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">함께 식사한 횟수</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl mb-1">🧍</div>
            <div className="text-xl font-bold text-gray-900">{data.diningMode.alone}</div>
            <div className="text-xs text-gray-600">혼자</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-xl font-bold text-gray-900">{data.diningMode.withFriends}</div>
            <div className="text-xs text-gray-600">친구와 함께</div>
          </div>
        </div>
      </div>
    </div>
  )
}
