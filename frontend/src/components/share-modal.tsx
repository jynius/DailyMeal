'use client'

import { useState } from 'react'
import { Share, Copy, Download, MessageCircle, Facebook, Twitter, Instagram } from 'lucide-react'
import { shareUtils, type ShareData } from '@/lib/share-utils'
import { useToast } from '@/components/ui/toast'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shareData: ShareData
  imageUrl?: string
}

export function ShareModal({ isOpen, onClose, shareData, imageUrl }: ShareModalProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const toast = useToast()

  if (!isOpen) return null

  const handleNativeShare = async () => {
    setLoading('native')
    const success = await shareUtils.nativeShare(shareData)
    if (success) {
      toast.success('공유했습니다!')
      onClose()
    } else {
      toast.error('공유에 실패했습니다')
    }
    setLoading(null)
  }

  const handleCopyLink = async () => {
    setLoading('copy')
    const success = await shareUtils.copyToClipboard(shareData.url)
    if (success) {
      toast.success('링크가 복사되었습니다!')
    } else {
      toast.error('복사에 실패했습니다')
    }
    setLoading(null)
  }

  const handleSocialShare = (platform: 'kakao' | 'facebook' | 'twitter') => {
    const url = shareUtils.getSocialShareUrl(platform, shareData)
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  const handleDownloadImage = async () => {
    if (!imageUrl) return
    
    setLoading('download')
    const filename = `dailymeal-${shareData.title}-${Date.now()}.jpg`
    const success = await shareUtils.downloadImage(imageUrl, filename)
    if (success) {
      toast.success('이미지가 다운로드되었습니다!')
    } else {
      toast.error('다운로드에 실패했습니다')
    }
    setLoading(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">공유하기</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* 공유 옵션들 */}
        <div className="space-y-4">
          {/* 네이티브 공유 (모바일) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              disabled={loading === 'native'}
              className="w-full flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <Share className="w-6 h-6 text-blue-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">기기 공유</div>
                <div className="text-sm text-gray-600">설치된 앱으로 공유</div>
              </div>
            </button>
          )}

          {/* 링크 복사 */}
          <button
            onClick={handleCopyLink}
            disabled={loading === 'copy'}
            className="w-full flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <Copy className="w-6 h-6 text-gray-500 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">링크 복사</div>
              <div className="text-sm text-gray-600">URL을 클립보드에 복사</div>
            </div>
          </button>

          {/* 소셜 미디어 */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleSocialShare('kakao')}
              className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">카카오톡</span>
            </button>

            <button
              onClick={() => handleSocialShare('facebook')}
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Facebook className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">페이스북</span>
            </button>

            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex flex-col items-center p-4 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <Twitter className="w-6 h-6 text-sky-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">트위터</span>
            </button>
          </div>

          {/* 이미지 다운로드 */}
          {imageUrl && (
            <button
              onClick={handleDownloadImage}
              disabled={loading === 'download'}
              className="w-full flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <Download className="w-6 h-6 text-green-500 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">이미지 저장</div>
                <div className="text-sm text-gray-600">사진을 기기에 저장</div>
              </div>
            </button>
          )}

          {/* 인스타그램 안내 */}
          <div className="flex items-center p-4 bg-pink-50 rounded-lg">
            <Instagram className="w-6 h-6 text-pink-500 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">인스타그램</div>
              <div className="text-sm text-gray-600">이미지를 저장 후 직접 업로드해주세요</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}