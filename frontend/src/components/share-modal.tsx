'use client'

import { useState, useEffect } from 'react'
import { Share, Copy, Download, MessageCircle } from 'lucide-react'
import { shareUtils, type ShareData } from '@/lib/share-utils'
import { kakaoShare } from '@/lib/kakao-share'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'

const log = createLogger('ShareModal')

interface ShareModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly shareData: ShareData
  readonly imageUrl?: string
}

export function ShareModal({ isOpen, onClose, shareData, imageUrl }: Readonly<ShareModalProps>) {
  const [loading, setLoading] = useState<string | null>(null)
  const [kakaoReady, setKakaoReady] = useState(false)
  const [kakaoInitError, setKakaoInitError] = useState<string | null>(null)
  const [kakaoTalkInstalled, setKakaoTalkInstalled] = useState(true) // 기본 true (비활성화 안 함)
  const toast = useToast()

  useEffect(() => {
    if (!isOpen) return

    // 카카오 SDK 초기화 (Promise 방식)
    log.info('🔄 Initializing Kakao SDK...')
    setKakaoInitError(null)

    kakaoShare
      .init()
      .then(() => {
        log.info('✅ Kakao SDK ready!')
        setKakaoReady(true)

        // 🔍 카카오톡 설치 여부 확인
        const isInstalled = kakaoShare.isKakaoTalkInstalled()
        setKakaoTalkInstalled(isInstalled)

        if (!isInstalled) {
          log.warn('⚠️ KakaoTalk app not installed')
        }
      })
      .catch((error) => {
        const errorMsg = error.message || '알 수 없는 오류'
        log.error('❌ Kakao SDK 초기화 실패:', errorMsg)
        setKakaoReady(false)
        setKakaoInitError(errorMsg)
      })
  }, [isOpen])

  if (!isOpen) return null

  const getKakaoButtonTitle = (): string => {
    if (!kakaoTalkInstalled) {
      return '카카오톡 앱이 설치되지 않았습니다'
    }
    if (kakaoReady) {
      return '카카오톡으로 공유'
    }
    if (kakaoInitError) {
      return `SDK 오류: ${kakaoInitError}`
    }
    return 'SDK 로딩 중...'
  }

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

  const handleKakaoShare = async () => {
    setLoading('kakao')

    log.info('🔄 Attempting Kakao share...', {
      kakaoReady,
      hasImage: !!shareData.imageUrl,
      hasUrl: !!shareData.url,
      kakaoInitError,
    })

    // URL이 없으면 에러
    if (!shareData.url) {
      log.error('❌ No URL provided for Kakao share')
      toast.error('공유 링크가 생성되지 않았습니다.\n잠시 후 다시 시도해주세요.')
      setLoading(null)
      return
    }

    // 이미지가 없으면 경고
    if (!shareData.imageUrl) {
      log.warn('⚠️ No image URL provided for Kakao share')
      toast.warning('공유할 이미지가 없습니다.\n텍스트만 공유됩니다.')
    }

    // SDK 사용 가능하면 SDK로 공유
    if (kakaoReady) {
      await handleKakaoSDKShare()
    } else {
      await handleKakaoFallback()
    }

    setLoading(null)
  }

  const handleKakaoSDKShare = async () => {
    log.info('✅ Using Kakao SDK for sharing', { url: shareData.url })
    const success = await shareUtils.shareKakao(shareData)
    if (success) {
      toast.success('카카오톡으로 공유했습니다!')
      onClose()
    } else {
      log.error('❌ Kakao SDK share failed')
      toast.error('카카오톡 공유에 실패했습니다.\n다시 시도해주세요.')
    }
  }

  const handleKakaoFallback = async () => {
    log.warn('⚠️ Kakao SDK not ready, falling back to clipboard', {
      error: kakaoInitError,
    })

    const errorMessage = kakaoInitError
      ? `카카오 SDK 오류: ${kakaoInitError}\n링크를 복사합니다.`
      : '카카오 SDK를 불러올 수 없습니다.\n링크를 복사합니다.'

    toast.warning(errorMessage)

    const success = await shareUtils.copyToClipboard(shareData.url)
    if (success) {
      toast.info('링크가 복사되었습니다.\n카카오톡에 직접 붙여넣기 해주세요 📋')
    } else {
      toast.error('링크 복사에 실패했습니다')
    }
  }

  const handleSocialShare = async (platform: 'kakao' | 'facebook' | 'twitter') => {
    if (platform === 'kakao') {
      await handleKakaoShare()
    } else {
      const url = shareUtils.getSocialShareUrl(platform, shareData)
      if (url) {
        window.open(url, '_blank', 'width=600,height=400')
      }
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
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
              disabled={loading === 'kakao' || !kakaoReady || !kakaoTalkInstalled}
              className={`flex flex-col items-center p-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                kakaoReady && kakaoTalkInstalled
                  ? 'bg-yellow-50 hover:bg-yellow-100'
                  : 'bg-gray-100'
              }`}
              title={getKakaoButtonTitle()}
            >
              {loading === 'kakao' ? (
                <div className="w-6 h-6 mb-2 border-2 border-yellow-300 border-t-yellow-600 rounded-full animate-spin" />
              ) : (
                <MessageCircle
                  className={`w-6 h-6 mb-2 ${kakaoReady && kakaoTalkInstalled ? 'text-yellow-600' : 'text-gray-400'}`}
                />
              )}
              <span
                className={`text-sm font-medium ${kakaoReady && kakaoTalkInstalled ? 'text-gray-900' : 'text-gray-500'}`}
              >
                카카오톡
                {!kakaoTalkInstalled && <span className="text-xs block text-red-500">미설치</span>}
                {!kakaoReady && kakaoTalkInstalled && (
                  <span className="text-xs block">SDK 오류</span>
                )}
              </span>
            </button>

            <button
              onClick={() => handleSocialShare('facebook')}
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-6 h-6 mb-2 text-2xl">📘</div>
              <span className="text-sm font-medium text-gray-900">페이스북</span>
            </button>

            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex flex-col items-center p-4 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <div className="w-6 h-6 mb-2 text-2xl">🐦</div>
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
            <div className="text-2xl mr-3">📷</div>
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
