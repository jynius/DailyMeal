import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiRequest } from '../client'
import { tokenManager } from '../token'
import { apiMonitor } from '../monitor'

// Mocks
vi.mock('../token', () => ({
  tokenManager: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('../monitor', () => ({
  apiMonitor: {
    startRequest: vi.fn(() => vi.fn()),
  },
}))

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  // Helper function to create mock response
  const createMockResponse = (data: any, options: { ok?: boolean; status?: number } = {}) => ({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response)

  describe('apiRequest', () => {
    it('토큰이 있으면 Authorization 헤더에 자동 첨부', async () => {
      const mockToken = 'test-token-123'
      vi.mocked(tokenManager.get).mockReturnValue(mockToken)
      
      const mockResponse = { data: 'test' }
      vi.mocked(fetch).mockResolvedValue(createMockResponse(mockResponse))

      await apiRequest('/test')

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      )
    })

    it('토큰이 없으면 Authorization 헤더 없이 요청', async () => {
      vi.mocked(tokenManager.get).mockReturnValue(null)
      
      vi.mocked(fetch).mockResolvedValue(createMockResponse({}))

      await apiRequest('/test')

      const fetchCall = vi.mocked(fetch).mock.calls[0]
      const headers = fetchCall[1]?.headers as Record<string, string>
      expect(headers?.['Authorization']).toBeUndefined()
    })

    it('FormData는 Content-Type 헤더 자동 설정 안 함', async () => {
      const formData = new FormData()
      formData.append('test', 'value')

      vi.mocked(fetch).mockResolvedValue(createMockResponse({}))

      await apiRequest('/upload', {
        method: 'POST',
        body: formData,
      })

      const fetchCall = vi.mocked(fetch).mock.calls[0]
      const headers = fetchCall[1]?.headers as Record<string, string>
      expect(headers?.['Content-Type']).toBeUndefined()
    })

    it('JSON 요청은 Content-Type: application/json', async () => {
      vi.mocked(fetch).mockResolvedValue(createMockResponse({}))

      await apiRequest('/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      })

      const fetchCall = vi.mocked(fetch).mock.calls[0]
      const headers = fetchCall[1]?.headers as Record<string, string>
      expect(headers?.['Content-Type']).toBe('application/json')
    })

    it('401 에러 시 토큰 제거', async () => {
      vi.mocked(fetch).mockResolvedValue(
        createMockResponse({ message: 'Unauthorized' }, { ok: false, status: 401 })
      )

      await expect(apiRequest('/test')).rejects.toThrow()
      expect(tokenManager.remove).toHaveBeenCalled()
    })

    it('네트워크 에러 처리', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      await expect(apiRequest('/test')).rejects.toThrow('Network error')
    })

    it('성공 응답 데이터 반환', async () => {
      const mockData = { id: 1, name: 'Test' }
      vi.mocked(fetch).mockResolvedValue(createMockResponse(mockData))

      const result = await apiRequest('/test')
      expect(result).toEqual(mockData)
    })

    it('API 모니터링 호출', async () => {
      const mockEndMonitoring = vi.fn()
      vi.mocked(apiMonitor.startRequest).mockReturnValue(mockEndMonitoring)

      vi.mocked(fetch).mockResolvedValue(createMockResponse({}))

      await apiRequest('/test', { method: 'POST' })

      expect(apiMonitor.startRequest).toHaveBeenCalledWith('/test', 'POST')
      expect(mockEndMonitoring).toHaveBeenCalled()
    })
  })
})
