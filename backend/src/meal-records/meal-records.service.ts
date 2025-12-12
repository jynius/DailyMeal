import * as ExifReader from 'exifreader'
import * as fs from 'fs'
import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { MealRecord } from '../entities/meal-record.entity'
import { CreateMealRecordDto, UpdateMealRecordDto } from '../dto/meal-record.dto'
import { RealTimeService } from '../realtime/realtime.service'
import { ConfigService } from '../config/config.service'
import { LocationsService } from '../locations/locations.service'

@Injectable()
export class MealRecordsService {
  private readonly logger = new Logger(MealRecordsService.name)

  constructor(
    @InjectRepository(MealRecord)
    private readonly mealRecordRepository: Repository<MealRecord>,
    private readonly realTimeService: RealTimeService,
    private readonly configService: ConfigService,
    private readonly locationsService: LocationsService
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

  /**
   * GPS 좌표 유효성 검증 (명백히 잘못된 위치 필터링)
   */
  private isValidGPSCoordinate(latitude: number, longitude: number): boolean {
    // 위도: -90 ~ 90, 경도: -180 ~ 180
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return false
    }

    // (0, 0) 좌표는 대부분 EXIF 오류 (기니만 남서쪽 해상)
    if (Math.abs(latitude) < 0.001 && Math.abs(longitude) < 0.001) {
      return false
    }

    return true
  }

  /**
   * 두 GPS 좌표 간 거리 계산 (Haversine formula, km 단위)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // 지구 반경 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * 여러 사진의 시간/위치 일관성 검증
   * @returns 경고 메시지 배열
   */
  private validatePhotoConsistency(
    metadata: Array<{ photoTakenAt?: Date; latitude?: number; longitude?: number }>
  ): string[] {
    const warnings: string[] = []
    const validTimes = metadata.filter((m) => m.photoTakenAt).map((m) => m.photoTakenAt!)
    const validLocations = metadata.filter((m) => m.latitude && m.longitude)

    // 촬영 시간 일관성 (30분 이내)
    if (validTimes.length > 1) {
      const timeSpan =
        Math.max(...validTimes.map((t) => t.getTime())) -
        Math.min(...validTimes.map((t) => t.getTime()))
      const timeSpanMinutes = timeSpan / (1000 * 60)

      if (timeSpanMinutes > 30) {
        const message = `사진 촬영 시간이 ${timeSpanMinutes.toFixed(0)}분 차이 납니다. 다른 식사의 사진이 섞여있을 수 있습니다.`
        this.logger.warn(`⚠️  ${message}`)
        warnings.push(message)
      } else {
        this.logger.debug(`✅ 사진 시간 일관성 OK (${timeSpanMinutes.toFixed(0)}분 이내)`)
      }
    }

    // 위치 일관성 (500m 이내)
    if (validLocations.length > 1) {
      const distances: number[] = []
      for (let i = 0; i < validLocations.length - 1; i++) {
        for (let j = i + 1; j < validLocations.length; j++) {
          const dist = this.calculateDistance(
            validLocations[i].latitude!,
            validLocations[i].longitude!,
            validLocations[j].latitude!,
            validLocations[j].longitude!
          )
          distances.push(dist)
        }
      }

      const maxDistance = Math.max(...distances)
      if (maxDistance > 0.5) {
        // 500m 이상
        const distanceText =
          maxDistance > 1 ? `${maxDistance.toFixed(1)}km` : `${(maxDistance * 1000).toFixed(0)}m`
        const message = `사진 촬영 위치가 최대 ${distanceText} 떨어져 있습니다. 다른 장소의 사진이 섞여있을 수 있습니다.`
        this.logger.warn(`⚠️  ${message}`)
        warnings.push(message)
      } else {
        this.logger.debug(`✅ 사진 위치 일관성 OK (${(maxDistance * 1000).toFixed(0)}m 이내)`)
      }
    }

    return warnings
  }

  /**
   * 사진에서 EXIF 메타데이터 추출 (촬영 시간, GPS 위치)
   */
  private extractPhotoMetadata(filePath: string): {
    photoTakenAt?: Date
    latitude?: number
    longitude?: number
  } {
    try {
      const fileBuffer = fs.readFileSync(filePath)
      const tags = ExifReader.load(fileBuffer)

      let photoTakenAt: Date | undefined
      let latitude: number | undefined
      let longitude: number | undefined

      // 촬영 시간 추출
      if (tags.DateTimeOriginal?.description) {
        const dateTimeStr = tags.DateTimeOriginal.description
        // EXIF 날짜 형식: "YYYY:MM:DD HH:MM:SS"
        const [datePart, timePart] = dateTimeStr.split(' ')
        const [year, month, day] = datePart.split(':')
        photoTakenAt = new Date(`${year}-${month}-${day}T${timePart}`)
        this.logger.debug(`📅 촬영 시간: ${photoTakenAt.toISOString()}`)
      }

      // GPS 위치 추출
      if (tags.GPSLatitude && tags.GPSLongitude) {
        // GPSLatitude/Longitude는 배열 형태 [degrees, minutes, seconds]
        const latValues: unknown = tags.GPSLatitude.description
        const lonValues: unknown = tags.GPSLongitude.description
        const latRef = tags.GPSLatitudeRef?.value?.[0] || 'N'
        const lonRef = tags.GPSLongitudeRef?.value?.[0] || 'E'

        // DMS (Degrees, Minutes, Seconds)를 Decimal Degrees로 변환
        const parseCoordinate = (coord: number[]): number => {
          const [degrees, minutes, seconds] = coord
          return degrees + minutes / 60 + seconds / 3600
        }

        if (Array.isArray(latValues) && Array.isArray(lonValues)) {
          latitude = parseCoordinate(latValues as number[])
          longitude = parseCoordinate(lonValues as number[])

          // 남반구/서반구인 경우 음수로 변환
          if (latRef === 'S') latitude = -latitude
          if (lonRef === 'W') longitude = -longitude

          // GPS 좌표 유효성 검증
          if (!this.isValidGPSCoordinate(latitude, longitude)) {
            this.logger.warn(`⚠️  잘못된 GPS 좌표 무시: ${latitude}, ${longitude}`)
            latitude = undefined
            longitude = undefined
          } else {
            this.logger.debug(`📍 GPS 위치: ${latitude}, ${longitude}`)
          }
        }
      }

      return { photoTakenAt, latitude, longitude }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.warn(`EXIF 메타데이터 추출 실패: ${errorMessage}`)
      return {}
    }
  }

  async create(
    createMealRecordDto: CreateMealRecordDto,
    userId: string,
    photos?: string[],
    fullPhotoPaths?: string[]
  ) {
    // 경고 메시지 수집
    const warnings: string[] = []

    // 모든 사진의 EXIF 메타데이터 추출
    let photoTakenAt: Date | undefined
    let extractedLatitude: number | undefined
    let extractedLongitude: number | undefined
    const allMetadata: Array<{ photoTakenAt?: Date; latitude?: number; longitude?: number }> = []

    if (fullPhotoPaths && fullPhotoPaths.length > 0) {
      // 각 사진의 메타데이터 추출
      for (const filePath of fullPhotoPaths) {
        const metadata = this.extractPhotoMetadata(filePath)
        allMetadata.push(metadata)
      }

      // 첫 번째 유효한 데이터를 기본값으로 사용
      const firstValidMetadata = allMetadata.find((m) => m.photoTakenAt || m.latitude)
      if (firstValidMetadata) {
        photoTakenAt = firstValidMetadata.photoTakenAt
        extractedLatitude = firstValidMetadata.latitude
        extractedLongitude = firstValidMetadata.longitude
      }

      // 여러 사진의 시간/위치 일관성 검증
      if (allMetadata.length > 1) {
        const consistencyWarnings = this.validatePhotoConsistency(allMetadata)
        warnings.push(...consistencyWarnings)
      }

      // 사용자 입력 vs EXIF 불일치 경고
      if (
        createMealRecordDto.latitude &&
        createMealRecordDto.longitude &&
        extractedLatitude &&
        extractedLongitude
      ) {
        const distance = this.calculateDistance(
          createMealRecordDto.latitude,
          createMealRecordDto.longitude,
          extractedLatitude,
          extractedLongitude
        )
        if (distance > 10) {
          // 10km 이상 차이
          const message = `입력하신 위치와 사진 촬영 위치가 ${distance.toFixed(1)}km 떨어져 있습니다.`
          this.logger.warn(
            `⚠️  ${message} ` +
              `사용자: (${createMealRecordDto.latitude}, ${createMealRecordDto.longitude}), ` +
              `EXIF: (${extractedLatitude}, ${extractedLongitude})`
          )
          warnings.push(message)
        }
      }

      // EXIF에서 GPS 추출 성공 시 알림
      if (extractedLatitude && extractedLongitude && !createMealRecordDto.latitude) {
        this.logger.log(
          `✅ 사진에서 GPS 위치 자동 추출: (${extractedLatitude}, ${extractedLongitude})`
        )
      }

      // EXIF에서 촬영 시간 추출 성공 시 알림
      if (photoTakenAt) {
        this.logger.log(`✅ 사진 촬영 시간 자동 추출: ${photoTakenAt.toISOString()}`)
      }
    }

    // GPS 좌표가 추출되었고 사용자가 위치를 제공하지 않은 경우 자동으로 설정
    // 사용자 입력이 있으면 우선 사용 (사용자가 의도적으로 수정했을 수 있음)
    const finalLatitude = createMealRecordDto.latitude ?? extractedLatitude
    const finalLongitude = createMealRecordDto.longitude ?? extractedLongitude

    // location이 있으면 UserLocation 생성 또는 찾기
    let userLocationId: string | undefined
    if (createMealRecordDto.location && finalLatitude && finalLongitude) {
      try {
        const userLocation = await this.locationsService.createUserLocation({
          userId,
          name: createMealRecordDto.location,
          address: createMealRecordDto.address,
          latitude: finalLatitude,
          longitude: finalLongitude,
        })
        userLocationId = userLocation.id
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        this.logger.warn(`Failed to create user location: ${errorMessage}`)
      }
    }

    const mealRecord = this.mealRecordRepository.create({
      id: uuidv4(), // UUID 명시적 생성
      ...createMealRecordDto,
      userId,
      userLocationId, // 새로운 location 시스템 연결
      photo: photos && photos.length > 0 ? photos[0] : undefined, // 첫 번째 사진을 메인 사진으로
      photos: photos || [], // 모든 사진들
      photoTakenAt, // 추출한 촬영 시간 저장
      latitude: finalLatitude, // EXIF GPS 또는 사용자 입력
      longitude: finalLongitude, // EXIF GPS 또는 사용자 입력
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

    // 경고가 있으면 응답에 포함
    return {
      data: transformed,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
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
