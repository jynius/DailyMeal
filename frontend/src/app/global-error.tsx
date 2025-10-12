'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 전역 에러 로깅
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            {/* 에러 코드 */}
            <div className="mb-8">
              <div className="text-6xl font-bold text-red-500 mb-2">500</div>
              <div className="text-2xl font-semibold text-gray-900 mb-4">
                심각한 오류가 발생했습니다
              </div>
              <p className="text-gray-600 mb-8">
                애플리케이션에 치명적인 오류가 발생했습니다.
                <br />
                페이지를 새로고침하거나 다시 시도해주세요.
              </p>
            </div>

            {/* 이모지 일러스트 */}
            <div className="text-8xl mb-8">💥</div>

            {/* 액션 버튼 */}
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                다시 시도
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                🏠 홈으로 가기
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                🔄 새로고침
              </button>
            </div>

            {/* 개발 모드에서만 에러 메시지 표시 */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  상세 오류 정보 (개발 모드)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto text-red-600">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
                {error.digest && (
                  <p className="mt-1 text-xs text-gray-500">
                    Error ID: {error.digest}
                  </p>
                )}
              </details>
            )}

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
      </body>
    </html>
  )
}
