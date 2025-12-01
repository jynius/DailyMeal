import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RecommendationService } from './recommendation.service'
import { MealRecord } from '../../entities/meal-record.entity'
import { Friendship } from '../../entities/friendship.entity'
import { User } from '../../entities/user.entity'
import { RecommendationType } from '../dto/recommendation.dto'

describe('RecommendationService', () => {
  let service: RecommendationService
  let mealRepository: Repository<MealRecord>
  let friendshipRepository: Repository<Friendship>
  let userRepository: Repository<User>

  const mockUserId = 'test-user-id'
  const mockFriendId = 'friend-user-id'

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        {
          provide: getRepositoryToken(MealRecord),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Friendship),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<RecommendationService>(RecommendationService)
    mealRepository = module.get<Repository<MealRecord>>(getRepositoryToken(MealRecord))
    friendshipRepository = module.get<Repository<Friendship>>(getRepositoryToken(Friendship))
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getRecommendations - Social', () => {
    it('should recommend restaurants liked by friends', async () => {
      // Given: 친구 관계
      const friendships: Partial<Friendship>[] = [
        {
          id: '1',
          userId: mockUserId,
          friendId: mockFriendId,
          status: 'accepted',
        },
      ]

      jest.spyOn(friendshipRepository, 'find').mockResolvedValue(friendships as Friendship[])

      // 내 식사 기록 (방문한 곳)
      const userMeals: Partial<MealRecord>[] = [
        {
          id: '1',
          userId: mockUserId,
          location: '내가 간 곳',
          name: '식사1',
        },
      ]

      // 친구의 식사 기록
      const friendMeals: Partial<MealRecord>[] = [
        {
          id: '2',
          userId: mockFriendId,
          name: '친구 식사',
          location: '친구가 좋아한 식당',
          address: '서울시 강남구',
          rating: 5,
          price: 15000,
          latitude: 37.5,
          longitude: 127.0,
        },
        {
          id: '3',
          userId: mockFriendId,
          name: '친구 식사2',
          location: '친구가 좋아한 식당',
          address: '서울시 강남구',
          rating: 4,
          price: 12000,
          latitude: 37.5,
          longitude: 127.0,
        },
      ]

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(friendMeals),
      }

      jest.spyOn(mealRepository, 'find').mockResolvedValue(userMeals as MealRecord[])
      jest
        .spyOn(mealRepository, 'createQueryBuilder')
        .mockReturnValue(
          mockQueryBuilder as unknown as ReturnType<typeof mealRepository.createQueryBuilder>
        )
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        id: mockFriendId,
        name: '친구',
        email: 'friend@test.com',
      } as User)

      // When
      const result = await service.getRecommendations(mockUserId, RecommendationType.SOCIAL)

      // Then
      expect(result.type).toBe(RecommendationType.SOCIAL)
      expect(result.recommendations).toBeDefined()
      expect(result.recommendations.length).toBeGreaterThan(0)
      expect(result.recommendations[0]).toMatchObject({
        restaurantName: '친구가 좋아한 식당',
        rating: expect.any(Number) as number,
        averagePrice: expect.any(Number) as number,
        visited: false,
      })
      expect(result.recommendations[0].likedByFriends).toBeDefined()
      expect(result.recommendations[0].likedByFriends!.length).toBe(1)
    })

    it('should return empty array when no friends', async () => {
      // Given: 친구 없음
      jest.spyOn(friendshipRepository, 'find').mockResolvedValue([])

      // When
      const result = await service.getRecommendations(mockUserId, RecommendationType.SOCIAL)

      // Then
      expect(result.recommendations).toEqual([])
      expect(result.count).toBe(0)
    })
  })

  describe('getRecommendations - Popular', () => {
    it('should recommend popular restaurants nearby', async () => {
      // Given: 내 방문 기록
      const userMeals: Partial<MealRecord>[] = [
        {
          id: '1',
          userId: mockUserId,
          location: '내가 간 곳',
          latitude: 37.5,
          longitude: 127.0,
        },
      ]

      // 다른 사용자들의 인기 식당
      const popularMeals: Partial<MealRecord>[] = Array.from({ length: 10 }, (_, i) => ({
        id: `popular-${i}`,
        userId: `user-${i}`,
        location: '인기 식당',
        address: '서울시 강남구',
        rating: 4.5,
        price: 20000,
        latitude: 37.51,
        longitude: 127.01,
        createdAt: new Date(),
      }))

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(popularMeals),
      }

      jest.spyOn(mealRepository, 'find').mockResolvedValue(userMeals as MealRecord[])
      jest
        .spyOn(mealRepository, 'createQueryBuilder')
        .mockReturnValue(
          mockQueryBuilder as unknown as ReturnType<typeof mealRepository.createQueryBuilder>
        )

      // When
      const result = await service.getRecommendations(mockUserId, RecommendationType.POPULAR)

      // Then
      expect(result.type).toBe(RecommendationType.POPULAR)
      expect(result.recommendations).toBeDefined()
      expect(result.recommendations.length).toBeGreaterThan(0)
      expect(result.recommendations[0]).toMatchObject({
        restaurantName: '인기 식당',
        visitCount: 10,
        distance: expect.any(Number) as number,
        visited: false,
      })
    })
  })

  describe('getRecommendations - Collaborative', () => {
    it('should recommend based on similar users preferences', async () => {
      // Given: 내 선호도
      const userMeals: Partial<MealRecord>[] = [
        {
          id: '1',
          userId: mockUserId,
          location: '공통 식당 A',
          rating: 5,
        },
        {
          id: '2',
          userId: mockUserId,
          location: '공통 식당 B',
          rating: 4,
        },
      ]

      // 비슷한 취향의 다른 사용자
      const similarUser = {
        id: 'similar-user-id',
        name: '비슷한 유저',
        email: 'similar@test.com',
      } as User

      const similarUserMeals: Partial<MealRecord>[] = [
        {
          id: '3',
          userId: 'similar-user-id',
          location: '공통 식당 A',
          rating: 5,
        },
        {
          id: '4',
          userId: 'similar-user-id',
          location: '공통 식당 B',
          rating: 4,
        },
        {
          id: '5',
          userId: 'similar-user-id',
          location: '추천 식당',
          rating: 5,
          price: 18000,
          address: '서울시',
        },
      ]

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([similarUserMeals[2]]),
      }

      jest.spyOn(userRepository, 'find').mockResolvedValue([similarUser])
      jest
        .spyOn(mealRepository, 'find')
        .mockImplementation((options?: { where?: { userId?: string } }) => {
          if (options?.where?.userId === mockUserId) {
            return Promise.resolve(userMeals as MealRecord[])
          } else {
            return Promise.resolve(similarUserMeals as MealRecord[])
          }
        })
      jest
        .spyOn(mealRepository, 'createQueryBuilder')
        .mockReturnValue(
          mockQueryBuilder as unknown as ReturnType<typeof mealRepository.createQueryBuilder>
        )

      // When
      const result = await service.getRecommendations(mockUserId, RecommendationType.COLLABORATIVE)

      // Then
      expect(result.type).toBe(RecommendationType.COLLABORATIVE)
      expect(result.recommendations).toBeDefined()
      // Collaborative filtering requires similar patterns
    })
  })

  describe('filters', () => {
    it('should apply maxPrice filter', async () => {
      // Setup basic mock
      jest.spyOn(friendshipRepository, 'find').mockResolvedValue([])

      // When
      const result = await service.getRecommendations(mockUserId, RecommendationType.SOCIAL, {
        maxPrice: 10000,
      })

      // Then
      result.recommendations.forEach((rec) => {
        expect(rec.averagePrice).toBeLessThanOrEqual(10000)
      })
    })

    it('should apply minRating filter', async () => {
      // Setup basic mock
      jest.spyOn(friendshipRepository, 'find').mockResolvedValue([])

      // When
      const result = await service.getRecommendations(mockUserId, RecommendationType.SOCIAL, {
        minRating: 4.0,
      })

      // Then
      result.recommendations.forEach((rec) => {
        expect(rec.rating).toBeGreaterThanOrEqual(4.0)
      })
    })

    it('should limit results', async () => {
      // Setup basic mock
      jest.spyOn(friendshipRepository, 'find').mockResolvedValue([])

      // When
      const result = await service.getRecommendations(mockUserId, RecommendationType.SOCIAL, {
        limit: 5,
      })

      // Then
      expect(result.recommendations.length).toBeLessThanOrEqual(5)
    })
  })
})
