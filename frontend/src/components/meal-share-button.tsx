'use client'

import { useState } from 'react'
import { Share } from 'lucide-react'
import { ShareModal } from '@/components/share-modal'
import { createShare } from '@/lib/api/share'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

const log = logger.getLogger('MealShareButton')

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
  readonly meal: MealData
}

export function MealShareButton({ meal }: Readonly<MealShareButtonProps>) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [isCreatingShare, setIsCreatingShare] = useState(false)

  const handleShare = async () => {
    setIsCreatingShare(true)
    try {
      // 공유 링크 생성 (공유 전용 shareId 생성)
      const result = await createShare(meal.id)
      
      // localhost를 실제 IP로 변환 (WebView 환경)
      const finalShareUrl = result.url.replace('http://localhost:3000', 'http://192.170.1.58:3000')
      
      setShareUrl(finalShareUrl)

      // 링크 복사 시도
      try {
        await navigator.clipboard.writeText(finalShareUrl)
        toast.success('공유 링크가 복사되었습니다! 📋')
      } catch (clipboardError) {
        log.warn('Clipboard API not available', clipboardError)
      }

      // ShareModal 열기
      setShowShareModal(true)
    } catch (error) {
      log.error('Failed to create share link', error)
      toast.error('공유 링크 생성에 실패했습니다.')
    } finally {
      setIsCreatingShare(false)
    }
  }

  const shareData = {
    title: `${meal.user.name}님의 ${meal.title} - DailyMeal`,
    description: meal.description,
    url: shareUrl,
    imageUrl: meal.imageUrl
  }

  return (
    <>
      <div className="mt-6 flex justify-center">
        <button 
          onClick={handleShare}
          disabled={isCreatingShare}
          className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share size={20} />
          <span>{isCreatingShare ? '생성 중...' : '공유하기'}</span>
        </button>
      </div>

      {shareUrl && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareData={shareData}
          imageUrl={meal.imageUrl}
        />
      )}
    </>
  )
}