// Kakao Maps Services API를 사용한 장소 검색
// 기존 window.kakao.maps.services를 활용 (REST API 대신 JavaScript SDK)
import { createLogger } from './logger'

const log = createLogger('KakaoLocal')

export interface RestaurantPlace {
  id: string
  place_name: string
  category_name: string
  category_group_code: string
  phone: string
  address_name: string
  road_address_name: string
  x: string // longitude
  y: string // latitude
  place_url: string
  distance: string
}

class KakaoLocalService {
  /**
   * Kakao Maps SDK가 로드되었는지 확인
   */
  private isSDKLoaded(): boolean {
    // window.kakao 타입이 프로젝트 타입 정의에 포함되지 않을 수 있으므로 any로 안전하게 접근
    // 일부 환경에서는 kakao.maps.services가 로드되기 전에 kakao.maps가 존재할 수 있으므로 optional chaining 사용
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win: any = window
    return !!win.kakao?.maps?.services
  }

  /**
   * 카테고리로 장소 검색 (음식점)
   * @param latitude 위도
   * @param longitude 경도
   * @param radius 반경 (미터, 최대 20000)
   * @param category 카테고리 코드 (FD6: 음식점, CE7: 카페)
   */
  async searchByCategory(
    latitude: number,
    longitude: number,
    radius: number = 1000,
    category: 'FD6' | 'CE7' = 'FD6'
  ): Promise<RestaurantPlace[]> {
    if (!this.isSDKLoaded()) {
      log.error('❌ Kakao Maps SDK not loaded')
      return []
    }

    return new Promise((resolve) => {
      try {
        const ps = new (window.kakao.maps as any).services.Places()
        const options = {
          location: new (window.kakao.maps as any).LatLng(latitude, longitude),
          radius: radius,
          sort: (window.kakao.maps as any).services.SortBy.DISTANCE,
        }

        log.info('🔍 Searching nearby places...', {
          latitude,
          longitude,
          radius,
          category,
        })

        ps.categorySearch(
          category,
          (data: any[], status: any) => {
            if (status === (window.kakao.maps as any).services.Status.OK) {
              log.info(`✅ Found ${data.length} places`)
              resolve(data as RestaurantPlace[])
            } else if (status === (window.kakao.maps as any).services.Status.ZERO_RESULT) {
              log.info('No results found')
              resolve([])
            } else {
              log.error('❌ Search failed:', status)
              resolve([])
            }
          },
          options
        )
      } catch (error) {
        log.error('❌ Failed to search places:', error)
        resolve([])
      }
    })
  }

  /**
   * 키워드로 장소 검색
   * @param keyword 검색 키워드 (예: "맛집", "카페")
   * @param latitude 위도
   * @param longitude 경도
   * @param radius 반경 (미터)
   */
  async searchByKeyword(
    keyword: string,
    latitude: number,
    longitude: number,
    radius: number = 5000
  ): Promise<RestaurantPlace[]> {
    if (!this.isSDKLoaded()) {
      log.error('❌ Kakao Maps SDK not loaded')
      return []
    }

    if (!keyword.trim()) {
      log.warn('⚠️ Search keyword is empty')
      return []
    }

    return new Promise((resolve) => {
      try {
        const ps = new (window.kakao.maps as any).services.Places()
        const options = {
          location: new (window.kakao.maps as any).LatLng(latitude, longitude),
          radius: radius,
          sort: (window.kakao.maps as any).services.SortBy.DISTANCE,
        }

        log.info('🔍 Searching by keyword...', {
          keyword,
          latitude,
          longitude,
          radius,
        })

        ps.keywordSearch(
          keyword,
          (data: any[], status: any, pagination: any) => {
            if (status === (window.kakao.maps as any).services.Status.OK) {
              log.info(`✅ Found ${data.length} places for "${keyword}"`, {
                total: pagination.totalCount,
              })
              resolve(data as RestaurantPlace[])
            } else if (status === (window.kakao.maps as any).services.Status.ZERO_RESULT) {
              log.info('No results found')
              resolve([])
            } else {
              log.error('❌ Search failed:', status)
              resolve([])
            }
          },
          options
        )
      } catch (error) {
        log.error('❌ Failed to search by keyword:', error)
        resolve([])
      }
    })
  }

  /**
   * 거리 포맷팅 (미터 -> 킬로미터)
   */
  formatDistance(distanceInMeters: string): string {
    const distance = parseInt(distanceInMeters)
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`
    }
    return `${distance}m`
  }
}

export const kakaoLocal = new KakaoLocalService()
