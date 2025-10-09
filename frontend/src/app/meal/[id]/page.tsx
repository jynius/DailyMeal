'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, MapPin, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAlert } from '@/components/ui/alert'
import Image from 'next/image'

interface MealRecord {
  id: string
  name: string
  photo?: string
  photos?: string[]
  location?: string
  rating?: number
  memo?: string
  price?: number
  createdAt: string
  updatedAt: string
}

export default function MealDetailPage({ params }: { params: { id: string } }) {
  const [meal, setMeal] = useState<MealRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const router = useRouter()
  const { showAlert } = useAlert()

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const resolvedParams = await params
        const { mealRecordsApi } = await import('@/lib/api/client')
        const data = await mealRecordsApi.getOne(resolvedParams.id)
        setMeal(data)
      } catch (error) {
        console.error('Failed to fetch meal:', error)
        showAlert({
          title: '오류',
          message: '식사 기록을 불러오는데 실패했습니다.',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchMeal()
  }, [params, showAlert])

  const handleDelete = async () => {
    showAlert({
      title: '삭제 확인',
      message: '이 식사 기록을 삭제하시겠습니까?',
      type: 'warning',
      onConfirm: async () => {
        try {
          const resolvedParams = await params
          const { mealRecordsApi } = await import('@/lib/api/client')
          await mealRecordsApi.delete(resolvedParams.id)
          router.push('/feed')
        } catch (error) {
          console.error('Failed to delete meal:', error)
          showAlert({
            title: '삭제 실패',
            message: '식사 기록 삭제에 실패했습니다.',
            type: 'error'
          })
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">식사 기록을 찾을 수 없습니다.</p>
          <Link href="/feed" className="text-blue-500 mt-4 inline-block">
            피드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const photos = meal.photos && meal.photos.length > 0 ? meal.photos : (meal.photo ? [meal.photo] : [])
  const hasRating = meal.rating !== undefined && meal.rating !== null && meal.rating > 0

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <Link href="/feed">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold">식사 기록</h1>
        <button onClick={handleDelete} className="text-red-500">
          <Trash2 size={20} />
        </button>
      </div>

      {/* 사진 갤러리 */}
      {photos.length > 0 && (
        <div className="relative">
          <div className="aspect-square bg-gray-100 relative overflow-hidden">
            {/* 현재 사진 */}
            {photos.map((photoUrl, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                  index === currentPhotoIndex ? 'translate-x-0' : index < currentPhotoIndex ? '-translate-x-full' : 'translate-x-full'
                }`}
              >
                <Image
                  src={photoUrl.startsWith('http') 
                    ? photoUrl
                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${photoUrl}`
                  }
                  alt={`${meal.name} ${index + 1}`}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
          
          {/* 네비게이션 버튼 (2장 이상일 때만) */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentPhotoIndex(prev => prev === 0 ? photos.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={() => setCurrentPhotoIndex(prev => prev === photos.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              
              {/* 페이지 인디케이터 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                {currentPhotoIndex + 1} / {photos.length}
              </div>
              
              {/* 썸네일 미리보기 */}
              <div className="absolute bottom-16 left-0 right-0 px-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
                  {photos.map((photoUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentPhotoIndex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'
                      }`}
                    >
                      <Image
                        src={photoUrl.startsWith('http') 
                          ? photoUrl
                          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${photoUrl}`
                        }
                        alt={`썸네일 ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 정보 섹션 */}
      <div className="p-4 space-y-4">
        {/* 제목 & 날짜 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{meal.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(meal.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* 평가 상태 */}
        {hasRating ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">평가</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${
                      i < meal.rating! ? 'text-yellow-500 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {meal.location && (
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <MapPin size={14} className="mr-1" />
                {meal.location}
              </div>
            )}
            
            {meal.price && (
              <div className="text-sm text-gray-600 mb-1">
                💰 ₩{meal.price.toLocaleString()}
              </div>
            )}
            
            {meal.memo && (
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                {meal.memo}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-3">
              ⭐ 아직 평가하지 않은 식사입니다
            </p>
            <Link href={`/meal/${meal.id}/evaluate`}>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                <Star size={16} className="mr-2" />
                평가하기
              </Button>
            </Link>
          </div>
        )}

        {/* 수정 버튼 (이미 평가한 경우) */}
        {hasRating && (
          <Link href={`/meal/${meal.id}/evaluate`}>
            <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700">
              <Edit size={16} className="mr-2" />
              평가 수정하기
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
