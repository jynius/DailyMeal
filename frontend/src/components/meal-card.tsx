import { Star, MapPin, Clock, Share } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShareModal } from './share-modal'
import { ROUTES } from '@/lib/constants'

interface MealCardProps {
  id: string
  name: string
  photo?: string
  location?: string
  rating: number
  memo?: string
  createdAt: string
  price?: number
}

export function MealCard({
  id,
  name,
  photo,
  location,
  rating,
  memo,
  createdAt,
  price,
}: MealCardProps) {
  const [showShareModal, setShowShareModal] = useState(false)

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault() // Link 클릭 방지
    e.stopPropagation()
    setShowShareModal(true)
  }

  const shareData = {
    title: `${name} - DailyMeal`,
    description: memo || `${name} 식사 기록`,
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}${ROUTES.MEAL(id)}`,
    imageUrl: photo
  }

  return (
    <>
      <Link href={`/meal/${id}`} className="block">
      <div className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      {/* Photo */}
      <div className="aspect-square relative bg-gray-100">
        {photo ? (
          <Image
            src={photo.startsWith('http') ? photo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${photo}`}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 truncate">{name}</h4>
          <div className="flex items-center ml-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={
                  i < rating 
                    ? "text-yellow-400 fill-current" 
                    : "text-gray-300"
                } 
              />
            ))}
          </div>
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
    </Link>

    {/* 공유 모달 */}
    <ShareModal
      isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      shareData={shareData}
      imageUrl={photo}
    />
    </>
  )
}