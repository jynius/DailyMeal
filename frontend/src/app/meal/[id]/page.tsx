'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, MapPin, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useAlert } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'
import { ShareModal } from '@/components/share-modal'
import { createShare } from '@/lib/api/share'
import Image from 'next/image'
import type { MealRecord } from '@/types'

export default function MealDetailPage({ params }: { params: { id: string } }) {
  const [meal, setMeal] = useState<MealRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState<string>('')
  const [isCreatingShare, setIsCreatingShare] = useState(false)
  const router = useRouter()
  const { showAlert } = useAlert()
  const toast = useToast()

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

  useEffect(() => {
    fetchMeal()
  }, [params, showAlert])

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

  // 이미지 URL을 절대 경로로 변환 (카카오톡 공유용)
  const getAbsoluteImageUrl = (url?: string) => {
    if (!url) {
      // 기본 플레이스홀더 이미지 (localhost는 카카오톡에서 안 보임)
      return 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=DailyMeal'
    }
    if (url.startsWith('http')) return url
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const absoluteUrl = `${apiUrl}${url}`
    
    // localhost URL은 카카오톡에서 표시 안되므로 플레이스홀더 사용
    if (absoluteUrl.includes('localhost')) {
      return 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=DailyMeal'
    }
    
    return absoluteUrl
  }

  const handleShare = async () => {
    try {
      setIsCreatingShare(true)
      const result = await createShare(meal.id)
      setShareUrl(result.url)
      
      // 클립보드에 복사
      await navigator.clipboard.writeText(result.url)
      toast.success('공유 링크가 복사되었습니다!')
      
      setShowShareModal(true)
    } catch (error) {
      console.error('Failed to create share link:', error)
      toast.error('공유 링크 생성에 실패했습니다.')
    } finally {
      setIsCreatingShare(false)
    }
  }

  const shareData = {
    title: `${meal.name} - DailyMeal`,
    description: meal.memo || `${meal.name} 식사 기록`,
    url: shareUrl || (typeof window !== 'undefined' ? `${window.location.origin}/meal/${meal.id}` : ''),
    imageUrl: getAbsoluteImageUrl(photos.length > 0 ? photos[0] : undefined)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <Link href="/feed">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold flex-1">식사 기록</h1>
        </div>
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
                  unoptimized
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
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 transition-colors z-[5]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={() => setCurrentPhotoIndex(prev => prev === photos.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 transition-colors z-[5]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              
              {/* 페이지 인디케이터 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium z-[5]">
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
                        unoptimized
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
        {/* 동행자 (사진 바로 다음) */}
        <div className="flex items-center text-sm text-gray-700 pb-3 border-b border-gray-200">
          <span className="mr-2">
            {meal.companionNames ? '👥' : '🙋'}
          </span>
          <span>{meal.companionNames || '혼밥'}</span>
        </div>

        {/* 제목, 가격, 액션 버튼 */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{meal.name}</h2>
              {meal.price && (
                <div className="text-lg font-semibold text-blue-600 mb-2">
                  ₩{meal.price.toLocaleString()}
                </div>
              )}
              {/* 식당 이름과 날짜/시간 */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {meal.location && (
                  <>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      <span className="font-medium">{meal.location}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                  </>
                )}
                <span>
                  {new Date(meal.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <button 
                onClick={handleShare}
                disabled={isCreatingShare}
                className="text-gray-600 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                aria-label="공유하기"
              >
                {isCreatingShare ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <Share2 size={22} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 평가 상태 */}
        {hasRating ? (
          <div className="space-y-3">
            {/* 별점 */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={24}
                  className={`${
                    i < meal.rating! ? 'text-yellow-500 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-lg font-semibold text-gray-700">
                {meal.rating}/5
              </span>
            </div>
            
            {/* 메모 */}
            {meal.memo && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {meal.memo}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">
              아직 평가하지 않은 식사입니다.
            </p>
          </div>
        )}
      </div>

      {/* 공유 모달 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={shareData}
      />
    </div>
  )
}
