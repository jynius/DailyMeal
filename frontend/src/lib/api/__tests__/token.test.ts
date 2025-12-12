import { describe, it, expect, beforeEach } from 'vitest'
import { tokenManager } from '../token'

describe('Token Manager', () => {
  beforeEach(() => {
    localStorage.clear()
    // 쿠키 초기화
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })
  })

  describe('get', () => {
    it('localStorage에서 토큰 가져오기', () => {
      localStorage.setItem('token', 'test-token')
      expect(tokenManager.get()).toBe('test-token')
    })

    it('토큰이 없으면 null 반환', () => {
      expect(tokenManager.get()).toBeNull()
    })
  })

  describe('set', () => {
    it('localStorage에 토큰 저장', () => {
      tokenManager.set('new-token')
      expect(localStorage.getItem('token')).toBe('new-token')
    })

    it('쿠키에도 토큰 저장', () => {
      tokenManager.set('cookie-token')
      expect(document.cookie).toContain('token=cookie-token')
    })
  })

  describe('remove', () => {
    it('localStorage 토큰 제거', () => {
      localStorage.setItem('token', 'test-token')
      tokenManager.set('test-token')
      
      tokenManager.remove()
      
      expect(localStorage.getItem('token')).toBeNull()
    })
  })
})
