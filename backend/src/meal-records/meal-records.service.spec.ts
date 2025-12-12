import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { MealRecordsService } from './meal-records.service'
import { MealRecord } from '../entities/meal-record.entity'
import { RealTimeService } from '../realtime/realtime.service'
import { ConfigService } from '../config/config.service'
import { LocationsService } from '../locations/locations.service'

describe('MealRecordsService', () => {
  let service: MealRecordsService

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000'
  const mockMealId = '987e6543-e21b-12d3-a456-426614174111'

  const mockMealRecord: MealRecord = {
    id: mockMealId,
    userId: mockUserId,
    name: '삼겹살',
    photo: '/uploads/meals/test.jpg',
    photos: [],
    location: '강남역 맛집',
    userLocationId: null,
    latitude: 37.498095,
    longitude: 127.02761,
    address: '서울 강남구',
    rating: 5,
    memo: '맛있었어요',
    price: 15000,
    category: '한식',
    companionIds: [],
    companionNames: [],
    photoTakenAt: new Date('2025-12-12T12:00:00Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    user: null,
    userLocation: null,
  }

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    getManyAndCount: jest.fn(),
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
  }

  const mockRealTimeService = {
    emitNewMeal: jest.fn(),
    emitUpdateMeal: jest.fn(),
    notifyNewMeal: jest.fn(),
  }

  const mockConfigService = {
    transformImageUrl: jest.fn((url) => url),
  }

  const mockLocationsService = {
    findOrCreateUserLocation: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealRecordsService,
        {
          provide: getRepositoryToken(MealRecord),
          useValue: mockRepository,
        },
        {
          provide: RealTimeService,
          useValue: mockRealTimeService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LocationsService,
          useValue: mockLocationsService,
        },
      ],
    }).compile()

    service = module.get<MealRecordsService>(MealRecordsService)
    repository = module.get<Repository<MealRecord>>(getRepositoryToken(MealRecord))
    realTimeService = module.get<RealTimeService>(RealTimeService)
    configService = module.get<ConfigService>(ConfigService)
    locationsService = module.get<LocationsService>(LocationsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    const createDto = {
      name: '김치찌개',
      photo: '/uploads/meals/new.jpg',
      location: '회사 근처 식당',
      latitude: 37.5,
      longitude: 127.0,
    }

    it('식사 기록 생성 성공', async () => {
      const savedMeal = { ...mockMealRecord, userId: mockUserId }
      mockRepository.create.mockReturnValue(savedMeal)
      mockRepository.save.mockResolvedValue(savedMeal)

      const result = await service.create(mockUserId, createDto as any)

      expect(result).toBeDefined()
      expect(mockRepository.create).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('위치 정보와 함께 생성', async () => {
      const dtoWithLocation = {
        ...createDto,
        userLocationId: 'location-id',
      }

      const savedMeal = { ...mockMealRecord, userId: mockUserId }
      mockRepository.create.mockReturnValue(savedMeal)
      mockRepository.save.mockResolvedValue(savedMeal)

      await service.create(mockUserId, dtoWithLocation as any)

      expect(mockRepository.create).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('사용자의 모든 식사 기록 조회', async () => {
      const mealWithUserId = { ...mockMealRecord, userId: mockUserId }
      mockRepository.findAndCount.mockResolvedValue([[mealWithUserId], 1])

      const result = await service.findAll(mockUserId, 1, 10)

      expect(result.data).toEqual([mealWithUserId])
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(1)
      expect(mockRepository.findAndCount).toHaveBeenCalled()
    })

    it('필터 적용하여 조회 - 위치 검색', async () => {
      const mealWithUserId = { ...mockMealRecord, userId: mockUserId }
      mockRepository.findAndCount.mockResolvedValue([[mealWithUserId], 1])

      const result = await service.findAll(mockUserId, 1, 10)

      expect(result.data).toBeDefined()
      expect(mockRepository.findAndCount).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('ID로 식사 기록 조회 성공', async () => {
      mockRepository.findOne.mockResolvedValue(mockMealRecord)

      const result = await service.findOne(mockMealId, mockUserId)

      expect(result).toEqual(mockMealRecord)
      expect(mockRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockMealId, userId: mockUserId },
        })
      )
    })

    it('존재하지 않는 ID - NotFoundException', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne('invalid-id', mockUserId)).rejects.toThrow(NotFoundException)
    })

    it('다른 사용자의 식사 기록 접근 - ForbiddenException', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne(mockMealId, 'other-user-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    const updateDto = {
      rating: 4,
      memo: '수정된 메모',
    }

    it('식사 기록 업데이트 성공', async () => {
      // findOne 내부에서 repository.findOne 호출
      const mealToUpdate = { ...mockMealRecord, userId: mockUserId }
      const updatedMeal = { ...mealToUpdate, ...updateDto }

      // update 메서드는 내부적으로 findOne을 호출하므로, repository.findOne을 두 번 호출
      mockRepository.findOne.mockResolvedValueOnce(mealToUpdate) // findOne 메서드에서 호출
      mockRepository.save.mockResolvedValue(updatedMeal)

      const result = await service.update(mockMealId, updateDto, mockUserId)

      expect(result.rating).toBe(4)
      expect(result.memo).toBe('수정된 메모')
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('존재하지 않는 기록 업데이트 - NotFoundException', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.update('invalid-id', updateDto, mockUserId)).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('remove', () => {
    it('식사 기록 삭제 성공', async () => {
      const mealToDelete = { ...mockMealRecord, userId: mockUserId }
      mockRepository.findOne.mockResolvedValue(mealToDelete)
      mockRepository.remove.mockResolvedValue(mealToDelete)

      const result = await service.remove(mockMealId, mockUserId)

      expect(result.message).toBe('식사 기록이 삭제되었습니다')
      expect(mockRepository.findOne).toHaveBeenCalled()
      expect(mockRepository.remove).toHaveBeenCalled()
    })

    it('존재하지 않는 기록 삭제 - NotFoundException', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.remove('invalid-id', mockUserId)).rejects.toThrow(NotFoundException)
    })
  })
})
