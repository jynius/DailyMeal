'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'

interface ErrorProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // 에러 발생
  }, [error])

  // 에러 타입 판단
  const getErrorInfo = () => {
    const message = error.message.toLowerCase()

    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        code: '401',
        title: '인증이 필요합니다',
        description: '로그인이 필요한 서비스입니다.',
        emoji: '🔐',
        action: 'login',
      }
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return {
        code: '403',
        title: '접근 권한이 없습니다',
        description: '이 페이지에 접근할 권한이 없습니다.',
        emoji: '🚫',
        action: 'back',
      }
    }

    if (message.includes('not found') || message.includes('404')) {
      return {
        code: '404',
        title: '페이지를 찾을 수 없습니다',
        description: '요청하신 페이지가 존재하지 않습니다.',
        emoji: '🔍',
        action: 'home',
      }
    }

    // 기본 500 에러
    return {
      code: '500',
      title: '서버 오류가 발생했습니다',
      description: '일시적인 오류입니다. 잠시 후 다시 시도해주세요.',
      emoji: '⚠️',
      action: 'retry',
    }
  }

  const errorInfo = getErrorInfo()

  const handleAction = () => {
    switch (errorInfo.action) {
      case 'login':
        router.push('/login')
        break
      case 'home':
        router.push('/')
        break
      case 'back':
        router.back()
        break
      case 'retry':
        reset()
        break
    }
  }

  const getActionButtonText = () => {
    switch (errorInfo.action) {
      case 'login':
        return '로그인하기'
      case 'home':
        return '홈으로 가기'
      case 'back':
        return '이전 페이지로'
      case 'retry':
        return '다시 시도'
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 에러 코드 */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-red-500 mb-2">{errorInfo.code}</div>
          <div className="text-2xl font-semibold text-gray-900 mb-4">{errorInfo.title}</div>
          <p className="text-gray-600 mb-4">{errorInfo.description}</p>

          {/* Debug 모드 또는 ErrorPage 모듈이 DEBUG 이상일 때 에러 메시지 표시 */}
          {logger.shouldShowErrorDetails('ErrorPage') && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                상세 오류 정보 (Debug 모드)
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto text-red-600">
                {error.message}
              </pre>
              {error.digest && (
                <p className="mt-1 text-xs text-gray-500">Error ID: {error.digest}</p>
              )}
            </details>
          )}
        </div>

        {/* 이모지 일러스트 */}
        <div className="text-8xl mb-8">{errorInfo.emoji}</div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleAction}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            {getActionButtonText()}
          </button>

          {errorInfo.action !== 'back' && (
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              ← 이전 페이지로
            </button>
          )}

          {errorInfo.action !== 'home' && (
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              🏠 홈으로 가기
            </button>
          )}
        </div>

        {/* 도움말 링크 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">문제가 지속되나요?</p>
          <a
            href="mailto:support@dailymeal.life"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            support@dailymeal.life로 문의하기
          </a>
        </div>
      </div>
    </div>
  )
}
