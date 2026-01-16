import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { resolve, join } from 'path'
import { existsSync, readFileSync } from 'fs'
import ExifReader from 'exifreader'
import { MealRecord } from '../src/entities/meal-record.entity'

/**
 * 기존 식사 기록의 사진에서 EXIF 메타데이터를 재추출하여 DB 업데이트
 * 
 * 실행 방법:
 * npx ts-node scripts/reprocess-photo-metadata.ts
 */

// .env 파일 로드
config()

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'dailymeal',
  entities: [resolve(__dirname, '../src/entities/*.entity.ts')],
  synchronize: false,
})

/**
 * GPS 좌표 유효성 검증
 */
function isValidGPSCoordinate(latitude: number, longitude: number): boolean {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return false
  }
  // (0, 0) 좌표는 대부분 EXIF 오류
  if (Math.abs(latitude) < 0.001 && Math.abs(longitude) < 0.001) {
    return false
  }
  return true
}

/**
 * 사진 파일에서 EXIF 메타데이터 추출
 */
function extractPhotoMetadata(
  filePath: string
): { photoTakenAt?: Date; latitude?: number; longitude?: number } {
  try {
    const fileBuffer = readFileSync(filePath)
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

      if (isNaN(photoTakenAt.getTime())) {
        photoTakenAt = undefined
      }
    }

    // GPS 위치 추출
    if (tags.GPSLatitude && tags.GPSLongitude) {
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
        if (!isValidGPSCoordinate(latitude, longitude)) {
          latitude = undefined
          longitude = undefined
        }
      }
    }

    return { photoTakenAt, latitude, longitude }
  } catch (error) {
    return {}
  }
}

/**
 * 메인 실행 함수
 */
async function reprocessPhotoMetadata() {
  console.log('🔄 사진 메타데이터 재처리 시작...\n')

  try {
    await dataSource.initialize()
    console.log('✅ DB 연결 성공\n')

    const mealRecordRepo = dataSource.getRepository(MealRecord)

    // 사진이 있지만 메타데이터가 없는 기록들 조회
    const records = await mealRecordRepo
      .createQueryBuilder('meal')
      .where('meal.photo IS NOT NULL')
      .andWhere(
        '(meal.photoTakenAt IS NULL OR meal.latitude IS NULL OR meal.longitude IS NULL)'
      )
      .getMany()

    console.log(`📊 처리 대상: ${records.length}개 식사 기록\n`)

    if (records.length === 0) {
      console.log('✅ 재처리가 필요한 기록이 없습니다.')
      return
    }

    let updatedCount = 0
    let skippedCount = 0
    // 운영 서버는 /data/uploads, 로컬은 backend/uploads
    const uploadDir = process.env.NODE_ENV === 'production' 
      ? '/data/uploads'
      : resolve(__dirname, '../uploads')

    for (const record of records) {
      const photoPath = record.photo
      if (!photoPath) {
        skippedCount++
        continue
      }

      // URL 또는 경로에서 실제 파일 경로 추출
      let relativePath = photoPath
        .replace(/^https?:\/\/[^/]+/, '') // URL 제거
        .replace(/^\/api/, '') // /api 제거
        .replace(/^\//, '') // 선행 슬래시 제거
      
      // uploads가 이미 포함되어 있는지 확인
      if (!relativePath.startsWith('uploads')) {
        relativePath = `uploads/${relativePath}`
      }

      const fullPath = join(uploadDir, relativePath.replace(/^uploads\//, ''))

      if (!existsSync(fullPath)) {
        console.log(`⚠️  파일 없음: ${record.id.substring(0, 8)} - ${photoPath}`)
        console.log(`   시도한 경로: ${fullPath}`)
        skippedCount++
        continue
      }

      // EXIF 메타데이터 추출
      const metadata = extractPhotoMetadata(fullPath)

      // 업데이트할 데이터가 있는지 확인
      let hasUpdate = false
      const updates: Partial<MealRecord> = {}

      if (metadata.photoTakenAt && !record.photoTakenAt) {
        updates.photoTakenAt = metadata.photoTakenAt
        hasUpdate = true
      }

      if (metadata.latitude && metadata.longitude && !record.latitude) {
        if (isValidGPSCoordinate(metadata.latitude, metadata.longitude)) {
          updates.latitude = metadata.latitude
          updates.longitude = metadata.longitude
          hasUpdate = true
        }
      }

      if (hasUpdate) {
        await mealRecordRepo.update(record.id, updates)
        updatedCount++

        const logParts: string[] = [`✅ 업데이트: ${record.name} (${record.id.substring(0, 8)})`]
        if (updates.photoTakenAt) {
          logParts.push(`촬영시간: ${updates.photoTakenAt.toISOString()}`)
        }
        if (updates.latitude && updates.longitude) {
          logParts.push(`GPS: (${updates.latitude.toFixed(6)}, ${updates.longitude.toFixed(6)})`)
        }
        console.log(logParts.join(' | '))
      } else {
        skippedCount++
        // 스킵 사유 로그
        const skipReasons: string[] = []
        if (record.photoTakenAt) skipReasons.push('이미 촬영시간 있음')
        if (record.latitude) skipReasons.push('이미 GPS 있음')
        if (!metadata.photoTakenAt && !metadata.latitude) skipReasons.push('EXIF 없음')
        console.log(`⏭️  스킵: ${record.name} (${record.id.substring(0, 8)}) - ${skipReasons.join(', ')}`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`📊 재처리 완료:`)
    console.log(`   - 업데이트: ${updatedCount}개`)
    console.log(`   - 스킵: ${skippedCount}개`)
    console.log(`   - 전체: ${records.length}개`)
    console.log('='.repeat(60))
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    throw error
  } finally {
    await dataSource.destroy()
  }
}

// 실행
reprocessPhotoMetadata()
  .then(() => {
    console.log('\n✅ 스크립트 실행 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error)
    process.exit(1)
  })
