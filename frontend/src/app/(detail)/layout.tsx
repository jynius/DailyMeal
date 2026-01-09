'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const ROUTE_TITLES: Record<string, string> = {
  '/add': '식사 등록',
  '/meal': '식사 기록',
  '/restaurant': '맛집',
}

const DetailLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const router = useRouter()

  // 현재 경로에 맞는 타이틀 찾기
  const getTitle = () => {
    for (const [route, title] of Object.entries(ROUTE_TITLES)) {
      if (pathname.startsWith(route)) return title
    }
    return '상세'
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      {/* 공통 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="ml-2 text-lg font-semibold text-gray-900">{getTitle()}</h1>
        </div>
      </div>

      <main className="flex-1 w-full">{children}</main>
    </div>
  )
}

export default DetailLayout
