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

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords
      log.info('Geolocation acquired', { latitude, longitude })
      setLatitude(latitude)
      setLongitude(longitude)
      setPermissionState('granted')
      // 좌표 확보 즉시 로딩 종료 (주소는 백그라운드에서 비동기로 가져옴)
      setIsLoading(false)
    }

    const handleError = (err: GeolocationPositionError, isHighAccuracy: boolean) => {
      // Timeout(code 3)이고 HighAccuracy 시도였다면 LowAccuracy로 재시도
      if (err.code === 3 && isHighAccuracy) {
        log.warn('High accuracy geolocation timed out, retrying with low accuracy...')
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (retryErr) => handleError(retryErr, false),
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000,
          }
        )
        return
      }

      // 최종 실패 시 에러 설정 (사용자가 수동으로 위치 선택 가능)
      log.warn('Failed to get geolocation', { code: err.code, message: err.message })
      setError(err)
      if (err.code === 1) {
        // PERMISSION_DENIED
        setPermissionState('denied')
      }
      setIsLoading(false)
    }

    // 1차 시도: High Accuracy
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (err) => handleError(err, true),
      {
        enableHighAccuracy: true,
        timeout: 5000, // 5초 타임아웃 (빠른 실패를 위해 줄임)
        maximumAge: 60000,
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
          // 에러가 발생해도 좌표는 이미 확보된 상태이므로 계속 사용 가능
        }
      } else if (latitude && longitude && !isKakaoMapLoaded) {
        // 좌표는 있으나 지도 스크립트가 아직 로드 안 됨 (주소는 나중에)
        log.debug('Coordinates acquired, waiting for Kakao Map to load for address')
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
