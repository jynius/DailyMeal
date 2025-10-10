import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { CreateUserDto, LoginDto } from '../dto/user.dto';
import { AppLoggerService, LogMethod } from '../common/logger.service';

@Injectable()
export class AuthService {
  private readonly logger = AppLoggerService.getLogger('AuthService');

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  @LogMethod()
  async register(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    // 이미 존재하는 이메일 확인
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('이미 존재하는 이메일입니다');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    await this.userRepository.save(user);

    // JWT 토큰 생성
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      message: '회원가입이 완료되었습니다',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  @LogMethod()
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 사용자 찾기
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다',
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다',
      );
    }

    // JWT 토큰 생성
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      message: '로그인이 완료되었습니다',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  @LogMethod()
  async validateUser(userId: string) {
    this.logger.debug(`Validating user with ID: ${userId}`);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(`User not found with ID: ${userId}`);
      throw new UnauthorizedException('유효하지 않은 사용자입니다');
    }

    this.logger.debug(`User validated: ${user.email}`);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
