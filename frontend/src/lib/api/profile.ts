import { apiRequest } from './client'

export interface UserProfile {
  id: string
  username: string
  email: string
  profileImage?: string | null
  bio?: string | null
  stats: {
    totalReviews: number
    restaurantCount: number
    friendCount: number
  }
}

export interface UpdateProfileDto {
  username?: string
  email?: string
  bio?: string
}

export interface UserSettings {
  id: string
  userId: string
  // 알림 설정
  notificationFriendRequest: boolean
  notificationNewReview: boolean
  notificationNearbyFriend: boolean
  // 프라이버시 설정
  privacyProfilePublic: boolean
  privacyShowLocation: boolean
  privacyShowMealDetails: boolean
  // 장소 설정
  locationHome?: string
  locationOffice?: string
  locationHomeLatitude?: number
  locationHomeLongitude?: number
  locationOfficeLatitude?: number
  locationOfficeLongitude?: number
  // AI 추천 설정
  aiRecommendationType: 'social' | 'popular' | 'collaborative'
  aiRecommendationMaxDistance: number
  aiRecommendationMaxPrice?: number
  aiRecommendationMinRating: number
  aiRecommendationExcludeVisited: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateSettingsDto {
  notificationFriendRequest?: boolean
  notificationNewReview?: boolean
  notificationNearbyFriend?: boolean
  privacyProfilePublic?: boolean
  privacyShowLocation?: boolean
  privacyShowMealDetails?: boolean
  locationHome?: string
  locationOffice?: string
  locationHomeLatitude?: number
  locationHomeLongitude?: number
  locationOfficeLatitude?: number
  locationOfficeLongitude?: number
  aiRecommendationType?: 'social' | 'popular' | 'collaborative'
  aiRecommendationMaxDistance?: number
  aiRecommendationMaxPrice?: number
  aiRecommendationMinRating?: number
  aiRecommendationExcludeVisited?: boolean
}

export interface UserStatistics {
  totalReviews: number
  totalRestaurants: number
  averageRating: number
  monthlyStats: {
    month: string
    reviewCount: number
    restaurantCount: number
    averageRating: number
  }[]
  topRatedRestaurants: {
    id: string
    name: string
    rating: number
    category: string
    visitCount: number
  }[]
  recentActivity: {
    date: string
    type: 'review' | 'visit'
    restaurantName: string
    rating?: number
  }[]
}

export const profileApi = {
  // 내 프로필 조회
  async getProfile(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/me')
  },

  // 프로필 업데이트
  async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  // 프로필 이미지 업로드
  async uploadProfileImage(file: File): Promise<{ profileImage: string }> {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiRequest<{ profileImage: string }>('/users/me/profile-image', {
      method: 'POST',
      body: formData
    })
  },

  // 사용자 통계 조회
  async getStatistics(): Promise<UserStatistics> {
    return apiRequest<UserStatistics>('/users/me/statistics')
  },

  // 비밀번호 변경
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiRequest('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword })
    })
  },

  // 계정 삭제
  async deleteAccount(password: string): Promise<void> {
    await apiRequest('/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ password })
    })
  },

  // 설정 조회
  async getSettings(): Promise<UserSettings> {
    return apiRequest<UserSettings>('/users/me/settings')
  },

  // 설정 업데이트
  async updateSettings(settings: UpdateSettingsDto): Promise<UserSettings> {
    return apiRequest<UserSettings>('/users/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    })
  },
}
