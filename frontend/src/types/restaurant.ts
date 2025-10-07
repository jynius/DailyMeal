// 음식점 관련 타입 정의

export interface Restaurant {
  id: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  category?: string // '한식', '양식', '일식', '중식', '카페', '디저트' 등
  averageRating: number
  totalVisits: number
  firstVisit: string
  lastVisit: string
  representativePhoto?: string // 대표 사진
  priceRange?: 'budget' | 'mid' | 'expensive' // 가격대
}

export interface RestaurantMeal {
  id: string
  name: string
  rating: number
  photos?: string[]
  memo?: string
  price?: number
  visitDate: string
}

export interface RestaurantDetail extends Restaurant {
  meals: RestaurantMeal[] // 해당 음식점에서 먹은 음식들
  tags: string[] // 사용자가 붙인 태그들
}

export interface RestaurantMap {
  id: string
  title: string
  description?: string
  restaurants: Restaurant[]
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

export interface CreateRestaurantMapData {
  title: string
  description?: string
  restaurantIds: string[]
  isPublic: boolean
}