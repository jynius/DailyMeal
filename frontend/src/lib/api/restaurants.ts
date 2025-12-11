// 맛집 API
import { apiRequest } from './client'

export const restaurantsApi = {
  getRestaurants: async (params?: { lat?: number; lon?: number; radius?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.lat) queryParams.append('lat', params.lat.toString())
    if (params?.lon) queryParams.append('lon', params.lon.toString())
    if (params?.radius) queryParams.append('radius', params.radius.toString())
    
    const queryString = queryParams.toString()
    const url = queryString ? `/restaurants?${queryString}` : '/restaurants'
    
    return apiRequest<any[]>(url)
  },

  getRestaurantDetail: async (placeIdOrName: string) => {
    // placeId는 인코딩 불필요, 이름만 인코딩
    const param = placeIdOrName.includes('%') || /^[0-9]+$/.test(placeIdOrName) 
      ? placeIdOrName 
      : encodeURIComponent(placeIdOrName)
    return apiRequest<any>(`/restaurants/detail/${param}`)
  },
}
