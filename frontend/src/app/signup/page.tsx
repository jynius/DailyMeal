'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { tokenManager } from '@/lib/api/client'

export default function SignupPage() {
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
