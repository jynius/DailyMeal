import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useKakaoMap } from '../use-kakao-map'

describe('useKakaoMap', () => {
  const originalEnv = process.env.NEXT_PUBLIC_KAKAO_API_KEY

  beforeEach(() => {
    // Clean up window.kakao
    delete (globalThis.window as { kakao?: unknown }).kakao
    // Clean up script tags
    document.head.querySelectorAll('script').forEach((script) => {
      if (script.src.includes('kakao')) {
        script.remove()
      }
    })
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_KAKAO_API_KEY = originalEnv
  })

  it('카카오 지도 API가 이미 로드되어 있으면 즉시 사용 가능', () => {
    ;(globalThis.window as { kakao?: unknown }).kakao = {
      maps: {
        load: vi.fn(),
      },
    }

    const { result } = renderHook(() => useKakaoMap())

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('API 키가 없으면 에러 상태 반환', () => {
    delete process.env.NEXT_PUBLIC_KAKAO_API_KEY

    const { result } = renderHook(() => useKakaoMap())

    expect(result.current.isLoaded).toBe(false)
    expect(result.current.error).toBe('API 키 없음')
  })

  it('더미 API 키일 때 에러 상태 반환', () => {
    process.env.NEXT_PUBLIC_KAKAO_API_KEY = 'your_kakao_map_api_key_here'

    const { result } = renderHook(() => useKakaoMap())

    expect(result.current.isLoaded).toBe(false)
    expect(result.current.error).toBe('API 키 없음')
  })

  it('API 키가 있으면 스크립트 태그 추가', () => {
    process.env.NEXT_PUBLIC_KAKAO_API_KEY = 'test-api-key'

    renderHook(() => useKakaoMap())

    const scripts = document.head.querySelectorAll('script')
    const kakaoScript = Array.from(scripts).find((s) =>
      s.src.includes('dapi.kakao.com')
    )

    expect(kakaoScript).toBeDefined()
    expect(kakaoScript?.src).toContain('test-api-key')
    expect(kakaoScript?.src).toContain('autoload=false')
  })

  it('스크립트 로드 성공 시 isLoaded=true', async () => {
    process.env.NEXT_PUBLIC_KAKAO_API_KEY = 'test-api-key'

    const { result } = renderHook(() => useKakaoMap())

    // Trigger script onload
    const scripts = document.head.querySelectorAll('script')
    const kakaoScript = Array.from(scripts).find((s) =>
      s.src.includes('dapi.kakao.com')
    ) as HTMLScriptElement

    // Set up kakao.maps before triggering load
    const mockLoad = vi.fn((callback) => callback())
    ;(globalThis.window as { kakao?: unknown }).kakao = {
      maps: {
        load: mockLoad,
      },
    }

    if (kakaoScript) {
      kakaoScript.dispatchEvent(new Event('load'))
    }

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(mockLoad).toHaveBeenCalled()
  })

  it('스크립트 로드 실패 시 에러 상태', async () => {
    process.env.NEXT_PUBLIC_KAKAO_API_KEY = 'test-api-key'

    const { result } = renderHook(() => useKakaoMap())

    const scripts = document.head.querySelectorAll('script')
    const kakaoScript = Array.from(scripts).find((s) =>
      s.src.includes('dapi.kakao.com')
    ) as HTMLScriptElement

    if (kakaoScript) {
      kakaoScript.dispatchEvent(new Event('error'))
    }

    await waitFor(() => {
      expect(result.current.error).toBe('카카오 지도 로드 실패')
    })

    expect(result.current.isLoaded).toBe(false)
  })

  it('언마운트 시 스크립트 태그 제거', () => {
    process.env.NEXT_PUBLIC_KAKAO_API_KEY = 'test-api-key'

    const { unmount } = renderHook(() => useKakaoMap())

    const scriptsBefore = document.head.querySelectorAll('script')
    const kakaoScriptBefore = Array.from(scriptsBefore).find((s) =>
      s.src.includes('dapi.kakao.com')
    )
    expect(kakaoScriptBefore).toBeDefined()

    unmount()

    const scriptsAfter = document.head.querySelectorAll('script')
    const kakaoScriptAfter = Array.from(scriptsAfter).find((s) =>
      s.src.includes('dapi.kakao.com')
    )
    expect(kakaoScriptAfter).toBeUndefined()
  })
})
