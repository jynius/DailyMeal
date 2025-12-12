/**
 * Phase 2: 데이터 마이그레이션 스크립트
 * 
 * 기존 데이터를 새로운 location 시스템으로 마이그레이션:
 * 1. kakao_places → location_groups + external_place_mappings
 * 2. meal_records.location → user_locations
 * 3. meal_records.userLocationId 연결
 */

import 'dotenv/config'
import { DataSource } from 'typeorm'
import { dataSourceOptions } from '../data-source'

interface KakaoPlace {
  placeId: string
  placeName: string
  latitude: number
  longitude: number
  addressName?: string
  categoryName?: string
}

interface MealRecordLegacy {
  id: string
  userId: string
  location: string
  latitude: number
  longitude: number
  address: string
}

interface LocationGroupingResult {
  locationGroupId: string
  userLocationId: string
}

async function migrateData() {
  const dataSource = new DataSource(dataSourceOptions)
  await dataSource.initialize()
  console.log('✅ Database connected')

  try {
    // Step 1: Kakao Places 마이그레이션
    console.log('\n📍 Step 1: Migrating Kakao Places...')
    await migrateKakaoPlaces(dataSource)

    // Step 2: User Locations 마이그레이션 (meal_records 기반)
    console.log('\n👤 Step 2: Migrating User Locations from Meal Records...')
    await migrateMealRecordLocations(dataSource)

    // Step 3: MealRecord와 UserLocation 연결
    console.log('\n🔗 Step 3: Linking Meal Records to User Locations...')
    await linkMealRecordsToUserLocations(dataSource)

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await dataSource.destroy()
  }
}

/**
 * Step 1: Kakao Places를 location_groups와 external_place_mappings로 마이그레이션
 */
async function migrateKakaoPlaces(dataSource: DataSource) {
  const kakaoPlaces = await dataSource.query<KakaoPlace[]>(`
    SELECT "placeId", "placeName", latitude, longitude, "addressName", "categoryName"
    FROM kakao_places
  `)

  console.log(`Found ${kakaoPlaces.length} Kakao places`)

  let migrated = 0
  for (const place of kakaoPlaces) {
    try {
      // 1. location_group 생성
      const [locationGroup] = await dataSource.query(`
        INSERT INTO location_groups (
          "canonicalName", latitude, longitude, address, category, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id
      `, [place.placeName, place.latitude, place.longitude, place.addressName, place.categoryName])

      // 2. external_place_mapping 생성 (Kakao 연결)
      await dataSource.query(`
        INSERT INTO external_place_mappings (
          "locationGroupId", platform, "externalId", "externalName", 
          "externalData", "isActive", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [
        locationGroup.id,
        'kakao',
        place.placeId,
        place.placeName,
        JSON.stringify({
          address: place.addressName,
          category: place.categoryName,
        }),
        true,
      ])

      migrated++
      if (migrated % 100 === 0) {
        console.log(`  ✓ Migrated ${migrated}/${kakaoPlaces.length} places`)
      }
    } catch (error) {
      console.error(`  ✗ Failed to migrate place ${place.placeId}:`, error.message)
    }
  }

  console.log(`✅ Migrated ${migrated} Kakao places to location_groups`)
}

/**
 * Step 2: meal_records의 location을 user_locations로 마이그레이션
 * - 같은 사용자 + 같은 location 이름 → 하나의 user_location
 * - 위치 정보가 있는 경우 location_group 매칭 시도
 */
async function migrateMealRecordLocations(dataSource: DataSource) {
  // 사용자별, 식당 이름별로 그룹화된 meal records
  const locationGroups = await dataSource.query<any[]>(`
    SELECT 
      "userId",
      location,
      MIN(latitude) as latitude,
      MIN(longitude) as longitude,
      MIN(address) as address,
      COUNT(*) as meal_count,
      MIN("createdAt") as first_visit
    FROM meal_records
    WHERE location IS NOT NULL AND location != ''
    GROUP BY "userId", location
    ORDER BY meal_count DESC
  `)

  console.log(`Found ${locationGroups.length} unique user-location combinations`)

  // 임시 매핑 테이블 생성 (루프 시작 전)
  await dataSource.query(`
    CREATE TEMP TABLE IF NOT EXISTS temp_meal_location_mapping (
      "userId" uuid,
      location text,
      "userLocationId" uuid,
      PRIMARY KEY ("userId", location)
    )
  `)

  let created = 0
  for (const group of locationGroups) {
    try {
      // 1. 기존 location_group 찾기 (좌표 기반)
      let locationGroupId = null

      if (group.latitude && group.longitude) {
        // 좌표가 있는 경우: 가까운 location_group 찾기 (50m 이내)
        const nearbyGroups = await dataSource.query(`
          SELECT id, 
            (6371000 * acos(
              cos(radians($1)) * cos(radians(latitude::float)) * 
              cos(radians(longitude::float) - radians($2)) + 
              sin(radians($1)) * sin(radians(latitude::float))
            )) AS distance
          FROM location_groups
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          ORDER BY distance
          LIMIT 1
        `, [group.latitude, group.longitude])

        if (nearbyGroups.length > 0 && nearbyGroups[0].distance < 50) {
          locationGroupId = nearbyGroups[0].id
        }
      }

      // 2. location_group이 없으면 새로 생성
      if (!locationGroupId) {
        // latitude/longitude가 null이면 기본값 사용 (서울 시청)
        const lat = group.latitude || 37.5665
        const lng = group.longitude || 126.9780
        
        const [newGroup] = await dataSource.query(`
          INSERT INTO location_groups (
            "canonicalName", latitude, longitude, address, "createdAt", "updatedAt"
          )
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING id
        `, [
          group.location,
          lat,
          lng,
          group.address,
        ])
        locationGroupId = newGroup.id
      }

      // 3. user_location 생성
      const lat = group.latitude || 37.5665
      const lng = group.longitude || 126.9780
      
      const [userLocation] = await dataSource.query(`
        INSERT INTO user_locations (
          "userId", "locationGroupId", name, address, latitude, longitude,
          "isCustom", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id
      `, [
        group.userId,
        locationGroupId,
        group.location, // 사용자가 입력한 이름 그대로 유지
        group.address,
        lat,
        lng,
        true, // 사용자가 직접 입력한 것으로 간주
      ])

      // 4. meal_records 업데이트 (임시 매핑 테이블에 저장)
      await dataSource.query(`
        INSERT INTO temp_meal_location_mapping ("userId", location, "userLocationId")
        VALUES ($1, $2, $3)
        ON CONFLICT ("userId", location) DO UPDATE SET "userLocationId" = $3
      `, [group.userId, group.location, userLocation.id])

      created++
      if (created % 100 === 0) {
        console.log(`  ✓ Created ${created}/${locationGroups.length} user locations`)
      }
    } catch (error) {
      console.error(`  ✗ Failed to create user location for ${group.userId}/${group.location}:`, error.message)
    }
  }

  console.log(`✅ Created ${created} user locations`)
}

/**
 * Step 3: meal_records의 userLocationId 필드 업데이트
 */
async function linkMealRecordsToUserLocations(dataSource: DataSource) {
  const result = await dataSource.query(`
    UPDATE meal_records mr
    SET "userLocationId" = tml."userLocationId"
    FROM temp_meal_location_mapping tml
    WHERE mr."userId" = tml."userId" 
      AND mr.location = tml.location
      AND mr."userLocationId" IS NULL
  `)

  console.log(`✅ Linked ${result[1]} meal records to user locations`)

  // 임시 테이블 삭제
  await dataSource.query(`DROP TABLE IF EXISTS temp_meal_location_mapping`)
}

// 실행
migrateData()
  .then(() => {
    console.log('\n🎉 All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error)
    process.exit(1)
  })
