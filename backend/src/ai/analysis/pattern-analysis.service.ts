import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MealRecord } from '../../entities/meal-record.entity'
import {
  AnalysisPeriod,
  DiningMode,
  FoodCategory,
  PatternAnalysisResponseDto,
  TimeDistribution,
  WeekdayPattern,
} from '../dto/pattern-analysis.dto'

@Injectable()
export class PatternAnalysisService {
  private readonly logger = new Logger(PatternAnalysisService.name)

  constructor(
    @InjectRepository(MealRecord)
    private readonly mealRecordRepository: Repository<MealRecord>
  ) {}

  async analyzePattern(
    userId: string,
    period: AnalysisPeriod = AnalysisPeriod.MONTH
  ): Promise<PatternAnalysisResponseDto> {
    this.logger.log(`Analyzing pattern for user ${userId}, period: ${period}`)

    const days = this.getPeriodDays(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch meal records
    const meals = await this.mealRecordRepository.find({
      where: {
        userId,
      },
      order: { createdAt: 'DESC' },
    })

    const recentMeals = meals.filter((meal) => (meal.photoTakenAt || meal.createdAt) >= startDate)

    // Check if enough data
    const MIN_MEALS = 5
    const MIN_DAYS = 3
    if (recentMeals.length < MIN_MEALS) {
      return {
        hasEnoughData: false,
        message: `최소 ${MIN_DAYS}일, ${MIN_MEALS}개 이상의 식사 기록이 필요합니다`,
        totalMeals: recentMeals.length,
        confidence: 0,
        timeDistribution: this.getEmptyTimeDistribution(),
        weekdayPattern: this.getEmptyWeekdayPattern(),
        preferredCategories: [],
        diningMode: { solo: 0, group: 0 },
        analyzedAt: new Date(),
      }
    }

    // Calculate confidence based on data amount
    const confidence = this.calculateConfidence(recentMeals.length, days)

    // Analyze patterns
    const timeDistribution = this.analyzeTimeDistribution(recentMeals)
    const weekdayPattern = this.analyzeWeekdayPattern(recentMeals)
    const preferredCategories = this.analyzePreferredCategories(recentMeals)
    const diningMode = this.analyzeDiningMode(recentMeals)

    return {
      hasEnoughData: true,
      totalMeals: recentMeals.length,
      confidence,
      timeDistribution,
      weekdayPattern,
      preferredCategories,
      diningMode,
      analyzedAt: new Date(),
    }
  }

  private getPeriodDays(period: AnalysisPeriod): number {
    switch (period) {
      case AnalysisPeriod.WEEK:
        return 7
      case AnalysisPeriod.MONTH:
        return 30
      case AnalysisPeriod.QUARTER:
        return 90
      default:
        return 30
    }
  }

  private calculateConfidence(mealCount: number, days: number): number {
    // Confidence based on meals per day
    const mealsPerDay = mealCount / days
    if (mealsPerDay >= 2) return 95
    if (mealsPerDay >= 1.5) return 85
    if (mealsPerDay >= 1) return 75
    if (mealsPerDay >= 0.5) return 60
    return 40
  }

  private analyzeTimeDistribution(meals: MealRecord[]): TimeDistribution {
    const breakfast = meals.filter((m) => {
      const time = m.photoTakenAt || m.createdAt
      const hour = time.getHours()
      return hour >= 5 && hour < 11
    }).length

    const lunch = meals.filter((m) => {
      const time = m.photoTakenAt || m.createdAt
      const hour = time.getHours()
      return hour >= 11 && hour < 15
    }).length

    const dinner = meals.filter((m) => {
      const time = m.photoTakenAt || m.createdAt
      const hour = time.getHours()
      return hour >= 15 && hour < 21
    }).length

    const lateNight = meals.filter((m) => {
      const time = m.photoTakenAt || m.createdAt
      const hour = time.getHours()
      return hour >= 21 || hour < 5
    }).length

    const total = meals.length
    return {
      breakfast: Math.round((breakfast / total) * 100),
      lunch: Math.round((lunch / total) * 100),
      dinner: Math.round((dinner / total) * 100),
      lateNight: Math.round((lateNight / total) * 100),
    }
  }

  private analyzeWeekdayPattern(meals: MealRecord[]): WeekdayPattern {
    const weekdayMeals = meals.filter((m) => {
      const time = m.photoTakenAt || m.createdAt
      const day = time.getDay()
      return day >= 1 && day <= 5 // Mon-Fri
    })

    const weekendMeals = meals.filter((m) => {
      const time = m.photoTakenAt || m.createdAt
      const day = time.getDay()
      return day === 0 || day === 6 // Sat-Sun
    })

    // Simple heuristic: if category is restaurant, it's eating out
    const weekdayEatingOut = weekdayMeals.filter((m) => m.category === 'restaurant').length
    const weekendEatingOut = weekendMeals.filter((m) => m.category === 'restaurant').length

    const weekdayTotal = weekdayMeals.length || 1
    const weekendTotal = weekendMeals.length || 1

    return {
      weekday: {
        eatingOut: Math.round((weekdayEatingOut / weekdayTotal) * 100),
        homeCooked: Math.round(((weekdayTotal - weekdayEatingOut) / weekdayTotal) * 100),
      },
      weekend: {
        eatingOut: Math.round((weekendEatingOut / weekendTotal) * 100),
        homeCooked: Math.round(((weekendTotal - weekendEatingOut) / weekendTotal) * 100),
      },
    }
  }

  private analyzePreferredCategories(meals: MealRecord[]): FoodCategory[] {
    const categoryMap = new Map<string, number>()

    meals.forEach((meal) => {
      if (meal.category) {
        const count = categoryMap.get(meal.category) || 0
        categoryMap.set(meal.category, count + 1)
      }
    })

    const total = meals.length
    const categories: FoodCategory[] = Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3) // Top 3

    return categories
  }

  private analyzeDiningMode(meals: MealRecord[]): DiningMode {
    // Use companionIds to determine dining mode
    const soloCount = meals.filter((m) => {
      // If no companions or companionIds is empty, it's solo
      return !m.companionIds || m.companionIds.length === 0
    }).length

    const total = meals.length || 1
    return {
      solo: Math.round((soloCount / total) * 100),
      group: Math.round(((total - soloCount) / total) * 100),
    }
  }

  private getEmptyTimeDistribution(): TimeDistribution {
    return {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      lateNight: 0,
    }
  }

  private getEmptyWeekdayPattern(): WeekdayPattern {
    return {
      weekday: { homeCooked: 0, eatingOut: 0 },
      weekend: { homeCooked: 0, eatingOut: 0 },
    }
  }
}
