'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MealCard } from '@/components/meal-card'
import { mealRecordsApi } from '@/lib/api'
import { createLogger } from '@/lib/logger'
import type { MealRecord } from '@/types'
import Spinner from '@/components/ui/spinner'

const log = createLogger('FeedPage')

// 동적 렌더링 강제 (useSearchParams 사용)
export const dynamic = 'force-dynamic'

function FeedContent() {
  const searchParams = useSearchParams()
  const [meals, setMeals] = useState<MealRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'rated' | 'unrated'>('all')

  // URL 파라미터에서 초기 필터 설정
  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam === 'unrated') {
      setFilter('unrated')
    } else if (filterParam === 'rated') {
      setFilter('rated')
    } else if (filterParam === 'all') {
      setFilter('all')
    }
  }, [searchParams])

  // 데이터 가져오기 함수
  const fetchMeals = async () => {
    try {
      setLoading(true)
      setError(null)

      log.debug('Fetching meals from API')

      const result = await mealRecordsApi.getAll()
      log.info('Meals fetched successfully', {
        count: Array.isArray(result) ? result.length : result.data?.length,
      })

      if (Array.isArray(result)) {
        setMeals(result)
      } else if (result.data) {
        setMeals(result.data)
      }
    } catch (err: unknown) {
      const error = err as Error
      log.error('Failed to load meals', error)
      setError(error.message || '식사 기록을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeals()
  }, [])

  const formatDate = (dateString: string) => {
    // 클라이언트에서만 실행되도록 체크
    if (typeof window === 'undefined') {
      return '로딩...'
    }

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
    return <Spinner container="page" text="식사 기록을 불러오는 중..." className="pb-20" />
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Content */}
      <div className="p-4 space-y-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={() => fetchMeals()} className="mt-2 text-red-500 underline">
              다시 시도
            </button>
          </div>
        ) : (
          (() => {
            // 필터링 로직 - rating만으로 평가 여부 판단
            let filteredMeals = meals

            if (filter === 'rated') {
              filteredMeals = meals.filter((meal) => meal.rating)
            } else if (filter === 'unrated') {
              filteredMeals = meals.filter((meal) => !meal.rating)
            }

            return filteredMeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {filter === 'unrated'
                    ? '미평가 식사가 없습니다. 모두 평가를 완료하셨네요! 🎉'
                    : filter === 'rated'
                      ? '평가 완료된 식사가 없습니다.'
                      : '아직 기록된 식사가 없습니다.'}
                </p>
                {filter === 'all' && (
                  <a
                    href="/add"
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    첫 번째 식사 기록하기
                  </a>
                )}
              </div>
            ) : (
              filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  {...meal}
                  createdAt={formatDate(meal.createdAt)}
                  onEvaluated={fetchMeals} // 평가 완료 시 목록 새로고침
                />
              ))
            )
          })()
        )}
      </div>
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<Spinner container="page" size="lg" text="로딩 중..." />}>
      <FeedContent />
    </Suspense>
  )
}
