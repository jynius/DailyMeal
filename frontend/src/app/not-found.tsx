'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 에러 코드 */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-blue-500 mb-2">404</div>
          <div className="text-2xl font-semibold text-gray-900 mb-4">
            페이지를 찾을 수 없습니다
          </div>
          <p className="text-gray-600 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        {/* 이모지 일러스트 */}
        <div className="text-8xl mb-8">🔍</div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            ← 이전 페이지로
          </button>
          
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            🏠 홈으로 가기
          </Link>
        </div>

        {/* 도움말 링크 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">도움이 필요하신가요?</p>
          <a 
            href="mailto:support@dailymeal.life"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            support@dailymeal.life
          </a>
        </div>
      </div>
    </div>
  )
}
