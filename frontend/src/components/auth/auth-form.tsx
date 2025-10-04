'use client'

import { useState } from 'react'
import { authApi, tokenManager } from '@/lib/api/client'
import { Button } from '@/components/ui/button'

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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

      // 토큰 저장
      tokenManager.set(result.token)
      
      alert(result.message)
      onSuccess?.()
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
          email: 'demo@dailymeal.com',
          password: 'demo123',
        })
      } catch {
        // 계정이 없으면 생성
        result = await authApi.register({
          email: 'demo@dailymeal.com',
          password: 'demo123',
          name: '데모 사용자',
        })
      }

      tokenManager.set(result.token)
      alert('데모 계정으로 로그인되었습니다!')
      onSuccess?.()
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