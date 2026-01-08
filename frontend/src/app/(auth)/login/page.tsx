import { Suspense } from 'react'
import Spinner from '@/components/ui/spinner'
import LoginClient from './login-client'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Spinner container="page" size="lg" text="로딩 중..." />
    }>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <LoginClient />
      </div>
    </Suspense>
  )
}
