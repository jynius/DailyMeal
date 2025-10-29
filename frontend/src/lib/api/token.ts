/**
 * 토큰 관리 유틸리티
 * 
 * JWT 토큰을 localStorage와 쿠키에 동시 저장/관리
 * - localStorage: 클라이언트 사이드에서 사용
 * - 쿠키: 미들웨어에서 SSR 시 사용
 */
export const tokenManager = {
  /**
   * 토큰 가져오기
   */
  get: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },
  
  /**
   * 토큰 저장 (localStorage + 쿠키)
   */
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      // localStorage에 저장
      localStorage.setItem('token', token)
      
      // 쿠키에도 저장 (미들웨어에서 사용)
      // HTTPS에서는 Secure 플래그 필요
      const isSecure = window.location.protocol === 'https:'
      const secureFlag = isSecure ? '; Secure' : ''
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`
    }
  },
  
  /**
   * 토큰 제거 (로그아웃)
   */
  remove: () => {
    if (typeof window !== 'undefined') {
      // localStorage에서 제거
      localStorage.removeItem('token')
      
      // 쿠키에서도 제거
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }
}
