'use client'

import { useEffect, useState } from 'react'
import { MealCard } from '@/components/meal-card'
import { BottomNavigation } from '@/components/bottom-navigation'
import { mealRecordsApi, type MealRecord } from '@/lib/api/client'

export default function FeedPage() {
  const [meals, setMeals] = useState<MealRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        // 임시로 로그인한 사용자가 없어도 빈 배열을 보여주도록 처리
        const result = await mealRecordsApi.getAll()
        console.log('🍽️ API Response:', result)
        if (Array.isArray(result)) {
          console.log('📸 Image URLs:', result.map((meal: MealRecord) => meal.photo))
          setMeals(result)
        } else if (result.data) {
          console.log('📸 Image URLs:', result.data.map((meal: MealRecord) => meal.photo))
          setMeals(result.data)
        }
      } catch (err: any) {
        console.error('식사 기록 로딩 실패:', err)
        // 인증 오류인 경우 샘플 데이터 표시
        if (err.message?.includes('unauthorized') || err.message?.includes('401')) {
          setMeals(getSampleMeals())
        } else {
          setError(err.message || '식사 기록을 불러올 수 없습니다.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [])

  // 샘플 데이터 (로그인 전 또는 오류 시 사용)
  const getSampleMeals = (): MealRecord[] => [
    {
      id: '1',
      name: '크림파스타',
      location: '홍대 이탈리안 레스토랑',
      rating: 4,
      memo: '친구들과 함께 먹은 맛있는 파스타! 크림소스가 정말 진했어요 🍝',
      createdAt: '2024-10-03T13:30:00Z',
      updatedAt: '2024-10-03T13:30:00Z',
      price: 18000,
      userId: 'sample',
    },
    {
      id: '2',
      name: '김치찌개',
      location: '집',
      rating: 5,
      memo: '집에서 만든 김치찌개. 엄마 손맛 그리워서 만들어봤는데 성공!',
      createdAt: '2024-10-02T19:20:00Z',
      updatedAt: '2024-10-02T19:20:00Z',
      userId: 'sample',
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">식사 기록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">나의 식단</h1>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-500 underline"
            >
              다시 시도
            </button>
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">아직 기록된 식사가 없습니다.</p>
            <a 
              href="/add" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              첫 번째 식사 기록하기
            </a>
          </div>
        ) : (
          meals.map((meal) => (
            <MealCard 
              key={meal.id} 
              {...meal} 
              createdAt={formatDate(meal.createdAt)}
            />
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}