/**
 * 인증 API
 * 
 * 로그인, 회원가입, 비밀번호 재설정 등 인증 관련 API
 */

import { apiRequest } from './client'
import type { User } from '@/types'

export const authApi = {
  /**
   * 회원가입
   */
  register: async (data: { email: string; password: string; name: string }) => {
    return apiRequest<{ user: User; token: string; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 로그인
   */
  login: async (data: { email: string; password: string }) => {
    return apiRequest<{ user: User; token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 아이디 찾기 (이름으로 이메일 조회)
   */
  findId: async (name: string) => {
    return apiRequest<{ email: string }>('/users/find-id', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  /**
   * 비밀번호 재설정
   */
  resetPassword: async (data: { token: string; password: string }) => {
    return apiRequest<{ message: string }>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 비밀번호 재설정 이메일 요청
   */
  requestPasswordReset: async (email: string) => {
    return apiRequest<{ message: string }>('/users/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },
}
