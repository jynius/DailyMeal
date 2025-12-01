// frontend/src/lib/api/ai.ts

import { apiRequest } from './client'

// ============================================
// Types - Backend DTOs와 동일한 구조
// ============================================

// Pattern Analysis
export enum AnalysisPeriod {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export interface TimeDistribution {
  breakfast: number  // 0-100%
  lunch: number
  dinner: number
  lateNight: number
}

export interface WeekdayPattern {
  weekday: number
  count: number
}

export interface FoodCategory {
  category: 'home' | 'delivery' | 'restaurant'
  count: number
  percentage: number
}

export interface DiningMode {
  alone: number
  withFriends: number
}

export interface PatternAnalysisResponse {
  period: AnalysisPeriod
  totalMeals: number
  timeDistribution: TimeDistribution
  weekdayPattern: WeekdayPattern[]
  preferredCategories: FoodCategory[]
  diningMode: DiningMode
}

// Spending Analysis
export enum SpendingPeriod {
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export interface MonthlySpending {
  month: string  // YYYY-MM
  total: number
  average: number
  count: number
}

export interface ValueForMoneyRestaurant {
  restaurantName: string
  averageRating: number
  averagePrice: number
  visitCount: number
}

export interface SpendingAlert {
  type: 'budget_exceeded' | 'unusual_spending' | 'high_frequency'
  severity: 'info' | 'warning' | 'critical'
  message: string
}

export interface SpendingTrend {
  direction: 'increasing' | 'decreasing' | 'stable'
  percentageChange: number
  message: string
}

export interface SpendingAnalysisResponse {
  period: SpendingPeriod
  totalSpending: number
  averagePerMeal: number
  monthlyTrend: MonthlySpending[]
  valueForMoney: ValueForMoneyRestaurant[]
  alerts: SpendingAlert[]
  trend: SpendingTrend
}

// Recommendations
export enum RecommendationType {
  SOCIAL = 'social',
  POPULAR = 'popular',
  COLLABORATIVE = 'collaborative',
}

export interface FriendWhoLiked {
  friendId: string
  friendName: string
}

export interface RecommendationItem {
  restaurantName: string
  category?: 'home' | 'delivery' | 'restaurant'
  address?: string
  latitude?: number
  longitude?: number
  distance?: number
  rating?: number
  averagePrice?: number
  visitCount?: number
  likedByFriends?: FriendWhoLiked[]
  visited: boolean
}

export interface RecommendationResponse {
  type: RecommendationType
  recommendations: RecommendationItem[]
  generatedAt: string
}

export interface RecommendationFilters {
  maxDistance?: number
  maxPrice?: number
  minRating?: number
  excludeVisited?: boolean
}

// ============================================
// API Functions
// ============================================

export const aiApi = {
  /**
   * 식사 패턴 분석
   * @param period - 분석 기간 (week, month, quarter, year)
   */
  getPatternAnalysis: async (
    period: AnalysisPeriod = AnalysisPeriod.MONTH
  ): Promise<PatternAnalysisResponse> => {
    return apiRequest<PatternAnalysisResponse>(`/ai/analysis/pattern?period=${period}`)
  },

  /**
   * 지출 분석
   * @param period - 분석 기간 (month, quarter, year)
   */
  getSpendingAnalysis: async (
    period: SpendingPeriod = SpendingPeriod.MONTH
  ): Promise<SpendingAnalysisResponse> => {
    return apiRequest<SpendingAnalysisResponse>(`/ai/analysis/spending?period=${period}`)
  },

  /**
   * 맛집 추천
   * @param type - 추천 타입 (social, popular, collaborative)
   * @param filters - 필터 옵션
   */
  getRecommendations: async (
    type: RecommendationType = RecommendationType.SOCIAL,
    filters?: RecommendationFilters
  ): Promise<RecommendationResponse> => {
    const params = new URLSearchParams({ type })
    
    if (filters?.maxDistance) {
      params.append('maxDistance', filters.maxDistance.toString())
    }
    if (filters?.maxPrice) {
      params.append('maxPrice', filters.maxPrice.toString())
    }
    if (filters?.minRating) {
      params.append('minRating', filters.minRating.toString())
    }
    if (filters?.excludeVisited !== undefined) {
      params.append('excludeVisited', filters.excludeVisited.toString())
    }

    return apiRequest<RecommendationResponse>(`/ai/recommendations?${params.toString()}`)
  },
}
