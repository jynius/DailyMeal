import { Star, MapPin, Clock, Share2, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShareModal } from './share-modal'
import { EvaluateModal } from './evaluate-modal'
import { useAlert } from './ui/alert'
import { useToast } from './ui/toast'
import { mealRecordsApi } from '@/lib/api'
import { createShare } from '@/lib/api/share'
import { ROUTES, transformImageUrl, APP_CONFIG } from '@/lib/constants'
import { createLogger } from '@/lib/logger'
import type { MealRecord } from '@/types'
import Spinner from './ui/spinner'

const log = createLogger('MealCard')

interface MealCardProps {
  readonly id: string
  readonly name: string
  readonly photo?: string
  readonly photos?: string[]
  readonly location?: string
  readonly rating?: number
  readonly memo?: string
  readonly createdAt: string
  readonly price?: number
  readonly companionNames?: string
  readonly category?: string
  readonly photoTakenAt?: string // 사진 촬영 시간 추가
  readonly onEvaluated?: () => void
  readonly onDeleted?: () => void
}

export function MealCard({
  id,
  name,
  photo,
  photos,
  location,
  rating,
  memo,
  createdAt,
  price,
  companionNames,
  category,
  photoTakenAt, // props로 받기
  onEvaluated,
  onDeleted,
}: MealCardProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showEvaluateModal, setShowEvaluateModal] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [shareUrl, setShareUrl] = useState<string>('')
  const [isCreatingShare, setIsCreatingShare] = useState(false)
  const { showAlert, showConfirm } = useAlert()
  const toast = useToast()

  // 현재 meal 데이터를 수정 모드로 전달하기 위해 구성
  const mealData: MealRecord | null = rating
    ? {
        id,
        name,
        photo,
        photos,
        location,
        rating,
        memo,
        price,
        companionNames,
        category: category as 'home' | 'delivery' | 'restaurant',
        createdAt,
        updatedAt: createdAt,
        userId: '', // 실제 userId는 필요 없음 (수정 시 사용 안 함)
      }
    : null

  // photos 배열 우선, 없으면 photo 사용
  const photoList = (() => {
    if (photos && photos.length > 0) {
      return photos
    }
    if (photo) {
      return [photo]
    }
    return []
  })()

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault() // Link 클릭 방지
    e.stopPropagation()

    setIsCreatingShare(true)
    try {
      // 공유 링크 생성
      const result = await createShare(id)
      setShareUrl(result.url)

      // 링크 복사 (실패해도 모달은 열기)
      try {
        await navigator.clipboard.writeText(result.url)
        toast.success('공유 링크가 복사되었습니다! 📋')
      } catch (clipboardError) {
        log.warn('Clipboard API not available', clipboardError)
        // 클립보드 실패는 무시 (비보안 컨텍스트에서는 정상)
      }

      // ShareModal 열기 (추가 공유 옵션용)
      setShowShareModal(true)
    } catch (error) {
      log.error('Failed to create share link', error)
      toast.error('공유 링크 생성에 실패했습니다.')
    } finally {
      setIsCreatingShare(false)
    }
  }

  const handleEvaluate = (e: React.MouseEvent) => {
    e.preventDefault() // Link 클릭 방지
    e.stopPropagation()
    setShowEvaluateModal(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    showConfirm({
      title: '삭제 확인',
      message: '이 식사 기록을 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          await mealRecordsApi.delete(id)
          if (onDeleted) {
            onDeleted()
          } else if (onEvaluated) {
            onEvaluated() // 삭제 후에도 목록 새로고침
          }
        } catch (error) {
          log.error('Failed to delete meal', error)
          showAlert({
            title: '삭제 실패',
            message: '식사 기록 삭제에 실패했습니다.',
            type: 'error',
          })
        }
      },
    })
  }

  // 이미지 URL을 절대 경로로 변환 (카카오톡 공유용)
  const getAbsoluteImageUrl = (url?: string) => {
    if (!url) {
      // 기본 플레이스홀더 이미지 (localhost는 카카오톡에서 안 보임)
      return 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=DailyMeal'
    }

    // 이미 절대 URL이면 그대로 반환
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // localhost는 카카오 서버에서 접근 불가하므로 플레이스홀더 사용
      if (url.includes('localhost')) {
        return 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=DailyMeal'
      }
      return url
    }

    // 상대 경로면 SITE_URL과 조합하여 절대 경로 생성
    // 카카오톡 공유는 외부 서버가 접근해야 하므로 절대 URL 필수!
    const absoluteUrl = `${APP_CONFIG.SITE_URL}${url}`

    // 개발 환경 체크 (localhost)
    if (absoluteUrl.includes('localhost')) {
      return 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=DailyMeal'
    }

    return absoluteUrl
  }

  const shareData = {
    title: `${name} - DailyMeal`,
    description: memo || `${name} 식사 기록`,
    url: shareUrl || `${APP_CONFIG.SITE_URL}${ROUTES.MEAL(id)}`,
    imageUrl: getAbsoluteImageUrl(photoList[0]),
  }

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentPhotoIndex((prev) => (prev === 0 ? photoList.length - 1 : prev - 1))
  }

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentPhotoIndex((prev) => (prev === photoList.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      <Link href={`/meal/${id}`} className="block touch-target">
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]">
          {/* Photo Carousel */}
          <div className="aspect-square relative bg-gray-100">
            {photoList.length > 0 ? (
              <>
                {/* 현재 사진 */}
                <div className="relative w-full h-full overflow-hidden">
                  {photoList.map((photoUrl, index) => {
                    const getTranslateClass = () => {
                      if (index === currentPhotoIndex) {
                        return 'translate-x-0'
                      }
                      if (index < currentPhotoIndex) {
                        return '-translate-x-full'
                      }
                      return 'translate-x-full'
                    }

                    return (
                      <div
                        key={`${id}-photo-${photoUrl}-${index}`}
                        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${getTranslateClass()}`}
                      >
                        <Image
                          src={transformImageUrl(photoUrl)}
                          alt={`${name} ${index + 1}`}
                          fill
                          className="object-cover high-res-image"
                          priority={index === 0}
                          sizes="(max-width: 768px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    )
                  })}
                </div>

                {/* 네비게이션 버튼 (2장 이상일 때만) */}
                {photoList.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors z-[5]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors z-[5]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>

                    {/* 페이지 인디케이터 */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs z-10">
                      {currentPhotoIndex + 1}/{photoList.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-3xl sm:text-4xl">🍽️</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4">
            {/* 동행자 (맨 위) */}
            <div className="flex items-center text-xs text-gray-700 mb-2 pb-2 border-b border-gray-100">
              <span className="mr-1.5">{companionNames ? '👥' : '🙋'}</span>
              <span className="truncate">{companionNames || '혼밥'}</span>
            </div>

            {/* 식사 이름 */}
            <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1">{name}</h4>

            {/* 가격 */}
            {price && (
              <div className="text-base font-semibold text-blue-600 mb-2">
                ₩{price.toLocaleString()}
              </div>
            )}

            {/* 식당 이름 & 날짜 */}
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              {location && (
                <>
                  <div className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    <span className="font-medium truncate max-w-[120px]">{location}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                </>
              )}
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                {/* photoTakenAt이 있으면 우선 표시, 없으면 createdAt 표시 */}
                <span>
                  {photoTakenAt ? new Date(photoTakenAt).toLocaleString('ko-KR') : createdAt}
                </span>
              </div>
            </div>

            {/* 별점 */}
            {rating && rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={`${id}-star-${i}`}
                    size={16}
                    className={`${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-1 text-sm font-semibold text-gray-700">{rating}/5</span>
              </div>
            )}

            {/* 메모 */}
            {memo && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{memo}</p>}

            {/* 액션 버튼들 */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              {/* 평가/수정 버튼 */}
              <button
                onClick={handleEvaluate}
                className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium"
                title={rating ? '수정하기' : '평가하기'}
              >
                <Edit size={14} />
                {rating ? '수정' : '평가'}
              </button>

              {/* 공유 버튼 */}
              <button
                onClick={handleShare}
                disabled={isCreatingShare}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="공유하기"
              >
                {isCreatingShare ? (
                  <Spinner size="sm" />
                ) : (
                  <Share2 size={16} className="text-gray-600" />
                )}
              </button>

              {/* 삭제 버튼 */}
              <button
                onClick={handleDelete}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                title="삭제하기"
              >
                <Trash2 size={16} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* 공유 모달 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={shareData}
        imageUrl={shareData.imageUrl}
      />

      {/* 평가 모달 */}
      <EvaluateModal
        isOpen={showEvaluateModal}
        onClose={() => setShowEvaluateModal(false)}
        mealId={id}
        mealName={name}
        existingMeal={mealData}
        onSuccess={onEvaluated}
      />
    </>
  )
}
