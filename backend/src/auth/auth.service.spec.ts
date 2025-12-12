import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { User } from '../entities/user.entity'
import { UserSettings } from '../entities/user-settings.entity'
import { UnauthorizedException, ConflictException } from '@nestjs/common'

// Mock bcrypt module
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}))

import * as bcrypt from 'bcryptjs'

describe('AuthService', () => {
  let service: AuthService
  let usersService: UsersService
  let jwtService: JwtService
  let userRepository: Repository<User>

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$10$hashedpassword', // bcrypt hashed password
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((userData) => userData),
    save: jest.fn().mockImplementation((user) => Promise.resolve({ ...mockUser, ...user })),
  }

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserSettings),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    usersService = module.get<UsersService>(UsersService)
    jwtService = module.get<JwtService>(JwtService)
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('register', () => {
    const createUserDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    }

    it('회원가입 성공 - 새 사용자 생성', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)
      mockJwtService.sign.mockReturnValue('jwt-token')

      const result = await service.register(createUserDto)

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
      expect(result.user.email).toBe(createUserDto.email)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      })
      expect(mockUserRepository.save).toHaveBeenCalled()
    })

    it('회원가입 실패 - 이메일 중복', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      await expect(service.register(createUserDto)).rejects.toThrow(UnauthorizedException)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      })
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('로그인 성공 - 올바른 이메일과 비밀번호', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      mockJwtService.sign.mockReturnValue('jwt-token')

      const result = await service.login(loginDto)

      expect(result).toHaveProperty('token', 'jwt-token')
      expect(result).toHaveProperty('user')
      expect(result.user.email).toBe(loginDto.email)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      })
    })

    it('로그인 실패 - 존재하지 않는 이메일', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      })
    })

    it('로그인 실패 - 잘못된 비밀번호', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('validateUser', () => {
    it('유효한 사용자 검증 성공', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.validateUser(mockUser.id)

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      })
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      })
    })

    it('유효하지 않은 사용자 ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(null)

      await expect(service.validateUser('invalid-id')).rejects.toThrow(UnauthorizedException)
    })
  })
})
