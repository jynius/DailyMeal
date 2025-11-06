// frontend/src/types/kakao.maps.d.ts

declare global {
  interface Window {
    kakao: {
      maps: {
        load(callback: () => void): void
        LatLng: new (lat: number, lng: number) => any
        Map: new (container: HTMLElement, options: any) => any
        Marker: new (options: any) => any
        InfoWindow: new (options: any) => any
        event: any
        services: {
          Geocoder: new () => {
            coord2Address(
              lng: number,
              lat: number,
              callback: (result: any, status: any) => void
            ): void
          }
          Places: new () => {
            categorySearch(
              code: string,
              callback: (result: any[], status: any, pagination?: any) => void,
              options?: {
                location?: any
                radius?: number
                sort?: any
              }
            ): void
            keywordSearch(
              keyword: string,
              callback: (result: any[], status: any, pagination?: any) => void,
              options?: {
                location?: any
                radius?: number
                sort?: any
              }
            ): void
          }
          Status: {
            OK: 'OK'
            ZERO_RESULT: 'ZERO_RESULT'
            ERROR: 'ERROR'
          }
          SortBy: {
            DISTANCE: string
            ACCURACY: string
          }
        }
      }
    }
  }
}

// 이 파일이 모듈이 되도록 빈 export를 추가합니다.
export {}
