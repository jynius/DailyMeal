import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealRecord } from '../entities/meal-record.entity';
import { KakaoPlace } from '../entities/kakao-place.entity';
import { AppLoggerService } from '../common/logger.service';

export interface RestaurantSummary {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  averageRating: number;
  totalVisits: number;
  firstVisit: string;
  lastVisit: string;
  representativePhoto?: string;
  priceRange?: 'budget' | 'mid' | 'expensive';
}

export interface RestaurantMap {
  id: string;
  title: string;
  description?: string;
  restaurants: RestaurantSummary[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  shareCount: number;
  userId: string;
  user: {
    id: string;
    name: string;
    profileImage?: string;
  };
  author: {
    name: string;
    profileImage?: string;
  };
  stats: {
    totalRestaurants: number;
    totalVisits: number;
    averageRating: number;
    categories: string[];
  };
}

@Injectable()
export class RestaurantsService {
  private readonly logger = AppLoggerService.getLogger('RestaurantsService');

  constructor(
    @InjectRepository(MealRecord)
    private mealRecordRepository: Repository<MealRecord>,
    @InjectRepository(KakaoPlace)
    private kakaoPlaceRepository: Repository<KakaoPlace>,
  ) {}

  // Haversine formula to calculate distance
  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // 사용자의 식사 기록을 기반으로 음식점 목록을 생성
  async getRestaurantsFromMeals(
    userId: string,
    currentLat?: number,
    currentLon?: number,
    radius?: number, // in km
  ): Promise<RestaurantSummary[]> {
    const query = this.mealRecordRepository.createQueryBuilder('meal')
      .where('meal.userId = :userId', { userId })
      .andWhere('meal.location IS NOT NULL');

    const restaurantsRaw = await query
      .select([
        'meal.location as name',
        'meal.address as address',
        'AVG(meal.rating)::float as "averageRating"',
        'COUNT(meal.id)::int as "totalVisits"',
        'MIN(meal.createdAt) as "firstVisit"',
        'MAX(meal.createdAt) as "lastVisit"',
        'MAX(meal.latitude) as latitude',
        'MAX(meal.longitude) as longitude',
        '(array_agg(meal.photos))[1] as "representativePhoto"',
        'AVG(meal.price)::float as "averagePrice"',
      ])
      .groupBy('meal.location, meal.address')
      .getRawMany();

    // Kakao Place 캐시에서 placeId 조회
    const restaurantsWithPlaceId = await Promise.all(
      restaurantsRaw.map(async (r) => {
        // Kakao Place에서 해당 식당명으로 placeId 찾기
        const kakaoPlace = await this.kakaoPlaceRepository.findOne({
          where: { placeName: r.name },
        });

        let priceRange: 'budget' | 'mid' | 'expensive' = 'mid';
        if (r.averagePrice < 15000) priceRange = 'budget';
        else if (r.averagePrice > 30000) priceRange = 'expensive';

        return {
          id: kakaoPlace?.placeId || encodeURIComponent(r.name), // placeId 우선, 없으면 이름
          placeId: kakaoPlace?.placeId, // placeId 필드 추가
          name: r.name,
          address: r.address || r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          averageRating: Math.round(r.averageRating * 10) / 10,
          totalVisits: r.totalVisits,
          firstVisit: new Date(r.firstVisit).toISOString(),
          lastVisit: new Date(r.lastVisit).toISOString(),
          representativePhoto: r.representativePhoto ? `/uploads/${r.representativePhoto}` : undefined,
          priceRange,
          category: this.inferCategory(r.name, []), // Category inference needs adjustment
        };
      })
    );

    const restaurants = restaurantsWithPlaceId;

    let filteredRestaurants = restaurants;

    if (currentLat && currentLon && radius) {
      filteredRestaurants = restaurants.filter(r => {
        if (r.latitude && r.longitude) {
          const distance = this.getDistance(currentLat, currentLon, r.latitude, r.longitude);
          return distance <= radius;
        }
        return false;
      });
    }

    return filteredRestaurants.sort((a, b) => b.totalVisits - a.totalVisits);
  }

  // 음식점 카테고리 추론 (간단한 키워드 매칭)
  private inferCategory(location: string, meals: MealRecord[]): string {
    const locationLower = location.toLowerCase();
    const mealNames = meals.map((m) => m.name.toLowerCase()).join(' ');

    if (locationLower.includes('카페') || locationLower.includes('cafe'))
      return '카페';
    if (
      locationLower.includes('이탈리안') ||
      mealNames.includes('파스타') ||
      mealNames.includes('피자')
    )
      return '양식';
    if (
      locationLower.includes('일식') ||
      mealNames.includes('스시') ||
      mealNames.includes('라멘')
    )
      return '일식';
    if (
      locationLower.includes('중식') ||
      mealNames.includes('짜장') ||
      mealNames.includes('짬뽕')
    )
      return '중식';
    if (
      mealNames.includes('김치') ||
      mealNames.includes('비빔밥') ||
      mealNames.includes('된장')
    )
      return '한식';

    return '기타';
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
    radius?: number,
  ): Promise<RestaurantMap> {
    const restaurants = await this.getRestaurantsFromMeals(userId, currentLat, currentLon, radius);
    const selectedRestaurants = restaurants.filter((r) =>
      restaurantIds.includes(r.id),
    );

    const totalVisits = selectedRestaurants.reduce(
      (sum, r) => sum + r.totalVisits,
      0,
    );
    const averageRating =
      selectedRestaurants.reduce((sum, r) => sum + r.averageRating, 0) /
      selectedRestaurants.length;
    const categories = Array.from(
      new Set(
        selectedRestaurants
          .map((r) => r.category)
          .filter((c): c is string => Boolean(c)),
      ),
    );

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
    };
  }

  // 레스토랑 상세 정보 조회 (placeId 또는 식당명)
  async getRestaurantDetail(userId: string, placeIdOrName: string) {
    // 1. placeId로 먼저 시도
    const kakaoPlace = await this.kakaoPlaceRepository.findOne({
      where: { placeId: placeIdOrName },
    });

    if (kakaoPlace) {
      // placeId로 찾았으면 기존 로직 사용
      return this.getRestaurantDetailByPlaceId(userId, placeIdOrName);
    }

    // 2. placeId로 못 찾았으면 식당명으로 조회
    return this.getRestaurantDetailByName(userId, placeIdOrName);
  }

  // 레스토랑 식당명으로 상세 정보 조회 (사용자 기록만)
  async getRestaurantDetailByName(userId: string, restaurantName: string) {
    // 사용자의 방문 기록 조회
    const userMeals = await this.mealRecordRepository.find({
      where: { userId, location: restaurantName },
      order: { createdAt: 'DESC' },
    });

    if (userMeals.length === 0) {
      return null;
    }

    const totalRating = userMeals.reduce((sum, meal) => sum + (meal.rating || 0), 0);
    const totalPrice = userMeals.reduce((sum, meal) => sum + (meal.price || 0), 0);
    const dates = userMeals.map((meal) => new Date(meal.createdAt));

    // Kakao Place 에서 해당 이름으로 placeId 찾기 (선택적)
    const kakaoPlace = await this.kakaoPlaceRepository.findOne({
      where: { placeName: restaurantName },
    });

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
      firstVisit: new Date(Math.min(...dates.map(d => d.getTime()))).toISOString(),
      lastVisit: new Date(Math.max(...dates.map(d => d.getTime()))).toISOString(),
      visited: true,
      meals: userMeals.map(meal => ({
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
    };
  }

  // 레스토랑 Kakao Place ID로 상세 정보 조회 (사용자 기록 + Kakao 캠시)
  async getRestaurantDetailByPlaceId(userId: string, placeId: string) {
    // 1. Kakao Place 캐시에서 조회
    const kakaoPlace = await this.kakaoPlaceRepository.findOne({
      where: { placeId },
    });

    if (!kakaoPlace) {
      return null;
    }

    // 2. 사용자의 방문 기록 조회 (placeId가 아닌 장소 이름으로 매칭)
    const userMeals = await this.mealRecordRepository.find({
      where: { userId, location: kakaoPlace.placeName },
      order: { createdAt: 'DESC' },
    });

    if (userMeals.length > 0) {
      // 사용자가 방문한 기록이 있는 경우
      const totalRating = userMeals.reduce((sum, meal) => sum + (meal.rating || 0), 0);
      const totalPrice = userMeals.reduce((sum, meal) => sum + (meal.price || 0), 0);
      const dates = userMeals.map((meal) => new Date(meal.createdAt));

      // 위도/경도는 userMeals에서 가져오되, 없으면 Kakao 캐시에서 가져오기
      const latitude = userMeals[0].latitude || kakaoPlace.latitude;
      const longitude = userMeals[0].longitude || kakaoPlace.longitude;

      return {
        placeId: kakaoPlace.placeId,
        id: kakaoPlace.placeId,
        name: kakaoPlace.placeName,
        address: userMeals[0].address || kakaoPlace.addressName || kakaoPlace.roadAddressName || '주소 정보 없음',
        latitude,
        longitude,
        mealCount: userMeals.length,
        avgRating: totalRating / userMeals.length,
        totalPrice: totalPrice,
        firstVisit: new Date(Math.min(...dates.map(d => d.getTime()))).toISOString(),
        lastVisit: new Date(Math.max(...dates.map(d => d.getTime()))).toISOString(),
        visited: true,
        meals: userMeals.map(meal => ({
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
      };
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
    };
  }
}
