'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { APP_CONFIG } from '@/lib/constants'
import { authApi, tokenManager } from '@/lib/api/client'
import { connectFriend } from '@/lib/api/share'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useAlert } from '@/components/ui/alert'

interface AuthFormProps {
  initialMode?: 'login' | 'register'
  onSuccess?: () => void
}

export function AuthForm({ initialMode = 'login', onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const { showAlert } = useAlert()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleAuthSuccess = async (token: string, message: string) => {
    // 토큰 저장
    tokenManager.set(token)
    
    // 공유를 통한 친구 연결 처리
    const shareRef = typeof window !== 'undefined' ? sessionStorage.getItem('shareRef') : null
    
    if (shareRef) {
      try {
        const result = await connectFriend(shareRef)
        if (result.success) {
          toast.success('친구가 추가되었습니다! 🎉')
        }
      } catch (err) {
        console.error('Failed to connect friend:', err)
        // 친구 연결 실패해도 로그인은 성공
      } finally {
        // ref 제거
        sessionStorage.removeItem('shareRef')
      }
    }
    
    // 리다이렉트 로직:
    // 1. returnUrl 쿼리 파라미터 (미들웨어에서 설정, 최우선)
    // 2. document.referrer (이전 페이지)
    // 3. 기본값: / (홈)
    let redirectUrl = searchParams.get('returnUrl')
    
    console.log('🔍 Redirect Debug:', {
      returnUrl: searchParams.get('returnUrl'),
      referrer: typeof window !== 'undefined' ? document.referrer : 'N/A',
      searchParams: Array.from(searchParams.entries())
    })
    
    if (!redirectUrl && typeof window !== 'undefined' && document.referrer) {
      const referrer = new URL(document.referrer)
      const referrerPath = referrer.pathname
      
      // 같은 도메인이고, /login이나 /signup이 아닌 경우에만 referrer 사용
      if (referrer.origin === window.location.origin && 
          referrerPath !== '/login' && 
          referrerPath !== '/signup' &&
          referrerPath !== '/') {
        redirectUrl = referrerPath + referrer.search
      }
    }
    
    // 기본값
    if (!redirectUrl) {
      redirectUrl = '/'
    }
    
    console.log('✅ Final redirect URL:', redirectUrl)
    
    showAlert({
      title: '로그인 성공',
      message,
      confirmText: '확인',
      onConfirm: () => {
        // onSuccess는 무시하고 항상 redirectUrl 사용
        router.push(redirectUrl!)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 회원가입 시 약관 동의 확인
    if (mode === 'register' && (!agreements.terms || !agreements.privacy)) {
      setError('서비스 이용약관과 개인정보 처리방침에 동의해주세요.')
      setLoading(false)
      return
    }

    try {
      let result
      if (mode === 'login') {
        result = await authApi.login({
          email: formData.email,
          password: formData.password,
        })
      } else {
        result = await authApi.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        })
      }

      await handleAuthSuccess(result.token, result.message)
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || '인증에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError('')

    try {
      // 데모 계정으로 회원가입/로그인
      let result
      try {
        result = await authApi.login({
          email: APP_CONFIG.DEMO_USER.email,
          password: APP_CONFIG.DEMO_USER.password,
        })
      } catch {
        // 계정이 없으면 생성
        result = await authApi.register({
          email: APP_CONFIG.DEMO_USER.email,
          password: APP_CONFIG.DEMO_USER.password,
          name: APP_CONFIG.DEMO_USER.name,
        })
      }

      tokenManager.set(result.token)
      
      // 친구 연결 처리 및 알림
      await handleAuthSuccess(result.token, '데모 계정으로 로그인되었습니다!')
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || '데모 로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h2>
        <p className="text-gray-600">
          데일리밀에 오신 것을 환영합니다
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {mode === 'register' && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 약관 동의 */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreements.terms}
                  onChange={(e) => setAgreements(prev => ({ ...prev, terms: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  <span className="text-red-500">*</span> 
                  <a 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    서비스 이용약관
                  </a>
                  에 동의합니다
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={agreements.privacy}
                  onChange={(e) => setAgreements(prev => ({ ...prev, privacy: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="privacy" className="ml-2 text-sm text-gray-700">
                  <span className="text-red-500">*</span> 
                  <a 
                    href="/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    개인정보 처리방침
                  </a>
                  에 동의합니다
                </label>
              </div>
            </div>
          </>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </Button>
      </form>

      <div className="mt-4">
        <Button
          onClick={handleDemoLogin}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          데모 계정으로 체험하기
        </Button>
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>
    </div>
  )
}