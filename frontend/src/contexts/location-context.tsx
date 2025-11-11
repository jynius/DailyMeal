'use client'

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
import { createLogger } from '@/lib/logger'
import { useKakaoMap } from '@/hooks/use-kakao-map'

const log = createLogger('LocationContext')

type LocationError = GeolocationPositionError | Error | null
type PermissionState = 'prompt' | 'granted' | 'denied'

interface LocationState {
  latitude: number | null
  longitude: number | null
  address: string | null
  error: LocationError
  isLoading: boolean
  permissionState: PermissionState
  fetchLocation: () => void
}

const LocationContext = createContext<LocationState | undefined>(undefined)

export function LocationProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<LocationError>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt')
  const { isLoaded: isKakaoMapLoaded, error: kakaoMapError } = useKakaoMap()

  const reverseGeocode = useCallback(
    (lat: number, lon: number): Promise<string | null> => {
      return new Promise((resolve, reject) => {
        if (!isKakaoMapLoaded) {
          log.warn('Kakao Map script not loaded yet for reverse geocoding.')
          if (kakaoMapError) {
            const error = new Error(kakaoMapError)
            setError(error)
            return reject(error)
          }
          const notLoadedError = new Error('Kakao Map script not loaded')
          setError(notLoadedError)
          return reject(notLoadedError)
        }

        const geocoder = new (globalThis.window.kakao.maps as any).services.Geocoder()
        geocoder.coord2Address(lon, lat, (result: any, status: any) => {
          if (status === (globalThis.window.kakao.maps as any).services.Status.OK) {
            const newAddress =
              result[0]?.road_address?.address_name || result[0]?.address?.address_name
            if (newAddress) {
              setAddress(newAddress)
              log.info('Kakao reverse geocoding successful', { address: newAddress })
              resolve(newAddress)
            } else {
              log.warn('No address found for coordinates')
              resolve(null)
            }
          } else {
            log.error('Kakao reverse geocoding failed', { status })
            const geocodeError = new Error('Kakao reverse geocoding failed')
            setError(geocodeError)
            reject(geocodeError)
          }
        })
      })
    },
    [isKakaoMapLoaded, kakaoMapError]
  )

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      log.warn('Geolocation is not supported by this browser.')
      setError(new Error('Geolocation is not supported'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        log.info('Geolocation acquired', { latitude, longitude })
        setLatitude(latitude)
        setLongitude(longitude)
        setPermissionState('granted')
        // reverseGeocode 호출을 여기서 분리합니다.
        // 로딩 상태는 새로운 useEffect에서 관리합니다.
      },
      (err) => {
        log.warn('Failed to get geolocation', { code: err.code, message: err.message })
        setError(err)
        setPermissionState('denied')
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1분 캐시
      }
    )
  }, []) // reverseGeocode 의존성 제거

  useEffect(() => {
    const performGeocoding = async () => {
      if (latitude && longitude && isKakaoMapLoaded) {
        try {
          await reverseGeocode(latitude, longitude)
        } catch (e) {
          log.error('Error during reverse geocoding', e)
          // 에러는 reverseGeocode 내부에서 이미 설정됨
        } finally {
          setIsLoading(false)
        }
      } else if (latitude && longitude && !isKakaoMapLoaded) {
        // 좌표는 있으나, 아직 지도 스크립트가 로드되지 않은 경우 로딩 유지
        setIsLoading(true)
      }
    }

    performGeocoding()
  }, [latitude, longitude, isKakaoMapLoaded, reverseGeocode])

  // 권한 상태 확인 및 모니터링
  useEffect(() => {
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          setPermissionState(permission.state as PermissionState)
          log.info('Geolocation permission state:', permission.state)

          // ✅ granted 상태일 때만 자동으로 위치 가져오기 (팝업 없음)
          if (permission.state === 'granted') {
            fetchLocation()
          } else {
            // prompt 또는 denied 상태에서는 로딩 종료 (사용자 액션 대기)
            setIsLoading(false)
          }

          // 권한 상태 변경 감지 (사용자가 설정에서 변경 시)
          permission.onchange = () => {
            const newState = permission.state as PermissionState
            log.info('Geolocation permission changed:', newState)
            setPermissionState(newState)

            if (newState === 'granted') {
              fetchLocation()
            } else if (newState === 'denied') {
              setError(new Error('위치 권한이 거부되었습니다'))
              setIsLoading(false)
            }
          }
        } catch (error) {
          log.debug('Permissions API not supported, will request on manual action', error)
          setIsLoading(false)
        }
      } else {
        // Permissions API 미지원 브라우저 (수동 요청 대기)
        log.debug('Permissions API not supported in this browser')
        setIsLoading(false)
      }
    }

    checkPermission()
  }, [fetchLocation])

  const value = useMemo(
    () => ({
      latitude,
      longitude,
      address,
      error,
      isLoading,
      permissionState,
      fetchLocation,
    }),
    [latitude, longitude, address, error, isLoading, permissionState, fetchLocation]
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}
