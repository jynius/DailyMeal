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

      {/* 주중/주말 패턴 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">주중/주말 패턴</h3>
        </div>
        <div className="space-y-3">
          {/* 주중 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">주중</span>
              <span className="text-xs text-gray-500">월-금</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="bg-green-100 rounded p-2 text-center">
                  <div className="text-lg font-semibold text-green-700">{data.weekdayPattern.weekday.homeCooked}%</div>
                  <div className="text-xs text-gray-600">집밥</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-orange-100 rounded p-2 text-center">
                  <div className="text-lg font-semibold text-orange-700">{data.weekdayPattern.weekday.eatingOut}%</div>
                  <div className="text-xs text-gray-600">외식</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 주말 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">주말</span>
              <span className="text-xs text-gray-500">토-일</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="bg-green-100 rounded p-2 text-center">
                  <div className="text-lg font-semibold text-green-700">{data.weekdayPattern.weekend.homeCooked}%</div>
                  <div className="text-xs text-gray-600">집밥</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-orange-100 rounded p-2 text-center">
                  <div className="text-lg font-semibold text-orange-700">{data.weekdayPattern.weekend.eatingOut}%</div>
                  <div className="text-xs text-gray-600">외식</div>
                </div>
              </div>
            </div>
          </div>
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
            <div className="text-xl font-bold text-gray-900">{data.diningMode.solo}</div>
            <div className="text-xs text-gray-600">혼자</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-xl font-bold text-gray-900">{data.diningMode.group}</div>
            <div className="text-xs text-gray-600">친구와 함께</div>
          </div>
        </div>
      </div>
    </div>
  )
}
