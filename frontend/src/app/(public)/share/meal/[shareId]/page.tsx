'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Star, MapPin, Share2, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ShareModal } from '@/components/share-modal'
import { AppDeepLink } from '@/components/app-deep-link'
import { getPublicMeal, trackShareView, type PublicMealResponse } from '@/lib/api/share'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'

interface SharedMealPageProps {
  params: Promise<{ shareId: string }>
}

export default async function SharedMealPage({ params }: SharedMealPageProps) {
  const { shareId } = await params

  return <SharedMealContent shareId={shareId} />
}

function SharedMealContent({ shareId }: { shareId: string }) {
  const [meal, setMeal] = useState<PublicMealResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    // ref 저장 (친구 연결용)
    if (ref) {
      sessionStorage.setItem('shareRef', ref)
    }

    fetchMeal()
  }, [shareId, ref])

  const fetchMeal = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentShareId = shareId

      // 공개 Meal 조회
      const data = await getPublicMeal(currentShareId)
      setMeal(data)

      // 조회 추적
      trackShareView(currentShareId).catch(() => {
        // 조회수 추적 실패
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '공유된 식사 기록을 찾을 수 없습니다.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevPhoto = () => {
    if (!meal?.photos) return
    setCurrentPhotoIndex((prev) => (prev === 0 ? meal.photos!.length - 1 : prev - 1))
  }

  const handleNextPhoto = () => {
    if (!meal?.photos) return
    setCurrentPhotoIndex((prev) => (prev === meal.photos!.length - 1 ? 0 : prev + 1))
  }

  if (loading) {
    return <Spinner container="page" size="lg" text="로딩 중..." />
  }

  if (error || !meal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-600 mb-4">{error || '공유된 식사 기록을 찾을 수 없습니다.'}</p>
          <Link href="/" className="text-blue-500 underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const photos = meal.photos || []
  const hasPhotos = photos.length > 0
  const shareData = {
    title: `${meal.name} - DailyMeal`,
    description: meal.memo || `${meal.sharerName}님이 공유한 ${meal.name}`,
    url: globalThis.window === undefined ? '' : globalThis.window.location.href,
    imageUrl: photos.length > 0 ? photos[0] : undefined,
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Deep Link 시도 (모바일에서만) */}
      {shareId && <AppDeepLink shareId={shareId} />}

      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 pt-safe">
        <div className="flex items-center justify-center max-w-2xl mx-auto mt-2">
          <h1 className="text-lg font-semibold text-gray-900">DailyMeal</h1>
        </div>
      </header>

      {/* 공유자 정보 배너 */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              {meal.sharerProfileImage ? (
                <Image
                  src={meal.sharerProfileImage}
                  alt={meal.sharerName}
                  width={48}
                  height={48}
                  className="rounded-full"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {meal.sharerName[0]}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{meal.sharerName}</span>님의 식사
                  기록
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Eye size={14} />
                  <span>{meal.viewCount}명이 확인했어요</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/login" className="flex-1">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  로그인하고 친구 추가
                </Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button className="w-full bg-white hover:bg-gray-50 text-blue-600 border border-blue-600">
                  회원가입
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 사진 캐러셀 */}
      {hasPhotos && (
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="aspect-square relative bg-gray-100 overflow-hidden">
            {photos.map((photoUrl, index) => {
              const getTransformClass = () => {
                if (index === currentPhotoIndex) return 'translate-x-0'
                if (index < currentPhotoIndex) return '-translate-x-full'
                return 'translate-x-full'
              }
              return (
                <div
                  key={`photo-${photoUrl}-${index}`}
                  className={`absolute inset-0 transition-transform duration-300 ease-in-out ${getTransformClass()}`}
                >
                  <Image
                    src={photoUrl}
                    alt={`${meal.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 672px"
                    unoptimized
                  />
                </div>
              )
            })}

            {/* 네비게이션 버튼 (2장 이상) */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                  {currentPhotoIndex + 1}/{photos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 정보 섹션 */}
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* 제목 & 공유 버튼 */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{meal.name}</h2>
              {meal.price && (
                <div className="text-base text-gray-600 mb-2">
                  참고 가격: ₩{meal.price.toLocaleString()}
                </div>
              )}
              {/* 식당 이름 & 날짜 */}
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
                <span>{meal.createdAt}</span>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-3"
              aria-label="공유하기"
            >
              <Share2 size={22} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* 별점 */}
        {meal.rating && meal.rating > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={`star-${meal.rating}-${i}`}
                size={24}
                className={`${i < meal.rating! ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
              />
            ))}
            <span className="ml-2 text-lg font-semibold text-gray-700">{meal.rating}/5</span>
          </div>
        )}

        {/* 메모 */}
        {meal.memo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{meal.memo}</p>
          </div>
        )}

        {/* CTA 버튼 (비로그인 시) */}
        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800 mb-3">
              🎉 이 맛집이 마음에 드시나요?
              <br />
              데일리밀에 가입하고 나만의 맛집 기록을 만들어보세요!
            </p>
            <Link href="/signup">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                무료로 시작하기
              </Button>
            </Link>
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
