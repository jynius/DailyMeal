import { Star, MapPin, Clock, Share, Edit } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShareModal } from './share-modal'
import { EvaluateModal } from './evaluate-modal'
import { ROUTES } from '@/lib/constants'

interface MealCardProps {
  id: string
  name: string
  photo?: string
  photos?: string[]  // 여러 사진 지원
  location?: string
  rating?: number
  memo?: string
  createdAt: string
  price?: number
  onEvaluated?: () => void  // 평가 완료 후 콜백
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
  onEvaluated,
}: MealCardProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showEvaluateModal, setShowEvaluateModal] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // photos 배열 우선, 없으면 photo 사용
  const photoList = photos && photos.length > 0 ? photos : (photo ? [photo] : [])

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault() // Link 클릭 방지
    e.stopPropagation()
    setShowShareModal(true)
  }

  const handleEvaluate = (e: React.MouseEvent) => {
    e.preventDefault() // Link 클릭 방지
    e.stopPropagation()
    setShowEvaluateModal(true)
  }

  const shareData = {
    title: `${name} - DailyMeal`,
    description: memo || `${name} 식사 기록`,
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}${ROUTES.MEAL(id)}`,
    imageUrl: photoList[0]
  }

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentPhotoIndex(prev => prev === 0 ? photoList.length - 1 : prev - 1)
  }

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentPhotoIndex(prev => prev === photoList.length - 1 ? 0 : prev + 1)
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
              {photoList.map((photoUrl, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                    index === currentPhotoIndex ? 'translate-x-0' : index < currentPhotoIndex ? '-translate-x-full' : 'translate-x-full'
                  }`}
                >
                  <Image
                    src={photoUrl.startsWith('http') ? photoUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${photoUrl}`}
                    alt={`${name} ${index + 1}`}
                    fill
                    className="object-cover high-res-image"
                    priority={index === 0}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>

            {/* 네비게이션 버튼 (2장 이상일 때만) */}
            {photoList.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base flex-1 mr-2">{name}</h4>
          {rating && rating > 0 ? (
            <div className="flex items-center flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={`${
                    i < rating 
                      ? "text-yellow-400 fill-current" 
                      : "text-gray-300"
                  } sm:w-4 sm:h-4`} 
                />
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-400 flex-shrink-0">미평가</span>
          )}
        </div>
        
        {location && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        
        {price && (
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">₩{price.toLocaleString()}</span>
          </div>
        )}
        
        {memo && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {memo}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center">
            <Clock size={12} className="mr-1" />
            {createdAt}
          </div>
          <div className="flex items-center gap-2">
            {/* 평가하기 버튼 (미평가 시) */}
            {(!rating || rating === 0) && (
              <button
                onClick={handleEvaluate}
                className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-xs font-medium"
                title="평가하기"
              >
                <Edit size={12} />
                평가
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="공유하기"
            >
              <Share size={14} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </Link>

    {/* 공유 모달 */}
    <ShareModal
      isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      shareData={shareData}
      imageUrl={photo}
    />
    
    {/* 평가 모달 */}
    <EvaluateModal
      isOpen={showEvaluateModal}
      onClose={() => setShowEvaluateModal(false)}
      mealId={id}
      mealName={name}
      onSuccess={onEvaluated}
    />
    </>
  )
}