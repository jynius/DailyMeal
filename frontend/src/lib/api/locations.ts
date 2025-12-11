// 장소 API
import { apiRequest } from './client'

export interface FrequentLocation {
  location: string
  count: number
  latitude?: number
  longitude?: number
  address?: string
}

export interface UserLocation {
  id: string
  userId: string
  locationGroupId: string
  name: string
  address?: string
  latitude?: number
  longitude?: number
  isCustom: boolean
  notes?: string
  createdAt: string
  updatedAt: string
  locationGroup?: LocationGroup
}

export interface LocationGroup {
  id: string
  canonicalName: string
  latitude: number
  longitude: number
  address?: string
  category?: string
  externalMappings?: ExternalPlaceMapping[]
}

export interface ExternalPlaceMapping {
  id: string
  locationGroupId: string
  platform: 'kakao' | 'naver' | 'google' | 'instagram'
  externalId: string
  externalName: string
  externalData?: Record<string, any>
  isActive: boolean
}

export interface FriendRecommendation {
  locationGroup: LocationGroup
  friendCount: number
  friendNames: string[]
  myName?: string
}

export interface CreateLocationParams {
  name: string
  address?: string
  latitude?: number
  longitude?: number
  externalPlatform?: 'kakao' | 'naver' | 'google' | 'instagram'
  externalId?: string
  externalName?: string
  externalData?: Record<string, any>
  notes?: string
}

export interface UpdateLocationParams {
  name?: string
  notes?: string
}

export const locationsApi = {
  // 자주 가는 장소 목록 (meal-records에서 추출) - Legacy
  getFrequentLocations: async () => {
    return apiRequest<FrequentLocation[]>('/meal-records/locations/frequent')
  },

  // 내 식당 목록 조회 (새 시스템)
  getMyLocations: async () => {
    return apiRequest<UserLocation[]>('/locations')
  },

  // 특정 식당 조회
  getLocation: async (id: string) => {
    return apiRequest<UserLocation>(`/locations/${id}`)
  },

  // 새 식당 추가
  createLocation: async (params: CreateLocationParams) => {
    return apiRequest<UserLocation>('/locations', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  // 식당 정보 수정
  updateLocation: async (id: string, params: UpdateLocationParams) => {
    return apiRequest<UserLocation>(`/locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    })
  },

  // 식당 삭제
  deleteLocation: async (id: string) => {
    return apiRequest<{ message: string }>(`/locations/${id}`, {
      method: 'DELETE',
    })
  },

  // 근처 식당 찾기
  findNearbyLocations: async (
    latitude: number,
    longitude: number,
    radius: number = 50
  ) => {
    return apiRequest<LocationGroup[]>('/locations/nearby', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, radius }),
    })
  },

  // 친구 추천 식당
  getFriendRecommendations: async () => {
    return apiRequest<FriendRecommendation[]>('/locations/recommendations/friends')
  },
}
