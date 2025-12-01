// frontend/src/components/ai/SpendingAnalysisCard.tsx

import type { SpendingAnalysisResponse } from '@/lib/api'
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SpendingAnalysisCardProps {
  data: SpendingAnalysisResponse
}

export default function SpendingAnalysisCard({ data }: SpendingAnalysisCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'info':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp size={20} className="text-red-500" />
      case 'decreasing':
        return <TrendingDown size={20} className="text-green-500" />
      default:
        return <Minus size={20} className="text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 총 지출 요약 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">총 지출</div>
          <div className="text-xl font-bold text-purple-600">
            {formatCurrency(data.totalSpending)}
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">끼니당 평균</div>
          <div className="text-xl font-bold text-blue-600">
            {formatCurrency(data.averagePerMeal)}
          </div>
        </div>
      </div>

      {/* 지출 트렌드 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          {getTrendIcon(data.trend.direction)}
          <h3 className="font-medium text-gray-900">지출 추세</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{data.trend.message}</span>
            <span
              className={`text-sm font-bold ${
                data.trend.direction === 'increasing' ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {data.trend.percentageChange > 0 ? '+' : ''}
              {data.trend.percentageChange.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 월별 지출 추이 */}
      {data.monthlyTrend.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">월별 지출 추이</h3>
          <div className="space-y-2">
            {data.monthlyTrend.map((month) => {
              const maxTotal = Math.max(...data.monthlyTrend.map((m) => m.total))
              const width = maxTotal > 0 ? (month.total / maxTotal) * 100 : 0

              return (
                <div key={month.month}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{month.month}</span>
                    <span>
                      {month.count}회 · 평균 {formatCurrency(month.average)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-full flex items-center justify-end pr-2"
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-xs font-medium text-white">
                        {formatCurrency(month.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 가성비 맛집 */}
      {data.valueForMoney.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">가성비 맛집 TOP 5</h3>
          <div className="space-y-2">
            {data.valueForMoney.slice(0, 5).map((restaurant, index) => (
              <div key={`${restaurant.restaurantName}-${index}`} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{restaurant.restaurantName}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {restaurant.visitCount}회 방문 · 평균 {formatCurrency(restaurant.averagePrice)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <span className="text-sm font-bold">⭐ {restaurant.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 알림 */}
      {data.alerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-orange-500" />
            <h3 className="font-medium text-gray-900">지출 알림</h3>
          </div>
          <div className="space-y-2">
            {data.alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
                <div className="text-sm font-medium">{alert.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
