// 인증 보호를 위한 유틸리티

import { tokenManager } from './api/client'

/**
 * 현재 사용자가 로그인되어 있는지 확인
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!tokenManager.get()
}

/**
 * 로그인 페이지로 리다이렉트하는 URL 생성
 * @param returnUrl - 로그인 후 돌아갈 URL (현재 페이지)
 */
export function getLoginUrl(returnUrl?: string): string {
  if (typeof window === 'undefined') return '/login'
  
  const url = returnUrl || window.location.pathname + window.location.search
  return `/login?returnUrl=${encodeURIComponent(url)}`
}

/**
 * 회원가입 페이지로 리다이렉트하는 URL 생성
 * @param returnUrl - 회원가입 후 돌아갈 URL (현재 페이지)
 */
export function getSignupUrl(returnUrl?: string): string {
  if (typeof window === 'undefined') return '/signup'
  
  const url = returnUrl || window.location.pathname + window.location.search
  return `/signup?returnUrl=${encodeURIComponent(url)}`
}

/**
 * 페이지 접근 시 인증 체크 (클라이언트 컴포넌트용)
 * @returns 로그인 여부
 */
export function requireAuth(): boolean {
  const authenticated = isAuthenticated()
  
  if (!authenticated && typeof window !== 'undefined') {
    // 로그인이 필요한 경우 로그인 페이지로 리다이렉트
    window.location.href = getLoginUrl()
  }
  
  return authenticated
}
