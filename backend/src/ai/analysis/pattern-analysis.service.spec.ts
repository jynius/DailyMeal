import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PatternAnalysisService } from './pattern-analysis.service'
import { MealRecord } from '../../entities/meal-record.entity'
import { AnalysisPeriod } from '../dto/pattern-analysis.dto'

describe('PatternAnalysisService', () => {
  let service: PatternAnalysisService
  let repository: Repository<MealRecord>

  const mockUserId = 'test-user-id'

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatternAnalysisService,
        {
          provide: getRepositoryToken(MealRecord),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<PatternAnalysisService>(PatternAnalysisService)
    repository = module.get<Repository<MealRecord>>(getRepositoryToken(MealRecord))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('analyzePattern', () => {
    it('should return insufficient data message for new users', async () => {
      // Given: 신규 사용자 (기록 2개)
      const meals: Partial<MealRecord>[] = [
        {
          id: '1',
          userId: mockUserId,
          name: '아침',
          category: 'home',
          createdAt: new Date(),
          companionIds: null,
        },
        {
          id: '2',
          userId: mockUserId,
          name: '점심',
          category: 'restaurant',
          createdAt: new Date(),
          companionIds: null,
        },
      ]

      jest.spyOn(repository, 'find').mockResolvedValue(meals as MealRecord[])

      // When
      const result = await service.analyzePattern(mockUserId, AnalysisPeriod.MONTH)

      // Then
      expect(result.hasEnoughData).toBe(false)
      expect(result.message).toContain('최소')
      expect(result.totalMeals).toBe(2)
      expect(result.confidence).toBe(0)
    })

    it('should analyze time distribution correctly', async () => {
      // Given: 충분한 데이터
      const now = new Date()
      const meals: Partial<MealRecord>[] = [
        // 아침 2개
        {
          id: '1',
          userId: mockUserId,
          name: '아침',
          category: 'home',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1), // 1일 전
          photoTakenAt: new Date(now.setHours(8, 0, 0, 0) - 1000 * 60 * 60 * 24 * 1),
          companionIds: null,
        },
        {
          id: '2',
          userId: mockUserId,
          name: '아침2',
          category: 'home',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
          photoTakenAt: new Date(now.setHours(9, 0, 0, 0) - 1000 * 60 * 60 * 24 * 2),
          companionIds: null,
        },
        // 점심 3개
        {
          id: '3',
          userId: mockUserId,
          name: '점심',
          category: 'restaurant',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
          photoTakenAt: new Date(now.setHours(12, 0, 0, 0) - 1000 * 60 * 60 * 24 * 3),
          companionIds: null,
        },
        {
          id: '4',
          userId: mockUserId,
          name: '점심2',
          category: 'restaurant',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
          photoTakenAt: new Date(now.setHours(13, 0, 0, 0) - 1000 * 60 * 60 * 24 * 4),
          companionIds: null,
        },
        {
          id: '5',
          userId: mockUserId,
          name: '점심3',
          category: 'restaurant',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
          photoTakenAt: new Date(now.setHours(14, 0, 0, 0) - 1000 * 60 * 60 * 24 * 5),
          companionIds: null,
        },
      ]

      jest.spyOn(repository, 'find').mockResolvedValue(meals as MealRecord[])

      // When
      const result = await service.analyzePattern(mockUserId, AnalysisPeriod.MONTH)

      // Then
      expect(result.hasEnoughData).toBe(true)
      expect(result.totalMeals).toBe(5)
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.timeDistribution.breakfast).toBe(40) // 2/5 = 40%
      expect(result.timeDistribution.lunch).toBe(60) // 3/5 = 60%
    })

    it('should detect dining mode (solo vs group)', async () => {
      // Given: 혼밥 3개, 회식 2개
      const now = new Date()
      const meals: Partial<MealRecord>[] = [
        {
          id: '1',
          userId: mockUserId,
          name: '혼밥1',
          category: 'home',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1),
          companionIds: null, // 혼밥
        },
        {
          id: '2',
          userId: mockUserId,
          name: '혼밥2',
          category: 'restaurant',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
          companionIds: [], // 혼밥
        },
        {
          id: '3',
          userId: mockUserId,
          name: '혼밥3',
          category: 'restaurant',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
          companionIds: null,
        },
        {
          id: '4',
          userId: mockUserId,
          name: '회식1',
          category: 'restaurant',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
          companionIds: ['friend-1', 'friend-2'], // 회식
        },
        {
          id: '5',
          userId: mockUserId,
          name: '회식2',
          category: 'restaurant',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
          companionIds: ['friend-1'],
        },
      ]

      jest.spyOn(repository, 'find').mockResolvedValue(meals as MealRecord[])

      // When
      const result = await service.analyzePattern(mockUserId, AnalysisPeriod.MONTH)

      // Then
      expect(result.diningMode.solo).toBe(60) // 3/5 = 60%
      expect(result.diningMode.group).toBe(40) // 2/5 = 40%
    })
  })
})
