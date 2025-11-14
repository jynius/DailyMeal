import sharp from 'sharp'
import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { MealRecord } from '../entities/meal-record.entity'
import { CreateMealRecordDto, UpdateMealRecordDto } from '../dto/meal-record.dto'
import { RealTimeService } from '../realtime/realtime.service'
import { ConfigService } from '../config/config.service'

@Injectable()
export class MealRecordsService {
  private readonly logger = new Logger(MealRecordsService.name)

  constructor(
    @InjectRepository(MealRecord)
    private readonly mealRecordRepository: Repository<MealRecord>,
    private readonly realTimeService: RealTimeService,
    private readonly configService: ConfigService
  ) {}

  /**
   * MealRecord 엔티티의 이미지 URL을 변환
   */
  private transformMealRecord(mealRecord: MealRecord): MealRecord {
    return {
      ...mealRecord,
      photo: this.configService.transformImageUrl(mealRecord.photo) || null,
    }
  }

  async create(
    createMealRecordDto: CreateMealRecordDto,
    userId: string,
    photos?: string[],
    fullPhotoPaths?: string[]
  ) {
    // EXIF에서 촬영 시간 추출
    let photoTakenAt: Date | undefined
    if (fullPhotoPaths && fullPhotoPaths.length > 0) {
      try {
        const metadata = await sharp(fullPhotoPaths[0]).metadata()
        if (metadata.exif) {
          // exif-parser-js와 유사한 로직으로 파싱
          const exifString = metadata.exif.toString('utf-8')
          // eslint-disable-next-line no-control-regex
          const dateTimeRegex = /DateTimeOriginal\x00(....:..:.. ..:..:..)/
          const match = dateTimeRegex.exec(exifString)
          if (match?.[1]) {
            const [datePart, timePart] = match[1].split(' ')
            const [year, month, day] = datePart.split(':')
            photoTakenAt = new Date(`${year}-${month}-${day}T${timePart}`)
          }
        }
      } catch (error) {
        this.logger.error('Error reading image metadata:', error)
      }
    }

    const mealRecord = this.mealRecordRepository.create({
      id: uuidv4(), // UUID 명시적 생성
      ...createMealRecordDto,
      userId,
      photo: photos && photos.length > 0 ? photos[0] : undefined, // 첫 번째 사진을 메인 사진으로
      photos: photos || [], // 모든 사진들
      photoTakenAt, // 추출한 촬영 시간 저장
    })

    const saved = await this.mealRecordRepository.save(mealRecord)
    const transformed = this.transformMealRecord(saved)

    // 실시간 알림 전송
    this.realTimeService.notifyNewMeal({
      id: saved.id,
      name: saved.name,
      photo: transformed.photo,
      userId: saved.userId,
      createdAt: saved.createdAt,
    })

    return transformed
  }

  async findAll(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [mealRecords, total] = await this.mealRecordRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    })

    return {
      data: mealRecords.map((record) => this.transformMealRecord(record)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string, userId: string) {
    const mealRecord = await this.mealRecordRepository.findOne({
      where: { id, userId },
    })

    if (!mealRecord) {
      throw new NotFoundException('식사 기록을 찾을 수 없습니다')
    }

    return this.transformMealRecord(mealRecord)
  }

  async update(id: string, updateMealRecordDto: UpdateMealRecordDto, userId: string) {
    const mealRecord = await this.findOne(id, userId)

    if (mealRecord.userId !== userId) {
      throw new ForbiddenException('이 식사 기록을 수정할 권한이 없습니다')
    }

    Object.assign(mealRecord, updateMealRecordDto)
    return await this.mealRecordRepository.save(mealRecord)
  }

  async remove(id: string, userId: string) {
    const mealRecord = await this.findOne(id, userId)

    if (mealRecord.userId !== userId) {
      throw new ForbiddenException('이 식사 기록을 삭제할 권한이 없습니다')
    }

    await this.mealRecordRepository.remove(mealRecord)
    return { message: '식사 기록이 삭제되었습니다' }
  }

  async search(userId: string, query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

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
      .getManyAndCount()

    return {
      data: mealRecords,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getStatistics(userId: string) {
    const totalRecords = await this.mealRecordRepository.count({
      where: { userId },
    })

    const avgRatingResult = await this.mealRecordRepository
      .createQueryBuilder('mealRecord')
      .select('AVG(mealRecord.rating)', 'avgRating')
      .where('mealRecord.userId = :userId', { userId })
      .getRawOne<{ avgRating: string }>()

    const uniqueLocationsResult = await this.mealRecordRepository
      .createQueryBuilder('mealRecord')
      .select('COUNT(DISTINCT mealRecord.location)', 'uniqueLocations')
      .where('mealRecord.userId = :userId', { userId })
      .andWhere('mealRecord.location IS NOT NULL')
      .getRawOne<{ uniqueLocations: string }>()

    return {
      totalRecords,
      avgRating: Number.parseFloat(avgRatingResult?.avgRating || '0').toFixed(1),
      uniqueLocations: Number.parseInt(uniqueLocationsResult?.uniqueLocations || '0', 10),
    }
  }

  async getFrequentLocations(userId: string) {
    interface LocationResult {
      location: string
      count: string
      latitude: string | null
      longitude: string | null
      address: string | null
    }

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
      .getRawMany<LocationResult>()

    return locations.map((loc) => ({
      location: loc.location,
      count: Number.parseInt(loc.count, 10),
      latitude: loc.latitude ? Number.parseFloat(loc.latitude) : undefined,
      longitude: loc.longitude ? Number.parseFloat(loc.longitude) : undefined,
      address: loc.address || undefined,
    }))
  }
}
