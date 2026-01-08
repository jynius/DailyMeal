'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { tokenManager } from '@/lib/api'

export default function LoginClient() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // 이미 로그인된 경우 홈으로 리다이렉트
    if (tokenManager.get()) {
      router.replace('/')
    } else {
      setIsChecking(false)
    }
  }, [router])

  // 리다이렉트 중에는 아무것도 보여주지 않음 (깜빡임 방지)
  if (isChecking) {
    return null
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
          DailyMeal
        </h1>
        <p className="text-gray-600">로그인하고 맛있는 순간을 기록하세요</p>
      </div>
      
      <AuthForm initialMode="login" />
    </div>
  )
}
