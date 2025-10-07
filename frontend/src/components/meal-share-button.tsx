'use client'

import { useState } from 'react'
import { Share } from 'lucide-react'
import { ShareModal } from '@/components/share-modal'

interface MealData {
  id: string
  title: string
  description: string
  imageUrl?: string
  user: {
    name: string
  }
}

interface MealShareButtonProps {
  meal: MealData
}

export function MealShareButton({ meal }: MealShareButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false)

  const shareData = {
    title: `${meal.user.name}님의 ${meal.title} - DailyMeal`,
    description: meal.description,
    url: typeof window !== 'undefined' ? window.location.href : '',
    imageUrl: meal.imageUrl
  }

  return (
    <>
      <div className="mt-6 flex justify-center">
        <button 
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Share size={20} />
          <span>공유하기</span>
        </button>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={shareData}
        imageUrl={meal.imageUrl}
      />
    </>
  )
}