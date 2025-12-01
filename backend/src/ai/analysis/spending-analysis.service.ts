import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MealRecord } from '../../entities/meal-record.entity'
import {
  SpendingPeriod,
  SpendingAnalysisResponseDto,
  MonthlySpending,
  ValueForMoneyRestaurant,
  SpendingAlert,
  SpendingTrend,
} from '../dto/spending-analysis.dto'

@Injectable()
export class SpendingAnalysisService {
  private readonly logger = new Logger(SpendingAnalysisService.name)

  constructor(
    @InjectRepository(MealRecord)
    private readonly mealRecordRepository: Repository<MealRecord>
  ) {}

  async analyzeSpending(
    userId: string,
    period: SpendingPeriod = SpendingPeriod.MONTH,
    options: {
      alerts?: boolean
      trend?: boolean
      rankBy?: 'valueForMoney' | 'total'
    } = {}
  ): Promise<SpendingAnalysisResponseDto> {
    this.logger.log(`Analyzing spending for user ${userId}, period: ${period}`)

    const days = this.getPeriodDays(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch meal records with price
    const meals = await this.mealRecordRepository.find({
      where: {
        userId,
      },
      order: { createdAt: 'DESC' },
    })

    const recentMeals = meals.filter(
      (meal) => (meal.photoTakenAt || meal.createdAt) >= startDate && meal.price !== null
    )

    // Check if enough data
    const MIN_MEALS = 5
    if (recentMeals.length < MIN_MEALS) {
      return {
        hasEnoughData: false,
        message: `최소 ${MIN_MEALS}개 이상의 가격 정보가 있는 식사 기록이 필요합니다`,
        monthlyTrend: [],
        analyzedAt: new Date(),
      }
    }

    // Calculate monthly trend
    const monthlyTrend = this.calculateMonthlyTrend(recentMeals)

    // Calculate value for money if requested
    let bestValueRestaurants: ValueForMoneyRestaurant[] | undefined
    if (options.rankBy === 'valueForMoney') {
      bestValueRestaurants = this.calculateValueForMoney(recentMeals)
    }

    // Generate alerts if requested
    let alerts: SpendingAlert[] | undefined
    if (options.alerts) {
      alerts = this.generateAlerts(meals, recentMeals)
    }

    // Calculate trend if requested
    let trend: SpendingTrend | undefined
    if (options.trend) {
      trend = this.calculateTrend(meals, days)
    }

    return {
      hasEnoughData: true,
      monthlyTrend,
      bestValueRestaurants,
      alerts,
      trend,
      analyzedAt: new Date(),
    }
  }

  private getPeriodDays(period: SpendingPeriod): number {
    switch (period) {
      case SpendingPeriod.MONTH:
        return 30
      case SpendingPeriod.QUARTER:
        return 90
      case SpendingPeriod.YEAR:
        return 365
      default:
        return 30
    }
  }

  private calculateMonthlyTrend(meals: MealRecord[]): MonthlySpending[] {
    const monthMap = new Map<string, MealRecord[]>()

    meals.forEach((meal) => {
      const date = meal.photoTakenAt || meal.createdAt
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, [])
      }
      monthMap.get(monthKey)!.push(meal)
    })

    const monthlyTrend: MonthlySpending[] = []
    for (const [month, monthMeals] of monthMap.entries()) {
      const total = monthMeals.reduce((sum, meal) => sum + (meal.price || 0), 0)
      const mealCount = monthMeals.length

      monthlyTrend.push({
        month,
        total: Math.round(total),
        average: Math.round(total / mealCount),
        mealCount,
      })
    }

    // Sort by month descending
    return monthlyTrend.sort((a, b) => b.month.localeCompare(a.month))
  }

  private calculateValueForMoney(meals: MealRecord[]): ValueForMoneyRestaurant[] {
    // Group by restaurant name (or location as proxy)
    const restaurantMap = new Map<
      string,
      { prices: number[]; ratings: number[]; meals: MealRecord[] }
    >()

    meals.forEach((meal) => {
      const key = meal.location || meal.name
      if (!key) return

      if (!restaurantMap.has(key)) {
        restaurantMap.set(key, { prices: [], ratings: [], meals: [] })
      }

      const data = restaurantMap.get(key)!
      if (meal.price) data.prices.push(meal.price)
      if (meal.rating) data.ratings.push(meal.rating)
      data.meals.push(meal)
    })

    const restaurants: ValueForMoneyRestaurant[] = []
    for (const [name, data] of restaurantMap.entries()) {
      if (data.prices.length === 0 || data.ratings.length === 0) continue

      const averagePrice = data.prices.reduce((a, b) => a + b, 0) / data.prices.length
      const rating = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length
      const valueScore = rating / (averagePrice / 10000) // rating per 10k won

      restaurants.push({
        restaurantId: 0, // We don't have restaurant entity yet
        restaurantName: name,
        averagePrice: Math.round(averagePrice),
        rating: Math.round(rating * 10) / 10,
        valueScore: Math.round(valueScore * 100) / 100,
        visitCount: data.meals.length,
      })
    }

    // Sort by value score descending
    return restaurants.sort((a, b) => b.valueScore - a.valueScore).slice(0, 10)
  }

  private generateAlerts(allMeals: MealRecord[], recentMeals: MealRecord[]): SpendingAlert[] {
    const alerts: SpendingAlert[] = []

    // Calculate current month spending
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthMeals = allMeals.filter(
      (meal) => (meal.photoTakenAt || meal.createdAt) >= currentMonthStart && meal.price !== null
    )

    if (currentMonthMeals.length < 3) return alerts

    const currentTotal = currentMonthMeals.reduce((sum, meal) => sum + (meal.price || 0), 0)
    const currentDay = now.getDate()
    const expectedMonthly = (currentTotal / currentDay) * 30

    // Calculate usual monthly spending (last 3 months average)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const pastMeals = allMeals.filter(
      (meal) =>
        (meal.photoTakenAt || meal.createdAt) >= threeMonthsAgo &&
        (meal.photoTakenAt || meal.createdAt) < currentMonthStart &&
        meal.price !== null
    )

    if (pastMeals.length >= 10) {
      const pastTotal = pastMeals.reduce((sum, meal) => sum + (meal.price || 0), 0)
      const monthsCount = 3
      const usualMonthly = pastTotal / monthsCount

      // Budget exceed alert
      if (expectedMonthly > usualMonthly * 1.2) {
        const increase = Math.round(((expectedMonthly - usualMonthly) / usualMonthly) * 100)
        alerts.push({
          type: 'BUDGET_EXCEED',
          severity: increase > 50 ? 'critical' : 'warning',
          message: '이번 달 예산 초과가 예상됩니다',
          expected: Math.round(expectedMonthly),
          usual: Math.round(usualMonthly),
          increase,
        })
      }

      // Trend change alert
      if (expectedMonthly > usualMonthly * 1.5) {
        alerts.push({
          type: 'TREND_CHANGE',
          severity: 'warning',
          message: '최근 외식 지출이 크게 증가했습니다',
          expected: Math.round(expectedMonthly),
          usual: Math.round(usualMonthly),
        })
      }
    }

    // Unusual high spending in single meal
    const recentPrices = recentMeals.map((m) => m.price || 0)
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
    const highPriceMeals = recentMeals.filter((m) => (m.price || 0) > avgPrice * 2)

    if (highPriceMeals.length > 0) {
      alerts.push({
        type: 'UNUSUAL_HIGH',
        severity: 'info',
        message: `최근 평균보다 2배 이상 비싼 식사 ${highPriceMeals.length}건`,
      })
    }

    return alerts
  }

  private calculateTrend(allMeals: MealRecord[], days: number): SpendingTrend {
    const now = new Date()
    const currentPeriodStart = new Date()
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days)

    const previousPeriodStart = new Date()
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days * 2)

    const currentPeriodMeals = allMeals.filter(
      (meal) =>
        (meal.photoTakenAt || meal.createdAt) >= currentPeriodStart &&
        (meal.photoTakenAt || meal.createdAt) < now &&
        meal.price !== null
    )

    const previousPeriodMeals = allMeals.filter(
      (meal) =>
        (meal.photoTakenAt || meal.createdAt) >= previousPeriodStart &&
        (meal.photoTakenAt || meal.createdAt) < currentPeriodStart &&
        meal.price !== null
    )

    const currentTotal = currentPeriodMeals.reduce((sum, meal) => sum + (meal.price || 0), 0)
    const previousTotal = previousPeriodMeals.reduce((sum, meal) => sum + (meal.price || 0), 0)

    if (previousTotal === 0) {
      return {
        direction: 'stable',
        percentage: 0,
        message: '비교 데이터가 부족합니다',
      }
    }

    const percentage = Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
    const absPercentage = Math.abs(percentage)

    let direction: 'increasing' | 'decreasing' | 'stable'
    let message: string

    if (percentage > 10) {
      direction = 'increasing'
      message = `이전 기간 대비 ${absPercentage}% 증가`
    } else if (percentage < -10) {
      direction = 'decreasing'
      message = `이전 기간 대비 ${absPercentage}% 감소`
    } else {
      direction = 'stable'
      message = '이전 기간과 비슷한 수준'
    }

    return {
      direction,
      percentage: absPercentage,
      message,
    }
  }
}
