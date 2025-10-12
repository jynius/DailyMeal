import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealRecord } from '../entities/meal-record.entity';
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

    const restaurants = restaurantsRaw.map((r, index) => {
      let priceRange: 'budget' | 'mid' | 'expensive' = 'mid';
      if (r.averagePrice < 15000) priceRange = 'budget';
      else if (r.averagePrice > 30000) priceRange = 'expensive';

      return {
        id: (index + 1).toString(),
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
    });

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
}
