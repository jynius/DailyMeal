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

  // 사용자의 식사 기록을 기반으로 음식점 목록을 생성
  async getRestaurantsFromMeals(userId: string): Promise<RestaurantSummary[]> {
    const meals = await this.mealRecordRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // 장소별로 그룹화
    const restaurantMap = new Map<
      string,
      {
        meals: MealRecord[];
        totalRating: number;
        firstVisit: Date;
        lastVisit: Date;
      }
    >();

    meals.forEach((meal) => {
      if (!meal.location) return;

      const key = meal.location;
      if (!restaurantMap.has(key)) {
        restaurantMap.set(key, {
          meals: [],
          totalRating: 0,
          firstVisit: new Date(meal.createdAt),
          lastVisit: new Date(meal.createdAt),
        });
      }

      const restaurant = restaurantMap.get(key)!;
      restaurant.meals.push(meal);
      restaurant.totalRating += meal.rating;

      const mealDate = new Date(meal.createdAt);
      if (mealDate < restaurant.firstVisit) restaurant.firstVisit = mealDate;
      if (mealDate > restaurant.lastVisit) restaurant.lastVisit = mealDate;
    });

    // RestaurantSummary로 변환
    const restaurants: RestaurantSummary[] = [];
    let id = 1;

    restaurantMap.forEach((data, location) => {
      const averageRating = data.totalRating / data.meals.length;
      const representativeMeal = data.meals.find(
        (m) => m.photos && m.photos.length > 0,
      );

      // 가격대 계산 (평균 가격 기준)
      const avgPrice =
        data.meals
          .filter((m) => m.price)
          .reduce((sum, m) => sum + (m.price || 0), 0) /
        data.meals.filter((m) => m.price).length;

      let priceRange: 'budget' | 'mid' | 'expensive' = 'mid';
      if (avgPrice < 15000) priceRange = 'budget';
      else if (avgPrice > 30000) priceRange = 'expensive';

      restaurants.push({
        id: id.toString(),
        name: location,
        address: location,
        latitude: data.meals[0].latitude,
        longitude: data.meals[0].longitude,
        category: this.inferCategory(location, data.meals),
        averageRating: Math.round(averageRating * 10) / 10,
        totalVisits: data.meals.length,
        firstVisit: data.firstVisit.toISOString(),
        lastVisit: data.lastVisit.toISOString(),
        representativePhoto: representativeMeal?.photos?.[0]
          ? `/uploads/${representativeMeal.photos[0]}`
          : undefined,
        priceRange,
      });

      id++;
    });

    return restaurants.sort((a, b) => b.totalVisits - a.totalVisits);
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
  ): Promise<RestaurantMap> {
    const restaurants = await this.getRestaurantsFromMeals(userId);
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
