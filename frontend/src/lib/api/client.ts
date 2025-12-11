/**
 * 데일리밀 API 클라이언트
 * 
 * 저수준 HTTP 요청 헬퍼
 * - apiRequest: 공통 HTTP 요청 처리
 * - 토큰 인증 자동 처리
 * - 에러 처리 및 성능 모니터링
 */

import { APP_CONFIG } from '@/lib/constants'
import { apiMonitor } from './monitor'
import { tokenManager } from './token'

const API_BASE_URL = APP_CONFIG.API_BASE_URL

// API 요청 헬퍼
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenManager.get()
  const isFormData = options.body instanceof FormData
  
  const headers: Record<string, string> = {}
  
  // 파일 업로드가 아닌 경우만 Content-Type 설정
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 성능 모니터링 시작
  const method = options.method || 'GET'
  const endMonitoring = apiMonitor.startRequest(endpoint, method)

  // 타임아웃 설정
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.API_TIMEOUT)

  try {
    console.log(`🌐 API Request: ${method} ${API_BASE_URL}${endpoint}`)
    console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'None')
    console.log('📋 Headers:', headers)
    if (isFormData) {
      console.log('📦 Body: FormData')
    } else if (options.body) {
      console.log('📦 Body:', options.body)
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    })

    clearTimeout(timeoutId) // 성공시 타임아웃 제거

    console.log(`📡 Response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      // 인증 오류 처리 (401, 403)
      // 단, 로그인/회원가입 API는 예외 (에러 메시지만 전달)
      const isAuthEndpoint = endpoint === '/auth/login' || endpoint === '/auth/register'
      if ((response.status === 401 || response.status === 403) && !isAuthEndpoint) {
        // 토큰 제거
        tokenManager.remove()
        
        // 로그인 페이지로 리다이렉트 (클라이언트 사이드에서만)
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        
        const errorMsg = '인증이 필요합니다. 로그인 페이지로 이동합니다.'
        endMonitoring(response.status, errorMsg)
        throw new Error(errorMsg)
      }
      
      const error = await response.json().catch(() => ({ 
        error: '서버 오류가 발생했습니다' 
      }))
      console.error('❌ API Error:', error)
      
      const errorMsg = error.error || error.message || '요청 실패'
      endMonitoring(response.status, errorMsg)
      throw new Error(errorMsg)
    }

    // 응답 본문 확인
    const text = await response.text()
    const data = text ? JSON.parse(text) : null
    console.log('✅ API Success:', data)
    
    // 성공 모니터링
    endMonitoring(response.status)
    
    return data
  } catch (error: unknown) {
    const err = error as Error
    clearTimeout(timeoutId) // 오류시 타임아웃 제거
    
    if (err.name === 'AbortError') {
      endMonitoring(0, '요청 시간 초과')
      throw new Error('요청이 시간 초과되었습니다')
    }
    
    if (('code' in err && err.code === 'ECONNREFUSED') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
      endMonitoring(0, '연결 실패')
      throw new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    }
    
    // 이미 모니터링된 에러가 아니면 기록
    if (!err.message?.includes('인증이 필요') && !err.message?.includes('요청 실패')) {
      endMonitoring(0, err.message)
    }
    
    throw err
  }
}
