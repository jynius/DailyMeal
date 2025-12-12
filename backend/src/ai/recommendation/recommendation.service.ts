import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { MealRecord } from '../../entities/meal-record.entity'
import { Friendship } from '../../entities/friendship.entity'
import { User } from '../../entities/user.entity'
import { KakaoPlace } from '../../entities/kakao-place.entity'
import {
  RecommendationType,
  RecommendationResponseDto,
  RecommendationItem,
  FriendWhoLiked,
} from '../dto/recommendation.dto'

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name)

  constructor(
    @InjectRepository(MealRecord)
    private readonly mealRecordRepository: Repository<MealRecord>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(KakaoPlace)
    private readonly kakaoPlaceRepository: Repository<KakaoPlace>,
    private readonly configService: ConfigService
  ) {}

  async getRecommendations(
    userId: string,
    type: RecommendationType,
    options: {
      limit?: number
      maxDistance?: number
      maxPrice?: number
      minRating?: number
      excludeVisited?: boolean
    } = {}
  ): Promise<RecommendationResponseDto> {
    this.logger.log(`Getting ${type} recommendations for user ${userId}`)

    let recommendations: RecommendationItem[] = []

    switch (type) {
      case RecommendationType.SOCIAL:
        recommendations = await this.getSocialRecommendations(userId)
        break
      case RecommendationType.POPULAR:
        recommendations = await this.getPopularRecommendations(userId)
        break
      case RecommendationType.COLLABORATIVE:
        recommendations = await this.getCollaborativeRecommendations(userId)
        break
    }

    // 🆕 Cold Start: 추천이 없으면 일반 인기 맛집 반환
    if (recommendations.length === 0) {
      this.logger.log(`No recommendations found, using fallback for user ${userId}`)
      recommendations = await this.getFallbackRecommendations(userId)

      // 여전히 비어있으면 카카오 로컬 API 사용 (실제 운영 데이터)
      if (recommendations.length === 0) {
        this.logger.log(`Using Kakao Local API for user ${userId}`)
        recommendations = await this.getKakaoLocalRecommendations(userId)
      }
    }

    // Apply filters
    recommendations = this.applyFilters(recommendations, options)

    // Limit results
    const limit = options.limit || 10
    recommendations = recommendations.slice(0, limit)

    return {
      type,
      recommendations,
      count: recommendations.length,
      generatedAt: new Date(),
    }
  }

  /**
   * 🆕 Cold Start 대응: 데이터가 없을 때 기본 추천
   */
  private async getFallbackRecommendations(userId: string): Promise<RecommendationItem[]> {
    // 전체 사용자의 평점 높은 맛집
    interface TopRatedRaw {
      restaurantName: string
      address: string
      category: string
      rating: string
      averagePrice: string | null
      visitCount: string
      latitude: number
      longitude: number
    }

    const topRated = await this.mealRecordRepository
      .createQueryBuilder('meal')
      .select('meal.location', 'restaurantName')
      .addSelect('meal.address', 'address')
      .addSelect('meal.category', 'category')
      .addSelect('AVG(meal.rating)', 'rating')
      .addSelect('AVG(meal.price)', 'averagePrice')
      .addSelect('COUNT(*)', 'visitCount')
      .addSelect('MAX(meal.latitude)', 'latitude')
      .addSelect('MAX(meal.longitude)', 'longitude')
      .where('meal.location IS NOT NULL')
      .andWhere('meal.rating >= :minRating', { minRating: 4 })
      .groupBy('meal.location')
      .addGroupBy('meal.address')
      .addGroupBy('meal.category')
      .having('COUNT(*) >= :minVisits', { minVisits: 2 })
      .orderBy('AVG(meal.rating)', 'DESC')
      .addOrderBy('COUNT(*)', 'DESC')
      .limit(20)
      .getRawMany<TopRatedRaw>()

    // 사용자가 방문한 곳 제외
    const userVisited = await this.mealRecordRepository.find({
      where: { userId },
      select: ['location'],
    })
    const visitedNames = new Set(userVisited.map((m) => m.location))

    return topRated
      .filter((r) => !visitedNames.has(r.restaurantName))
      .map((r, index) => ({
        restaurantId: index + 1,
        restaurantName: r.restaurantName,
        address: r.address || '주소 정보 없음',
        rating: parseFloat(r.rating),
        averagePrice: r.averagePrice ? Math.round(parseFloat(r.averagePrice)) : undefined,
        visitCount: parseInt(r.visitCount),
        visited: false,
        distance: 0, // Fallback이므로 거리 정보 없음
        reason: `평점 ${parseFloat(r.rating).toFixed(1)}점의 인기 맛집입니다 (${parseInt(r.visitCount)}명 방문)`,
      }))
  }

  /**
   * 🌐 카카오 로컬 API: 실제 맛집 데이터 (캐시 우선)
   */
  private async getKakaoLocalRecommendations(
    userId: string,
    lat = 37.5665, // 기본: 서울역
    lon = 126.978
  ): Promise<RecommendationItem[]> {
    const kakaoRestApiKey = this.configService.get('KAKAO_REST_API_KEY')

    if (!kakaoRestApiKey) {
      this.logger.warn('KAKAO_REST_API_KEY not configured')
      return []
    }

    try {
      // 사용자의 최근 위치 가져오기 (있으면)
      const userMeals = await this.mealRecordRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 1,
      })

      if (userMeals.length > 0 && userMeals[0].latitude && userMeals[0].longitude) {
        lat = userMeals[0].latitude
        lon = userMeals[0].longitude
      }

      // 1. 먼저 캐시(DB)에서 조회 - 최근 7일 이내 데이터
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const cachedPlaces = await this.kakaoPlaceRepository
        .createQueryBuilder('place')
        .where('place.updatedAt >= :sevenDaysAgo', { sevenDaysAgo })
        .getMany()

      // 사용자가 방문한 곳 제외
      const userVisited = await this.mealRecordRepository.find({
        where: { userId },
        select: ['location'],
      })
      const visitedNames = new Set(userVisited.map((m) => m.location))

      // 캐시된 데이터가 충분하면 반환
      const cachedResultsPromises = cachedPlaces
        .filter((place) => !visitedNames.has(place.placeName))
        .slice(0, 10)
        .map(async (place, index) => {
          // 사용자들의 식사 기록에서 인기 메뉴 추출
          const popularMeals = await this.mealRecordRepository
            .createQueryBuilder('meal')
            .select('meal.name', 'name')
            .addSelect('COUNT(*)', 'count')
            .where('meal.location = :location', { location: place.placeName })
            .groupBy('meal.name')
            .orderBy('count', 'DESC')
            .limit(3)
            .getRawMany()

          const popularMenus = popularMeals.map((m) => m.name)
          const menuCategory = place.categoryName
            ? place.categoryName.split(' > ').pop()
            : undefined

          return {
            restaurantId: index + 1,
            placeId: place.placeId,
            restaurantName: place.placeName,
            address: place.addressName || place.roadAddressName || '주소 정보 없음',
            categoryName: place.categoryName || undefined,
            menuCategory,
            popularMenus: popularMenus.length > 0 ? popularMenus : undefined,
            latitude: place.latitude,
            longitude: place.longitude,
            distance: this.calculateDistance(lat, lon, place.latitude, place.longitude),
            rating: 4.0,
            averagePrice: undefined,
            visitCount: 0,
            visited: false,
            category: 'restaurant',
            reason: `주변 인기 장소${menuCategory ? ` (${menuCategory})` : ''}`,
          } as RecommendationItem
        })

      const resolvedResults = await Promise.all(cachedResultsPromises)

      if (resolvedResults.length >= 5) {
        this.logger.log(`Using ${resolvedResults.length} cached Kakao places`)
        return resolvedResults
      }

      // 2. 캐시가 부족하면 카카오 API 호출
      this.logger.log('Fetching from Kakao Local API')
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=맛집&x=${lon}&y=${lat}&radius=5000&sort=accuracy`,
        {
          headers: {
            Authorization: `KakaoAK ${kakaoRestApiKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Kakao API error: ${response.status}`)
      }

      const data = await response.json()

      // 3. API 결과를 DB에 저장 (upsert)
      const savePromises = data.documents.map(async (place: any) => {
        return this.kakaoPlaceRepository.save({
          placeId: place.id,
          placeName: place.place_name,
          categoryName: place.category_name,
          addressName: place.address_name,
          roadAddressName: place.road_address_name,
          latitude: parseFloat(place.y),
          longitude: parseFloat(place.x),
          phone: place.phone,
          placeUrl: place.place_url,
        })
      })

      await Promise.all(savePromises)
      this.logger.log(`Saved ${data.documents.length} places to cache`)

      return data.documents
        .filter((place: any) => !visitedNames.has(place.place_name))
        .slice(0, 10)
        .map((place: any, index: number) => {
          const menuCategory = place.category_name
            ? place.category_name.split(' > ').pop()
            : undefined

          return {
            restaurantId: index + 1,
            placeId: place.id,
            restaurantName: place.place_name,
            address: place.address_name || place.road_address_name || '주소 정보 없음',
            categoryName: place.category_name || undefined,
            menuCategory,
            latitude: parseFloat(place.y),
            longitude: parseFloat(place.x),
            distance: parseInt(place.distance || '0'),
            rating: 4.0,
            averagePrice: undefined,
            visitCount: 0,
            visited: false,
            reason: `주변 인기 장소${menuCategory ? ` (${menuCategory})` : ''}`,
          }
        })
    } catch (error) {
      this.logger.error('Failed to fetch Kakao Local API:', error)
      return []
    }
  }

  // 거리 계산 헬퍼 (미터 단위)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c) // 미터 단위
  }

  private async getSocialRecommendations(userId: string): Promise<RecommendationItem[]> {
    // Get accepted friends
    const friendships = await this.friendshipRepository.find({
      where: [
        { userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' },
      ],
      relations: ['user', 'friend'],
    })

    const friendIds = friendships.map((f) => (f.userId === userId ? f.friendId : f.userId))

    if (friendIds.length === 0) {
      return []
    }

    // Get friends' meals with high ratings
    const friendMeals = await this.mealRecordRepository
      .createQueryBuilder('meal')
      .where('meal.userId IN (:...friendIds)', { friendIds })
      .andWhere('meal.rating >= :minRating', { minRating: 4 })
      .andWhere('meal.location IS NOT NULL')
      .andWhere('meal.latitude IS NOT NULL')
      .andWhere('meal.longitude IS NOT NULL')
      .getMany()

    // Get user's visited places
    const userMeals = await this.mealRecordRepository.find({
      where: { userId },
      select: ['location'],
    })
    const visitedLocations = new Set(userMeals.map((m) => m.location).filter(Boolean))

    // Group by location
    const locationMap = new Map<string, { meals: MealRecord[]; friends: Set<string> }>()

    for (const meal of friendMeals) {
      if (!meal.location || visitedLocations.has(meal.location)) continue

      if (!locationMap.has(meal.location)) {
        locationMap.set(meal.location, { meals: [], friends: new Set() })
      }

      const data = locationMap.get(meal.location)!
      data.meals.push(meal)
      data.friends.add(meal.userId)
    }

    // Convert to recommendations
    const recommendations: RecommendationItem[] = []

    for (const [location, data] of locationMap.entries()) {
      const ratings = data.meals.map((m) => m.rating).filter((r): r is number => r !== null)
      const prices = data.meals.map((m) => m.price).filter((p): p is number => p !== null)
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0

      // Get friend details
      const likedByFriends: FriendWhoLiked[] = []
      for (const friendId of data.friends) {
        const friend = await this.userRepository.findOne({ where: { id: friendId } })
        if (friend) {
          const friendMeal = data.meals.find((m) => m.userId === friendId)
          likedByFriends.push({
            friendId,
            friendName: friend.name,
            rating: friendMeal?.rating || 0,
          })
        }
      }

      // Get first meal for location data
      const firstMeal = data.meals[0]

      recommendations.push({
        restaurantId: 0,
        restaurantName: location,
        address: firstMeal.address || '',
        distance: 0, // Will calculate if user location is provided
        averagePrice: Math.round(avgPrice),
        rating: Math.round(avgRating * 10) / 10,
        reason: `친구 ${data.friends.size}명이 좋아한 맛집`,
        likedByFriends,
        visited: false,
      })
    }

    // Sort by number of friends who liked it
    return recommendations.sort((a, b) => {
      const aFriends = a.likedByFriends?.length || 0
      const bFriends = b.likedByFriends?.length || 0
      return bFriends - aFriends
    })
  }

  private async getPopularRecommendations(userId: string): Promise<RecommendationItem[]> {
    // Get user's visited places
    const userMeals = await this.mealRecordRepository.find({
      where: { userId },
      select: ['location', 'latitude', 'longitude'],
    })
    const visitedLocations = new Set(userMeals.map((m) => m.location).filter(Boolean))

    // Get user's average location for distance calculation
    const userLocations = userMeals
      .filter((m) => m.latitude && m.longitude)
      .map((m) => ({ lat: m.latitude!, lon: m.longitude! }))

    let userAvgLat: number | undefined
    let userAvgLon: number | undefined

    if (userLocations.length > 0) {
      userAvgLat = userLocations.reduce((sum, loc) => sum + loc.lat, 0) / userLocations.length
      userAvgLon = userLocations.reduce((sum, loc) => sum + loc.lon, 0) / userLocations.length
    }

    // Get all meals from all users, grouped by location
    const allMeals = await this.mealRecordRepository
      .createQueryBuilder('meal')
      .where('meal.location IS NOT NULL')
      .andWhere('meal.createdAt >= :threeMonthsAgo', {
        threeMonthsAgo: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      })
      .getMany()

    // Group by location
    const locationMap = new Map<string, MealRecord[]>()
    for (const meal of allMeals) {
      if (!meal.location || visitedLocations.has(meal.location)) continue

      if (!locationMap.has(meal.location)) {
        locationMap.set(meal.location, [])
      }
      locationMap.get(meal.location)!.push(meal)
    }

    const recommendations: RecommendationItem[] = []

    for (const [location, meals] of locationMap.entries()) {
      const visitCount = meals.length
      const ratings = meals.map((m) => m.rating).filter((r): r is number => r !== null)
      const prices = meals.map((m) => m.price).filter((p): p is number => p !== null)

      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0

      // Get first meal for location data
      const firstMeal = meals[0]

      let distance = 0
      if (userAvgLat && userAvgLon && firstMeal.latitude !== null && firstMeal.longitude !== null) {
        distance = this.calculateDistance(
          userAvgLat,
          userAvgLon,
          firstMeal.latitude,
          firstMeal.longitude
        )
      }

      recommendations.push({
        restaurantId: 0,
        restaurantName: location,
        address: firstMeal.address || '',
        distance: Math.round(distance),
        averagePrice: Math.round(avgPrice),
        rating: Math.round(avgRating * 10) / 10,
        reason: '주변 인기 급상승 맛집',
        visitCount,
        visited: false,
      })
    }

    // Sort by visit count
    return recommendations.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
  }

  private async getCollaborativeRecommendations(userId: string): Promise<RecommendationItem[]> {
    // Get user's meal preferences (locations and ratings)
    const userMeals = await this.mealRecordRepository.find({
      where: { userId },
      select: ['location', 'rating'],
    })

    const userPreferences = new Map<string, number>()
    userMeals
      .filter((m) => m.location && m.rating !== null)
      .forEach((m) => {
        userPreferences.set(m.location!, m.rating!)
      })

    if (userPreferences.size === 0) {
      return []
    }

    // Find similar users (who liked same places)
    const allUsers = await this.userRepository.find()
    const similarUsers: { userId: string; similarity: number }[] = []

    for (const otherUser of allUsers) {
      if (otherUser.id === userId) continue

      const otherMeals = await this.mealRecordRepository.find({
        where: { userId: otherUser.id },
        select: ['location', 'rating'],
      })

      const otherPreferences = new Map<string, number>()
      otherMeals
        .filter((m) => m.location && m.rating !== null)
        .forEach((m) => {
          otherPreferences.set(m.location!, m.rating!)
        })

      // Calculate similarity (common locations with similar ratings)
      let commonCount = 0
      let similarityScore = 0

      for (const [location, rating] of userPreferences.entries()) {
        if (otherPreferences.has(location)) {
          commonCount++
          const otherRating = otherPreferences.get(location)!
          similarityScore += 1 - Math.abs(rating - otherRating) / 5 // 0-1 scale
        }
      }

      if (commonCount >= 2) {
        // At least 2 common places
        similarUsers.push({
          userId: otherUser.id,
          similarity: similarityScore / commonCount,
        })
      }
    }

    if (similarUsers.length === 0) {
      return []
    }

    // Sort by similarity
    similarUsers.sort((a, b) => b.similarity - a.similarity)

    // Get top similar users' recommendations
    const topSimilarUserIds = similarUsers.slice(0, 10).map((u) => u.userId)
    const visitedLocations = new Set(userPreferences.keys())

    const similarUserMeals = await this.mealRecordRepository
      .createQueryBuilder('meal')
      .where('meal.userId IN (:...userIds)', { userIds: topSimilarUserIds })
      .andWhere('meal.rating >= :minRating', { minRating: 4 })
      .andWhere('meal.location IS NOT NULL')
      .getMany()

    // Group by location
    const locationMap = new Map<string, { meals: MealRecord[]; users: Set<string> }>()

    for (const meal of similarUserMeals) {
      if (!meal.location || visitedLocations.has(meal.location)) continue

      if (!locationMap.has(meal.location)) {
        locationMap.set(meal.location, { meals: [], users: new Set() })
      }

      const data = locationMap.get(meal.location)!
      data.meals.push(meal)
      data.users.add(meal.userId)
    }

    const recommendations: RecommendationItem[] = []

    for (const [location, data] of locationMap.entries()) {
      const ratings = data.meals.map((m) => m.rating).filter((r): r is number => r !== null)
      const prices = data.meals.map((m) => m.price).filter((p): p is number => p !== null)
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0

      const firstMeal = data.meals[0]

      recommendations.push({
        restaurantId: 0,
        restaurantName: location,
        address: firstMeal.address || '',
        distance: 0,
        averagePrice: Math.round(avgPrice),
        rating: Math.round(avgRating * 10) / 10,
        reason: '비슷한 취향의 사용자들이 좋아한 곳',
        similarUsers: data.users.size,
        visited: false,
      })
    }

    // Sort by number of similar users
    return recommendations.sort((a, b) => (b.similarUsers || 0) - (a.similarUsers || 0))
  }

  private applyFilters(
    recommendations: RecommendationItem[],
    filters: {
      maxDistance?: number
      maxPrice?: number
      minRating?: number
    }
  ): RecommendationItem[] {
    let filtered = recommendations

    if (filters.maxDistance !== undefined) {
      filtered = filtered.filter((r) => r.distance <= filters.maxDistance!)
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(
        (r) => r.averagePrice !== undefined && r.averagePrice <= filters.maxPrice!
      )
    }

    if (filters.minRating !== undefined) {
      filtered = filtered.filter((r) => r.rating !== undefined && r.rating >= filters.minRating!)
    }

    return filtered
  }
}
