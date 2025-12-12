import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from '../entities/user.entity'
import { UserSettings } from '../entities/user-settings.entity'
import { MealRecord } from '../entities/meal-record.entity'
import { Friendship } from '../entities/friendship.entity'
import { EmailService } from '../email/email.service'
import { ConfigService } from '../config/config.service'

describe('UsersService', () => {
  let service: UsersService
  let userRepository: Repository<User>
  let userSettingsRepository: Repository<UserSettings>

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000'

  const mockUser: User = {
    id: mockUserId,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    bio: '안녕하세요',
    profileImage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    mealRecords: [],
    sentFriendships: [],
    receivedFriendships: [],
    settings: null,
    userLocations: [],
  }

  const mockUserSettings: UserSettings = {
    id: 'settings-id',
    userId: mockUserId,
    notificationFriendRequest: true,
    notificationNewComment: true,
    notificationNewReview: true,
    privacyProfilePublic: true,
    privacyShowLocation: true,
    privacyShowMealDetails: true,
    aiRecommendationType: 'social',
    aiRecommendationMaxDistance: 5000,
    aiRecommendationMinRating: 4.0,
    aiRecommendationExcludeVisited: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
  }

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockMealRecordRepository = {
    count: jest.fn().mockResolvedValue(10),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockFriendshipRepository = {
    count: jest.fn().mockResolvedValue(5),
    find: jest.fn(),
  }

  const mockUserSettingsRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-value'),
    transformImageUrl: jest.fn((url) => url),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserSettings),
          useValue: mockUserSettingsRepository,
        },
        {
          provide: getRepositoryToken(MealRecord),
          useValue: mockMealRecordRepository,
        },
        {
          provide: getRepositoryToken(Friendship),
          useValue: mockFriendshipRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    userSettingsRepository = module.get<Repository<UserSettings>>(getRepositoryToken(UserSettings))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getUserProfile', () => {
    it('사용자 프로필 조회 성공', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '5' }),
      }

      mockUserRepository.findOne.mockResolvedValue(mockUser)
      mockMealRecordRepository.count.mockResolvedValue(10)
      mockMealRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockFriendshipRepository.count.mockResolvedValue(5)

      const result = await service.getUserProfile(mockUserId)

      expect(result).toBeDefined()
      expect(result.id).toBe(mockUserId)
      expect(result.stats.totalReviews).toBe(10)
      expect(result.stats.restaurantCount).toBe(5)
      expect(result.stats.friendCount).toBe(5)
    })

    it('존재하지 않는 사용자 - NotFoundException', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(service.getUserProfile('invalid-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateProfile', () => {
    it('사용자 프로필 업데이트 성공', async () => {
      const updateData = {
        username: 'Updated Name',
        bio: 'Updated bio',
      }

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '5' }),
      }

      mockUserRepository.findOne.mockResolvedValue(mockUser)
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        name: updateData.username,
        bio: updateData.bio,
      })
      mockMealRecordRepository.count.mockResolvedValue(10)
      mockMealRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockFriendshipRepository.count.mockResolvedValue(5)

      const result = await service.updateProfile(mockUserId, updateData)

      expect(result).toBeDefined()
      expect(mockUserRepository.save).toHaveBeenCalled()
    })

    it('존재하지 않는 사용자 업데이트 - NotFoundException', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(service.updateProfile('invalid-id', { name: 'Test' })).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('getUserSettings', () => {
    it('사용자 설정 조회 성공', async () => {
      mockUserSettingsRepository.findOne.mockResolvedValue(mockUserSettings)

      const result = await service.getUserSettings(mockUserId)

      expect(result).toBeDefined()
      expect(mockUserSettingsRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      })
    })

    it('설정이 없는 경우 기본값 생성', async () => {
      mockUserSettingsRepository.findOne.mockResolvedValue(null)
      mockUserSettingsRepository.create.mockReturnValue(mockUserSettings)
      mockUserSettingsRepository.save.mockResolvedValue(mockUserSettings)

      const result = await service.getUserSettings(mockUserId)

      expect(result).toBeDefined()
      expect(mockUserSettingsRepository.create).toHaveBeenCalled()
      expect(mockUserSettingsRepository.save).toHaveBeenCalled()
    })
  })

  describe('updateUserSettings', () => {
    const updateData = {
      notificationNewComment: false,
      aiRecommendationType: 'popular' as any,
    }

    it('기존 설정 업데이트', async () => {
      mockUserSettingsRepository.findOne.mockResolvedValue(mockUserSettings)
      mockUserSettingsRepository.save.mockResolvedValue({
        ...mockUserSettings,
        ...updateData,
      })

      const result = await service.updateUserSettings(mockUserId, updateData)

      expect(result).toBeDefined()
      expect(mockUserSettingsRepository.save).toHaveBeenCalled()
    })

    it('설정이 없으면 새로 생성', async () => {
      mockUserSettingsRepository.findOne.mockResolvedValue(null)
      mockUserSettingsRepository.create.mockReturnValue({
        ...mockUserSettings,
        ...updateData,
      })
      mockUserSettingsRepository.save.mockResolvedValue({
        ...mockUserSettings,
        ...updateData,
      })

      const result = await service.updateUserSettings(mockUserId, updateData)

      expect(result).toBeDefined()
      expect(mockUserSettingsRepository.create).toHaveBeenCalled()
      expect(mockUserSettingsRepository.save).toHaveBeenCalled()
    })
  })

  describe('getUserStatistics', () => {
    it('사용자 통계 조회 성공', async () => {
      // 여러 쿼리빌더 호출을 위한 mock 체인
      const mockQueryBuilder1 = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '5' }),
      }

      const mockQueryBuilder2 = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: '4.5' }),
      }

      const mockQueryBuilder3 = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([
            { month: '2025-12', reviewCount: '10', restaurantCount: '5', averageRating: '4.5' },
          ]),
      }

      const mockQueryBuilder4 = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ name: '맛집', rating: '5.0', category: '한식', visitCount: '3' }]),
      }

      const mockQueryBuilder5 = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest
          .fn()
          .mockResolvedValue([{ createdAt: new Date(), name: '최근 맛집', rating: 4.5 }]),
      }

      mockUserRepository.findOne.mockResolvedValue(mockUser)
      mockMealRecordRepository.count.mockResolvedValue(10)
      mockMealRecordRepository.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder1)
        .mockReturnValueOnce(mockQueryBuilder2)
        .mockReturnValueOnce(mockQueryBuilder3)
        .mockReturnValueOnce(mockQueryBuilder4)
        .mockReturnValueOnce(mockQueryBuilder5)

      const result = await service.getUserStatistics(mockUserId)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('totalReviews')
      expect(result).toHaveProperty('averageRating')
      expect(result).toHaveProperty('monthlyStats')
      expect(result.totalReviews).toBe(10)
    })
  })
})
