// 장소 API
import { apiRequest } from './client'

export interface FrequentLocation {
  location: string
  count: number
  latitude?: number
  longitude?: number
  address?: string
}

export const locationsApi = {
  // 자주 가는 장소 목록 (meal-records에서 추출)
  getFrequentLocations: async () => {
    return apiRequest<FrequentLocation[]>('/meal-records/locations/frequent')
  },
}
