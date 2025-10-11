/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealRecord } from '../entities/meal-record.entity';
import {
  CreateMealRecordDto,
  UpdateMealRecordDto,
} from '../dto/meal-record.dto';
import { RealTimeService } from '../realtime/realtime.service';

@Injectable()
export class MealRecordsService {
  constructor(
    @InjectRepository(MealRecord)
    private mealRecordRepository: Repository<MealRecord>,
    private realTimeService: RealTimeService,
  ) {}

  /**
   * 이미지 경로를 환경에 맞게 변환
   * - 개발: 절대 URL (http://localhost:8000/uploads/...)
   * - 프로덕션: 상대 경로 (/api/uploads/...) - Nginx가 프록시
   */
  private transformImageUrl(photo: string | null): string | null {
    if (!photo) return null;

    // 이미 절대 URL인 경우
    if (photo.startsWith('http')) {
      return photo;
    }

    // 프로덕션 환경: 상대 경로 반환
    if (process.env.NODE_ENV === 'production') {
      // /uploads/... -> /api/uploads/...
      return photo.startsWith('/uploads') ? `/api${photo}` : photo;
    }

    // 개발 환경: 절대 URL 반환
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    return `${baseUrl}${photo}`;
  }

  /**
   * MealRecord 엔티티의 이미지 URL을 변환
   */
  private transformMealRecord(mealRecord: MealRecord): any {
    return {
      ...mealRecord,
      photo: this.transformImageUrl(mealRecord.photo),
    };
  }

  async create(
    createMealRecordDto: CreateMealRecordDto,
    userId: string,
    photos?: string[],
  ) {
    // UUID 수동 생성 (데이터베이스 제약 조건 문제 해결)
    const { v4: uuidv4 } = require('uuid');
    
    const mealRecord = this.mealRecordRepository.create({
      id: uuidv4(), // UUID 명시적 생성
      ...createMealRecordDto,
      userId,
      photo: photos && photos.length > 0 ? photos[0] : undefined, // 첫 번째 사진을 메인 사진으로
      photos: photos || [], // 모든 사진들
    });

    const saved = await this.mealRecordRepository.save(mealRecord);
    const transformed = this.transformMealRecord(saved);

    // 실시간 알림 전송
    this.realTimeService.notifyNewMeal({
      id: saved.id,
      name: saved.name,
      photo: transformed.photo,
      userId: saved.userId,
      createdAt: saved.createdAt,
    });

    return transformed;
  }

  async findAll(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [mealRecords, total] = await this.mealRecordRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: mealRecords.map((record) => this.transformMealRecord(record)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const mealRecord = await this.mealRecordRepository.findOne({
      where: { id, userId },
    });

    if (!mealRecord) {
      throw new NotFoundException('식사 기록을 찾을 수 없습니다');
    }

    return this.transformMealRecord(mealRecord);
  }

  async update(
    id: string,
    updateMealRecordDto: UpdateMealRecordDto,
    userId: string,
  ) {
    const mealRecord = await this.findOne(id, userId);

    if (mealRecord.userId !== userId) {
      throw new ForbiddenException('이 식사 기록을 수정할 권한이 없습니다');
    }

    Object.assign(mealRecord, updateMealRecordDto);
    return await this.mealRecordRepository.save(mealRecord);
  }

  async remove(id: string, userId: string) {
    const mealRecord = await this.findOne(id, userId);

    if (mealRecord.userId !== userId) {
      throw new ForbiddenException('이 식사 기록을 삭제할 권한이 없습니다');
    }

    await this.mealRecordRepository.remove(mealRecord);
    return { message: '식사 기록이 삭제되었습니다' };
  }

  async search(
    userId: string,
    query: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [mealRecords, total] = await this.mealRecordRepository
      .createQueryBuilder('mealRecord')
      .where('mealRecord.userId = :userId', { userId })
      .andWhere(
        '(mealRecord.name ILIKE :query OR mealRecord.location ILIKE :query OR mealRecord.memo ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('mealRecord.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: mealRecords,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStatistics(userId: string) {
    const totalRecords = await this.mealRecordRepository.count({
      where: { userId },
    });

    const avgRatingResult = await this.mealRecordRepository
      .createQueryBuilder('mealRecord')
      .select('AVG(mealRecord.rating)', 'avgRating')
      .where('mealRecord.userId = :userId', { userId })
      .getRawOne();

    const uniqueLocationsResult = await this.mealRecordRepository
      .createQueryBuilder('mealRecord')
      .select('COUNT(DISTINCT mealRecord.location)', 'uniqueLocations')
      .where('mealRecord.userId = :userId', { userId })
      .andWhere('mealRecord.location IS NOT NULL')
      .getRawOne();

    return {
      totalRecords,
      avgRating: parseFloat(avgRatingResult?.avgRating || '0').toFixed(1),
      uniqueLocations: parseInt(uniqueLocationsResult?.uniqueLocations || '0'),
    };
  }

  async getFrequentLocations(userId: string) {
    const locations = await this.mealRecordRepository
      .createQueryBuilder('mealRecord')
      .select('mealRecord.location', 'location')
      .addSelect('COUNT(*)', 'count')
      .addSelect('MAX(mealRecord.latitude)', 'latitude')
      .addSelect('MAX(mealRecord.longitude)', 'longitude')
      .addSelect('MAX(mealRecord.address)', 'address')
      .where('mealRecord.userId = :userId', { userId })
      .andWhere('mealRecord.location IS NOT NULL')
      .andWhere('mealRecord.location != :empty', { empty: '' })
      .groupBy('mealRecord.location')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    return locations.map((loc) => ({
      location: loc.location,
      count: parseInt(loc.count),
      latitude: loc.latitude ? parseFloat(loc.latitude) : undefined,
      longitude: loc.longitude ? parseFloat(loc.longitude) : undefined,
      address: loc.address || undefined,
    }));
  }
}
