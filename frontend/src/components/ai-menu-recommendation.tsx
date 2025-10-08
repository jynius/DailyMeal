'use client'

import { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, MapPin, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MenuRecommendation {
  id: string
  name: string
  category: string
  description: string
  estimatedPrice: string
  cookingTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  reason: string
  nearbyRestaurants?: string[]
}

interface AIRecommendationProps {
  preferences?: {
    budget?: 'low' | 'medium' | 'high'
    timeAvailable?: 'quick' | 'medium' | 'leisurely'
    mood?: 'healthy' | 'comfort' | 'adventurous'
    location?: string
  }
}

export function AIMenuRecommendation({ preferences }: AIRecommendationProps) {
  const [recommendations, setRecommendations] = useState<MenuRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    generateRecommendations()
  }, [preferences])

  const generateRecommendations = async () => {
    setLoading(true)
    
    // 시뮬레이션된 AI 추천 (실제로는 백엔드 AI API 호출)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const hour = currentTime.getHours()
    const isWeekend = [0, 6].includes(currentTime.getDay())
    
    const allRecommendations: MenuRecommendation[] = [
      // 아침 메뉴
      {
        id: '1',
        name: '아보카도 토스트',
        category: '아침식사',
        description: '신선한 아보카도와 통밀빵으로 만든 건강한 아침식사',
        estimatedPrice: '8,000-12,000원',
        cookingTime: '10분',
        difficulty: 'easy',
        reason: '건강한 지방과 섬유질이 풍부해 아침에 완벽해요',
        nearbyRestaurants: ['브런치카페 모모', '헬시키친']
      },
      // 점심 메뉴
      {
        id: '2', 
        name: '김치찌개',
        category: '점심식사',
        description: '매콤하고 시원한 국물의 전통 한식',
        estimatedPrice: '7,000-10,000원',
        cookingTime: '15분',
        difficulty: 'medium',
        reason: '날씨가 쌀쌀해서 따뜻한 국물 요리가 좋을 것 같아요',
        nearbyRestaurants: ['할머니 손맛', '고향집']
      },
      {
        id: '3',
        name: '연어 샐러드',
        category: '점심식사', 
        description: '신선한 연어와 각종 채소의 조화',
        estimatedPrice: '15,000-20,000원',
        cookingTime: '5분',
        difficulty: 'easy',
        reason: '가벼우면서도 영양가 있는 식사로 오후 컨디션에 좋아요',
        nearbyRestaurants: ['샐러드보울', '프레시키친']
      },
      // 저녁 메뉴
      {
        id: '4',
        name: '스테이크',
        category: '저녁식사',
        description: '부드러운 소고기 스테이크와 감자 가니시',
        estimatedPrice: '25,000-35,000원', 
        cookingTime: '20분',
        difficulty: 'hard',
        reason: '하루 일과를 마친 후 특별한 저녁 식사로 추천해요',
        nearbyRestaurants: ['스테이크하우스', '더 그릴']
      },
      {
        id: '5',
        name: '라멘',
        category: '저녁식사',
        description: '진한 육수와 쫄깃한 면발의 일본식 라멘',
        estimatedPrice: '12,000-16,000원',
        cookingTime: '30분',
        difficulty: 'medium',
        reason: '피곤한 하루 끝에 따뜻하고 든든한 한 그릇',
        nearbyRestaurants: ['라멘야마다', '텐동라멘']
      }
    ]
    
    // 시간대별 필터링
    let filteredRecommendations: MenuRecommendation[] = []
    
    if (hour >= 6 && hour < 11) {
      // 아침 시간
      filteredRecommendations = allRecommendations.filter(r => r.category === '아침식사')
    } else if (hour >= 11 && hour < 15) {
      // 점심 시간  
      filteredRecommendations = allRecommendations.filter(r => r.category === '점심식사')
    } else {
      // 저녁 시간
      filteredRecommendations = allRecommendations.filter(r => r.category === '저녁식사')
    }
    
    // 선호도에 따른 추가 필터링
    if (preferences?.budget === 'low') {
      filteredRecommendations = filteredRecommendations.filter(r => 
        !r.estimatedPrice.includes('25,000') && !r.estimatedPrice.includes('35,000')
      )
    }
    
    if (preferences?.timeAvailable === 'quick') {
      filteredRecommendations = filteredRecommendations.filter(r => 
        parseInt(r.cookingTime) <= 15
      )
    }
    
    setRecommendations(filteredRecommendations.slice(0, 3))
    setLoading(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'  
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움'
      case 'medium': return '보통'
      case 'hard': return '어려움'
      default: return '알 수 없음'
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI 메뉴 추천</h3>
            <p className="text-xs text-gray-500">오늘 뭐 먹을지 고민이세요?</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={generateRecommendations}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          새로고침
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={rec.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-semibold">
                      {index + 1}
                    </span>
                    {rec.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(rec.difficulty)}`}>
                  {getDifficultyText(rec.difficulty)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <DollarSign size={12} />
                  {rec.estimatedPrice}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {rec.cookingTime}
                </div>
              </div>
              
              <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded text-center mb-2">
                💡 {rec.reason}
              </p>
              
              {rec.nearbyRestaurants && rec.nearbyRestaurants.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">주변 추천 음식점:</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {rec.nearbyRestaurants.map(restaurant => (
                      <span key={restaurant} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {restaurant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              추천은 시간대, 날씨, 개인 취향을 고려해 생성됩니다
            </p>
          </div>
        </div>
      )}
    </div>
  )
}