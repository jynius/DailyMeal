'use client'

import { AuthForm } from '@/components/auth/auth-form'

export default function LoginClient() {
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
