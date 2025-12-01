// frontend/src/hooks/use-ai.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import {
  aiApi,
  AnalysisPeriod,
  SpendingPeriod,
  RecommendationType,
  type RecommendationFilters,
  type PatternAnalysisResponse,
  type SpendingAnalysisResponse,
  type RecommendationResponse,
} from '@/lib/api'

/**
 * 식사 패턴 분석 훅
 * @param period - 분석 기간 (week, month, quarter, year)
 * @param enabled - 쿼리 활성화 여부 (기본: true)
 */
export function usePatternAnalysis(
  period: AnalysisPeriod = AnalysisPeriod.MONTH,
  enabled = true
) {
  return useQuery<PatternAnalysisResponse>({
    queryKey: ['ai', 'pattern', period],
    queryFn: () => aiApi.getPatternAnalysis(period),
    enabled,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (cacheTime 대체)
  })
}

/**
 * 지출 분석 훅
 * @param period - 분석 기간 (month, quarter, year)
 * @param enabled - 쿼리 활성화 여부 (기본: true)
 */
export function useSpendingAnalysis(
  period: SpendingPeriod = SpendingPeriod.MONTH,
  enabled = true
) {
  return useQuery<SpendingAnalysisResponse>({
    queryKey: ['ai', 'spending', period],
    queryFn: () => aiApi.getSpendingAnalysis(period),
    enabled,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  })
}

/**
 * 맛집 추천 훅
 * @param type - 추천 타입 (social, popular, collaborative)
 * @param filters - 필터 옵션
 * @param enabled - 쿼리 활성화 여부 (기본: true)
 */
export function useRecommendations(
  type: RecommendationType = RecommendationType.SOCIAL,
  filters?: RecommendationFilters,
  enabled = true
) {
  return useQuery<RecommendationResponse>({
    queryKey: ['ai', 'recommendations', type, filters],
    queryFn: () => aiApi.getRecommendations(type, filters),
    enabled,
    staleTime: 3 * 60 * 1000, // 3분 (추천은 더 자주 갱신)
    gcTime: 5 * 60 * 1000, // 5분
  })
}
