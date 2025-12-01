// frontend/src/components/ai/RecommendationsCard.tsx

import type { RecommendationResponse } from '@/lib/api'
import { MapPin, Star, DollarSign, Users } from 'lucide-react'

interface RecommendationsCardProps {
  data: RecommendationResponse
}

export default function RecommendationsCard({ data }: RecommendationsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  const getRecommendationTypeLabel = (type: string) => {
    switch (type) {
      case 'social':
        return '친구들이 좋아한 맛집'
      case 'popular':
        return '인기 맛집'
      case 'collaborative':
        return '취향 기반 추천'
      default:
        return '추천 맛집'
    }
  }

  if (data.recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>추천할 맛집이 없습니다</p>
        <p className="text-sm mt-2">더 많은 식사 기록을 남겨주세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{getRecommendationTypeLabel(data.type)}</p>
        <p className="text-xs text-gray-400">
          {new Date(data.generatedAt).toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* 추천 맛집 리스트 */}
      <div className="space-y-3">
        {data.recommendations.map((rec, index) => (
          <div key={`${rec.restaurantName}-${index}`} className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{rec.restaurantName}</h3>
                {rec.address && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin size={12} />
                    {rec.address}
                  </p>
                )}
              </div>
              {rec.visited && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  방문함
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              {rec.rating !== undefined && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star size={14} />
                  <span>{rec.rating.toFixed(1)}</span>
                </div>
              )}

              {rec.averagePrice !== undefined && (
                <div className="flex items-center gap-1 text-green-600">
                  <DollarSign size={14} />
                  <span>{formatCurrency(rec.averagePrice)}</span>
                </div>
              )}

              {rec.distance !== undefined && (
                <div className="flex items-center gap-1 text-blue-600">
                  <MapPin size={14} />
                  <span>{formatDistance(rec.distance)}</span>
                </div>
              )}

              {rec.visitCount !== undefined && rec.visitCount > 0 && (
                <div className="flex items-center gap-1 text-purple-600">
                  <Users size={14} />
                  <span>{rec.visitCount}회 방문</span>
                </div>
              )}
            </div>

            {/* 친구 추천 정보 */}
            {rec.likedByFriends && rec.likedByFriends.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-600 mb-2">좋아한 친구들</p>
                <div className="flex flex-wrap gap-2">
                  {rec.likedByFriends.map((friend) => (
                    <span
                      key={friend.friendId}
                      className="text-xs bg-white border px-2 py-1 rounded-full"
                    >
                      {friend.friendName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
