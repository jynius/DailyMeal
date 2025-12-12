import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { usePatternAnalysis, useSpendingAnalysis, useRecommendations } from '../use-ai'
import { aiApi, AnalysisPeriod, SpendingPeriod, RecommendationType } from '@/lib/api'

// Mock aiApi
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api')
  return {
    ...actual,
    aiApi: {
      getPatternAnalysis: vi.fn(),
      getSpendingAnalysis: vi.fn(),
      getRecommendations: vi.fn(),
    },
  }
})

// Wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAI Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePatternAnalysis', () => {
    it('기본 기간(MONTH)으로 패턴 분석 조회', async () => {
      const mockData = {
        period: AnalysisPeriod.MONTH,
        totalMeals: 20,
        patterns: [],
      }
      vi.mocked(aiApi.getPatternAnalysis).mockResolvedValue(mockData)

      const { result } = renderHook(() => usePatternAnalysis(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(aiApi.getPatternAnalysis).toHaveBeenCalledWith(AnalysisPeriod.MONTH)
      expect(result.current.data).toEqual(mockData)
    })

    it('커스텀 기간(WEEK)으로 조회', async () => {
      const mockData = {
        period: AnalysisPeriod.WEEK,
        totalMeals: 7,
        patterns: [],
      }
      vi.mocked(aiApi.getPatternAnalysis).mockResolvedValue(mockData)

      const { result } = renderHook(() => usePatternAnalysis(AnalysisPeriod.WEEK), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(aiApi.getPatternAnalysis).toHaveBeenCalledWith(AnalysisPeriod.WEEK)
    })

    it('enabled=false 시 쿼리 비활성화', () => {
      const { result } = renderHook(() => usePatternAnalysis(AnalysisPeriod.MONTH, false), {
        wrapper: createWrapper(),
      })

      expect(result.current.isFetching).toBe(false)
      expect(aiApi.getPatternAnalysis).not.toHaveBeenCalled()
    })

    it('에러 처리', async () => {
      const error = new Error('Analysis failed')
      vi.mocked(aiApi.getPatternAnalysis).mockRejectedValue(error)

      const { result } = renderHook(() => usePatternAnalysis(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('useSpendingAnalysis', () => {
    it('지출 분석 조회 성공', async () => {
      const mockData = {
        period: SpendingPeriod.MONTH,
        totalSpending: 150000,
        categories: [],
      }
      vi.mocked(aiApi.getSpendingAnalysis).mockResolvedValue(mockData)

      const { result } = renderHook(() => useSpendingAnalysis(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(aiApi.getSpendingAnalysis).toHaveBeenCalledWith(SpendingPeriod.MONTH)
      expect(result.current.data).toEqual(mockData)
    })

    it('분기별 지출 분석', async () => {
      const mockData = {
        period: SpendingPeriod.QUARTER,
        totalSpending: 450000,
        categories: [],
      }
      vi.mocked(aiApi.getSpendingAnalysis).mockResolvedValue(mockData)

      const { result } = renderHook(() => useSpendingAnalysis(SpendingPeriod.QUARTER), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(aiApi.getSpendingAnalysis).toHaveBeenCalledWith(SpendingPeriod.QUARTER)
    })
  })

  describe('useRecommendations', () => {
    it('소셜 추천 조회', async () => {
      const mockData = {
        type: RecommendationType.SOCIAL,
        recommendations: [],
        count: 0,
        generatedAt: new Date().toISOString(),
      }
      vi.mocked(aiApi.getRecommendations).mockResolvedValue(mockData)

      const { result } = renderHook(() => useRecommendations(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(aiApi.getRecommendations).toHaveBeenCalledWith(
        RecommendationType.SOCIAL,
        undefined
      )
      expect(result.current.data).toEqual(mockData)
    })

    it('필터와 함께 추천 조회', async () => {
      const filters = {
        maxPrice: 20000,
        minRating: 4.0,
        limit: 10,
      }
      const mockData = {
        type: RecommendationType.POPULAR,
        recommendations: [],
        count: 0,
        generatedAt: new Date().toISOString(),
      }
      vi.mocked(aiApi.getRecommendations).mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useRecommendations(RecommendationType.POPULAR, filters),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(aiApi.getRecommendations).toHaveBeenCalledWith(
        RecommendationType.POPULAR,
        filters
      )
    })

    it('협업 필터링 추천', async () => {
      const mockData = {
        type: RecommendationType.COLLABORATIVE,
        recommendations: [],
        count: 0,
        generatedAt: new Date().toISOString(),
      }
      vi.mocked(aiApi.getRecommendations).mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useRecommendations(RecommendationType.COLLABORATIVE),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(aiApi.getRecommendations).toHaveBeenCalledWith(
        RecommendationType.COLLABORATIVE,
        undefined
      )
    })
  })
})
