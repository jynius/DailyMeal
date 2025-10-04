import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealRecord } from '../entities/meal-record.entity';
import { CreateMealRecordDto, UpdateMealRecordDto } from '../dto/meal-record.dto';

@Injectable()
export class MealRecordsService {
  constructor(
    @InjectRepository(MealRecord)
    private mealRecordRepository: Repository<MealRecord>,
  ) {}

  async create(
    createMealRecordDto: CreateMealRecordDto,
    userId: string,
    photo?: string,
  ) {
    const mealRecord = this.mealRecordRepository.create({
      ...createMealRecordDto,
      userId,
      photo,
    });

    return await this.mealRecordRepository.save(mealRecord);
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
      data: mealRecords,
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

    return mealRecord;
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

  async search(userId: string, query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [mealRecords, total] = await this.mealRecordRepository
      .createQueryBuilder('mealRecord')
      .where('mealRecord.userId = :userId', { userId })
      .andWhere(
        '(mealRecord.name ILIKE :query OR mealRecord.location ILIKE :query OR mealRecord.memo ILIKE :query)',
        { query: `%${query}%` }
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
}