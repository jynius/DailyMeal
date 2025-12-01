import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SpendingAnalysisService } from './spending-analysis.service'
import { MealRecord } from '../../entities/meal-record.entity'
import { SpendingPeriod } from '../dto/spending-analysis.dto'

describe('SpendingAnalysisService', () => {
  let service: SpendingAnalysisService
  let repository: Repository<MealRecord>

  const mockUserId = 'test-user-id'

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpendingAnalysisService,
        {
          provide: getRepositoryToken(MealRecord),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<SpendingAnalysisService>(SpendingAnalysisService)
    repository = module.get<Repository<MealRecord>>(getRepositoryToken(MealRecord))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('analyzeSpending', () => {
    it('should return insufficient data message for users with few records', async () => {
      // Given: 가격 정보 있는 기록 2개만
      const meals: Partial<MealRecord>[] = [
        {
          id: '1',
          userId: mockUserId,
          name: '식사1',
          price: 10000,
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: mockUserId,
          name: '식사2',
          price: 15000,
          createdAt: new Date(),
        },
      ]

      jest.spyOn(repository, 'find').mockResolvedValue(meals as MealRecord[])

      // When
      const result = await service.analyzeSpending(mockUserId, SpendingPeriod.MONTH)

      // Then
      expect(result.hasEnoughData).toBe(false)
      expect(result.message).toContain('최소')
      expect(result.monthlyTrend).toEqual([])
    })

    it('should calculate monthly trend correctly', async () => {
      // Given: 30일 동안 10개 식사
      const now = new Date()
      const meals: Partial<MealRecord>[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        userId: mockUserId,
        name: `식사${i + 1}`,
        price: 10000 + i * 1000,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * i),
        photoTakenAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * i),
      }))

      jest.spyOn(repository, 'find').mockResolvedValue(meals as MealRecord[])

      // When
      const result = await service.analyzeSpending(mockUserId, SpendingPeriod.MONTH)

      // Then
      expect(result.hasEnoughData).toBe(true)
      expect(result.monthlyTrend).toBeDefined()
      expect(result.monthlyTrend.length).toBeGreaterThan(0)
      expect(result.monthlyTrend[0]).toHaveProperty('month')
      expect(result.monthlyTrend[0]).toHaveProperty('total')
      expect(result.monthlyTrend[0]).toHaveProperty('average')
      expect(result.monthlyTrend[0]).toHaveProperty('mealCount')
    })

    it('should calculate value for money restaurants', async () => {
      // Given: 가격과 평점이 있는 식사들
      const now = new Date()
      const meals: Partial<MealRecord>[] = [
        {
          id: '1',
          userId: mockUserId,
          name: '식사1',
          location: '맛집A',
          price: 10000,
          rating: 5,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
        },
        {
          id: '2',
          userId: mockUserId,
          name: '식사2',
          location: '맛집A',
          price: 12000,
          rating: 4,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
        },
        {
          id: '3',
          userId: mockUserId,
          name: '식사3',
          location: '맛집B',
          price: 20000,
          rating: 3,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
        },
        {
          id: '4',
          userId: mockUserId,
          name: '식사4',
          location: '맛집C',
          price: 8000,
          rating: 5,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
        },
        {
          id: '5',
          userId: mockUserId,
          name: '식사5',
          location: '맛집C',
          price: 7000,
          rating: 5,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
        },
      ]

      jest.spyOn(repository, 'find').mockResolvedValue(meals as MealRecord[])

      // When
      const result = await service.analyzeSpending(mockUserId, SpendingPeriod.MONTH, {
        rankBy: 'valueForMoney',
      })

      // Then
      expect(result.bestValueRestaurants).toBeDefined()
      expect(result.bestValueRestaurants!.length).toBeGreaterThan(0)
      expect(result.bestValueRestaurants![0]).toHaveProperty('restaurantName')
      expect(result.bestValueRestaurants![0]).toHaveProperty('averagePrice')
      expect(result.bestValueRestaurants![0]).toHaveProperty('rating')
      expect(result.bestValueRestaurants![0]).toHaveProperty('valueScore')
      // 가성비 최고는 맛집C (저렴하고 평점 높음)
      expect(result.bestValueRestaurants![0].restaurantName).toBe('맛집C')
    })

    it('should generate budget exceed alert', async () => {
      // Given: 이번 달 지출이 평소보다 많음
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const threeMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 3, 1)

      const meals: Partial<MealRecord>[] = [
        // 이번 달 (20일 동안 300,000원)
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `current-${i}`,
          userId: mockUserId,
          name: `식사${i}`,
          price: 30000, // 총 300,000원
          createdAt: new Date(currentMonthStart.getTime() + 1000 * 60 * 60 * 24 * i),
        })),
        // 지난 달 (200,000원)
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `last-${i}`,
          userId: mockUserId,
          name: `식사${i}`,
          price: 20000, // 총 200,000원
          createdAt: new Date(lastMonthStart.getTime() + 1000 * 60 * 60 * 24 * i),
        })),
        // 2달 전 (200,000원)
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `two-${i}`,
          userId: mockUserId,
          name: `식사${i}`,
          price: 20000,
          createdAt: new Date(twoMonthsAgoStart.getTime() + 1000 * 60 * 60 * 24 * i),
        })),
        // 3달 전 (200,000원)
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `three-${i}`,
          userId: mockUserId,
          name: `식사${i}`,
          price: 20000,
          createdAt: new Date(threeMonthsAgoStart.getTime() + 1000 * 60 * 60 * 24 * i),
        })),
      ]

      jest.spyOn(repository, 'find').mockResolvedValue(meals as MealRecord[])

      // When
      const result = await service.analyzeSpending(mockUserId, SpendingPeriod.MONTH, {
        alerts: true,
      })

      // Then
      expect(result.alerts).toBeDefined()
      expect(result.alerts!.length).toBeGreaterThan(0)
      const budgetAlert = result.alerts!.find((a) => a.type === 'BUDGET_EXCEED')
      expect(budgetAlert).toBeDefined()
      expect(budgetAlert!.severity).toBe('critical') // 50% 이상 증가 시 critical
    })

    it('should calculate spending trend', async () => {
      // Given: 현재 기간이 이전 기간보다 지출 증가
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)

      const meals: Partial<MealRecord>[] = [
        // 최근 30일 (300,000원)
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `recent-${i}`,
          userId: mockUserId,
          name: `식사${i}`,
          price: 30000,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * i),
        })),
        // 이전 30일 (200,000원)
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `previous-${i}`,
          userId: mockUserId,
          name: `식사${i}`,
          price: 20000,
          createdAt: new Date(thirtyDaysAgo.getTime() - 1000 * 60 * 60 * 24 * i),
        })),
      ]

      jest.spyOn(repository, 'find').mockResolvedValue(meals as MealRecord[])

      // When
      const result = await service.analyzeSpending(mockUserId, SpendingPeriod.MONTH, {
        trend: true,
      })

      // Then
      expect(result.trend).toBeDefined()
      expect(result.trend!.direction).toBe('increasing')
      expect(result.trend!.percentage).toBeGreaterThan(0)
      expect(result.trend!.message).toContain('증가')
    })
  })
})
