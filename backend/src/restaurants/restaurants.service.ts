import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull } from 'typeorm'
import { MealRecord } from '../entities/meal-record.entity'
import { KakaoPlace } from '../entities/kakao-place.entity'
import { AppLoggerService } from '../common/logger.service'
import { LocationsService } from '../locations/locations.service'
import { UserLocation } from '../entities/user-location.entity'
import { ExternalPlatform } from '../entities/external-place-mapping.entity'

export interface RestaurantSummary {
  id: string
  placeId?: string // Kakao placeId 등 외부 플랫폼 ID
  name: string
  address: string
  latitude?: number
  longitude?: number
  category?: string
  averageRating: number
  totalVisits: number
  firstVisit: string
  lastVisit: string
  representativePhoto?: string
  priceRange?: 'budget' | 'mid' | 'expensive'
}

export interface RestaurantMap {
  id: string
  title: string
  description?: string
  restaurants: RestaurantSummary[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
  shareCount: number
  userId: string
  user: {
    id: string
    name: string
    profileImage?: string
  }
  author: {
    name: string
    profileImage?: string
  }
  stats: {
    totalRestaurants: number
    totalVisits: number
    averageRating: number
    categories: string[]
  }
}

@Injectable()
export class RestaurantsService {
  private readonly logger = AppLoggerService.getLogger('RestaurantsService')

  constructor(
    @InjectRepository(MealRecord)
    private mealRecordRepository: Repository<MealRecord>,
    @InjectRepository(KakaoPlace)
    private kakaoPlaceRepository: Repository<KakaoPlace>,
    private locationsService: LocationsService
  ) {}

  // Haversine formula to calculate distance
  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  // 사용자의 식사 기록을 기반으로 음식점 목록을 생성 (새 location 시스템 사용)
  async getRestaurantsFromMeals(
    userId: string,
    currentLat?: number,
    currentLon?: number,
    radius?: number // in km
  ): Promise<RestaurantSummary[]> {
    // UserLocation 기반으로 조회
    const userLocations = await this.locationsService.getUserLocations(userId)

    const restaurants = await Promise.all(
      userLocations.map(async (userLocation) => {
        // 해당 UserLocation의 meal records 조회
        const meals = await this.mealRecordRepository.find({
          where: { userId, userLocationId: userLocation.id },
          order: { createdAt: 'DESC' },
        })

        // Legacy: userLocationId가 없는 경우 location 이름으로 매칭
        const legacyMeals = await this.mealRecordRepository.find({
          where: { userId, location: userLocation.name, userLocationId: IsNull() },
          order: { createdAt: 'DESC' },
        })

        const allMeals = [...meals, ...legacyMeals]

        if (allMeals.length === 0) return null

        const totalRating = allMeals.reduce((sum, meal) => sum + (meal.rating || 0), 0)
        const totalPrice = allMeals.reduce((sum, meal) => sum + (meal.price || 0), 0)
        const dates = allMeals.map((meal) => new Date(meal.createdAt))

        // ExternalPlaceMapping에서 placeId 찾기
        const externalMapping = userLocation.locationGroup?.externalMappings?.find(
          (m) => m.platform === ExternalPlatform.KAKAO
        )

        let priceRange: 'budget' | 'mid' | 'expensive' = 'mid'
        const avgPrice = totalPrice / allMeals.length
        if (avgPrice < 15000) priceRange = 'budget'
        else if (avgPrice > 30000) priceRange = 'expensive'

        return {
          id: externalMapping?.externalId || userLocation.id,
          placeId: externalMapping?.externalId,
          name: userLocation.name, // 사용자가 지정한 이름
          address: userLocation.address || userLocation.locationGroup.address || '주소 정보 없음',
          latitude: (userLocation.latitude || userLocation.locationGroup.latitude) ?? 0,
          longitude: (userLocation.longitude || userLocation.locationGroup.longitude) ?? 0,
          category: userLocation.locationGroup.category,
          averageRating: Math.round((totalRating / allMeals.length) * 10) / 10,
          totalVisits: allMeals.length,
          firstVisit: new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString(),
          lastVisit: new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString(),
          representativePhoto: allMeals[0]?.photo ? `/uploads/${allMeals[0].photo}` : undefined,
          priceRange,
        }
      })
    )

    // null 제거
    const validRestaurants = restaurants.filter((r) => r !== null) as RestaurantSummary[]

    let filteredRestaurants = validRestaurants

    if (currentLat && currentLon && radius) {
      filteredRestaurants = validRestaurants.filter((r) => {
        if (r.latitude !== undefined && r.longitude !== undefined) {
          const distance = this.getDistance(currentLat, currentLon, r.latitude, r.longitude)
          return distance <= radius
        }
        return false
      })
    }

    return filteredRestaurants.sort((a, b) => b.totalVisits - a.totalVisits)
  }

  // 음식점 카테고리 추론 (간단한 키워드 매칭)
  private inferCategory(location: string, meals: MealRecord[]): string {
    const locationLower = location.toLowerCase()
    const mealNames = meals.map((m) => m.name.toLowerCase()).join(' ')

    if (locationLower.includes('카페') || locationLower.includes('cafe')) return '카페'
    if (
      locationLower.includes('이탈리안') ||
      mealNames.includes('파스타') ||
      mealNames.includes('피자')
    )
      return '양식'
    if (locationLower.includes('일식') || mealNames.includes('스시') || mealNames.includes('라멘'))
      return '일식'
    if (locationLower.includes('중식') || mealNames.includes('짜장') || mealNames.includes('짬뽕'))
      return '중식'
    if (mealNames.includes('김치') || mealNames.includes('비빔밥') || mealNames.includes('된장'))
      return '한식'

    return '기타'
  }

  // 맛집 지도 생성 (실제로는 DB에 저장해야 함)
  async createRestaurantMap(
    userId: string,
    title: string,
    description: string,
    restaurantIds: string[],
    isPublic: boolean,
    currentLat?: number,
    currentLon?: number,
    radius?: number
  ): Promise<RestaurantMap> {
    const restaurants = await this.getRestaurantsFromMeals(userId, currentLat, currentLon, radius)
    const selectedRestaurants = restaurants.filter((r) => restaurantIds.includes(r.id))

    const totalVisits = selectedRestaurants.reduce((sum, r) => sum + r.totalVisits, 0)
    const averageRating =
      selectedRestaurants.reduce((sum, r) => sum + r.averageRating, 0) / selectedRestaurants.length
    const categories = Array.from(
      new Set(selectedRestaurants.map((r) => r.category).filter((c): c is string => Boolean(c)))
    )

    return {
      id: Date.now().toString(),
      title,
      description,
      restaurants: selectedRestaurants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic,
      shareCount: 0,
      userId,
      user: {
        id: userId,
        name: '사용자', // 실제로는 User 엔티티에서 가져와야 함
        profileImage: undefined,
      },
      author: {
        name: '사용자',
        profileImage: undefined,
      },
      stats: {
        totalRestaurants: selectedRestaurants.length,
        totalVisits,
        averageRating: Math.round(averageRating * 10) / 10,
        categories,
      },
    }
  }

  // 레스토랑 상세 정보 조회 (placeId, userLocationId, 또는 이름으로)
  async getRestaurantDetailByPlaceIdOrName(userId: string, placeIdOrName: string) {
    // 1. UserLocation ID로 조회 시도 (UUID 형식)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(placeIdOrName)) {
      try {
        const userLocation = await this.locationsService.getUserLocation(userId, placeIdOrName)
        return this.getRestaurantDetailByUserLocation(userId, userLocation)
      } catch {
        // UserLocation이 없으면 다음 단계로
      }
    }

    // 2. External Platform ID로 조회 (Kakao placeId 등)
    const externalMapping = await this.locationsService.getExternalPlaceMapping(
      ExternalPlatform.KAKAO,
      placeIdOrName
    )
    if (externalMapping?.locationGroup) {
      // 해당 LocationGroup에 대한 사용자의 UserLocation 찾기
      const userLocations = await this.locationsService.getUserLocations(userId)
      const userLocation = userLocations.find(
        (ul) => ul.locationGroupId === externalMapping.locationGroupId
      )

      if (userLocation) {
        return this.getRestaurantDetailByUserLocation(userId, userLocation)
      } else {
        // 방문 안 한 식당 (Kakao 정보만)
        return this.getRestaurantDetailByExternalMapping(externalMapping)
      }
    }

    // 3. 식당명으로 조회 (Legacy)
    const decodedName = decodeURIComponent(placeIdOrName)
    return this.getRestaurantDetailByName(userId, decodedName)
  }

  // 레스토랑 식당명으로 상세 정보 조회 (사용자 기록만)
  async getRestaurantDetailByName(userId: string, restaurantName: string) {
    // 사용자의 방문 기록 조회
    const userMeals = await this.mealRecordRepository.find({
      where: { userId, location: restaurantName },
      order: { createdAt: 'DESC' },
    })

    if (userMeals.length === 0) {
      return null
    }

    const totalRating = userMeals.reduce((sum, meal) => sum + (meal.rating || 0), 0)
    const totalPrice = userMeals.reduce((sum, meal) => sum + (meal.price || 0), 0)
    const dates = userMeals.map((meal) => new Date(meal.createdAt))

    // Kakao Place 에서 해당 이름으로 placeId 찾기 (선택적)
    const kakaoPlace = await this.kakaoPlaceRepository.findOne({
      where: { placeName: restaurantName },
    })

    return {
      placeId: kakaoPlace?.placeId,
      id: kakaoPlace?.placeId || encodeURIComponent(restaurantName),
      name: restaurantName,
      address: userMeals[0].address || '주소 정보 없음',
      latitude: userMeals[0].latitude || kakaoPlace?.latitude,
      longitude: userMeals[0].longitude || kakaoPlace?.longitude,
      mealCount: userMeals.length,
      avgRating: totalRating / userMeals.length,
      totalPrice: totalPrice,
      firstVisit: new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString(),
      lastVisit: new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString(),
      visited: true,
      meals: userMeals.map((meal) => ({
        id: meal.id,
        name: meal.name,
        photo: meal.photo,
        rating: meal.rating,
        memo: meal.memo,
        price: meal.price,
        createdAt: meal.createdAt,
        category: meal.category,
        companionNames: meal.companionNames,
      })),
    }
  }

  // 레스토랑 Kakao Place ID로 상세 정보 조회 (사용자 기록 + Kakao 캠시)
  async getRestaurantDetailByPlaceId(userId: string, placeId: string) {
    // 1. Kakao Place 캐시에서 조회
    const kakaoPlace = await this.kakaoPlaceRepository.findOne({
      where: { placeId },
    })

    if (!kakaoPlace) {
      return null
    }

    // 2. 사용자의 방문 기록 조회 (placeId가 아닌 장소 이름으로 매칭)
    const userMeals = await this.mealRecordRepository.find({
      where: { userId, location: kakaoPlace.placeName },
      order: { createdAt: 'DESC' },
    })

    if (userMeals.length > 0) {
      // 사용자가 방문한 기록이 있는 경우
      const totalRating = userMeals.reduce((sum, meal) => sum + (meal.rating || 0), 0)
      const totalPrice = userMeals.reduce((sum, meal) => sum + (meal.price || 0), 0)
      const dates = userMeals.map((meal) => new Date(meal.createdAt))

      // 위도/경도는 userMeals에서 가져오되, 없으면 Kakao 캐시에서 가져오기
      const latitude = userMeals[0].latitude || kakaoPlace.latitude
      const longitude = userMeals[0].longitude || kakaoPlace.longitude

      return {
        placeId: kakaoPlace.placeId,
        id: kakaoPlace.placeId,
        name: kakaoPlace.placeName,
        address:
          userMeals[0].address ||
          kakaoPlace.addressName ||
          kakaoPlace.roadAddressName ||
          '주소 정보 없음',
        latitude,
        longitude,
        mealCount: userMeals.length,
        avgRating: totalRating / userMeals.length,
        totalPrice: totalPrice,
        firstVisit: new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString(),
        lastVisit: new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString(),
        visited: true,
        meals: userMeals.map((meal) => ({
          id: meal.id,
          name: meal.name,
          photo: meal.photo,
          rating: meal.rating,
          memo: meal.memo,
          price: meal.price,
          createdAt: meal.createdAt,
          category: meal.category,
          companionNames: meal.companionNames,
        })),
      }
    }

    // 방문 기록이 없으면 Kakao 캐시 데이터만 반환
    return {
      placeId: kakaoPlace.placeId,
      id: kakaoPlace.placeId,
      name: kakaoPlace.placeName,
      address: kakaoPlace.addressName || kakaoPlace.roadAddressName || '주소 정보 없음',
      latitude: kakaoPlace.latitude,
      longitude: kakaoPlace.longitude,
      mealCount: 0,
      avgRating: 0,
      totalPrice: 0,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visited: false,
      meals: [],
      kakaoInfo: {
        phone: kakaoPlace.phone,
        placeUrl: kakaoPlace.placeUrl,
        categoryName: kakaoPlace.categoryName,
      },
    }
  }

  // UserLocation 기반 상세 정보 (새 시스템)
  private async getRestaurantDetailByUserLocation(userId: string, userLocation: UserLocation) {
    // 해당 UserLocation의 meal records 조회
    const meals = await this.mealRecordRepository.find({
      where: { userId, userLocationId: userLocation.id },
      order: { createdAt: 'DESC' },
    })

    // Legacy: userLocationId가 없는 경우 location 이름으로 매칭
    const legacyMeals = await this.mealRecordRepository.find({
      where: { userId, location: userLocation.name, userLocationId: IsNull() },
      order: { createdAt: 'DESC' },
    })

    const allMeals = [...meals, ...legacyMeals]

    if (allMeals.length === 0) {
      return null
    }

    const totalRating = allMeals.reduce((sum, meal) => sum + (meal.rating || 0), 0)
    const totalPrice = allMeals.reduce((sum, meal) => sum + (meal.price || 0), 0)
    const dates = allMeals.map((meal) => new Date(meal.createdAt))

    // ExternalPlaceMapping에서 placeId 찾기
    const externalMapping = userLocation.locationGroup?.externalMappings?.find(
      (m) => m.platform === ExternalPlatform.KAKAO
    )

    return {
      placeId: externalMapping?.externalId,
      id: userLocation.id,
      locationGroupId: userLocation.locationGroupId, // LocationGroup ID 추가
      name: userLocation.name, // 사용자가 지정한 이름
      address: userLocation.address || userLocation.locationGroup?.address || '주소 정보 없음',
      latitude: userLocation.latitude || userLocation.locationGroup?.latitude,
      longitude: userLocation.longitude || userLocation.locationGroup?.longitude,
      mealCount: allMeals.length,
      avgRating: totalRating / allMeals.length,
      totalPrice: totalPrice,
      firstVisit: new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString(),
      lastVisit: new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString(),
      visited: true,
      meals: allMeals.map((meal) => ({
        id: meal.id,
        name: meal.name,
        photo: meal.photo,
        rating: meal.rating,
        memo: meal.memo,
        price: meal.price,
        createdAt: meal.createdAt,
        category: meal.category,
        companionNames: meal.companionNames,
      })),
      kakaoInfo: externalMapping?.externalData,
    }
  }

  // ExternalPlaceMapping 기반 상세 정보 (방문 안 한 식당)
  private getRestaurantDetailByExternalMapping(mapping: {
    externalId: string
    externalName: string
    externalData?: { address?: string; [key: string]: unknown }
    locationGroup?: { latitude?: number; longitude?: number }
  }) {
    return {
      placeId: mapping.externalId,
      id: mapping.externalId,
      name: mapping.externalName,
      address: mapping.externalData?.address || '주소 정보 없음',
      latitude: mapping.locationGroup?.latitude,
      longitude: mapping.locationGroup?.longitude,
      mealCount: 0,
      avgRating: 0,
      totalPrice: 0,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visited: false,
      meals: [],
      kakaoInfo: mapping.externalData,
    }
  }
}
