'use client'

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { tokenManager } from '@/lib/api/client'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

function SignupContent() {
  const router = useRouter()

  useEffect(() => {
    // 이미 로그인된 경우 홈으로 리다이렉트
    if (tokenManager.get()) {
      router.replace('/')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            DailyMeal
          </h1>
          <p className="text-gray-600">가입하고 맛있은 순간을 공유하세요</p>
        </div>
        
        <AuthForm initialMode="register" />
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
