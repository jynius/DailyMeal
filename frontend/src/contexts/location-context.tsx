'use client'

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from 'react'
import { createLogger } from '@/lib/logger'
import { useKakaoMap } from '@/hooks/use-kakao-map'

const log = createLogger('LocationContext')

interface LocationState {
  latitude: number | null
  longitude: number | null
  address: string | null
  error: GeolocationPositionError | Error | null
  isLoading: boolean
  permissionState: 'prompt' | 'granted' | 'denied'
  fetchLocation: () => void
}

const LocationContext = createContext<LocationState | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<GeolocationPositionError | Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const { isLoaded: isKakaoMapLoaded, error: kakaoMapError } = useKakaoMap()

  const reverseGeocode = useCallback((lat: number, lon: number): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (!isKakaoMapLoaded) {
        log.warn('Kakao Map script not loaded yet for reverse geocoding.');
        if (kakaoMapError) {
          const error = new Error(kakaoMapError);
          setError(error);
          return reject(error);
        }
        const notLoadedError = new Error('Kakao Map script not loaded');
        setError(notLoadedError);
        return reject(notLoadedError);
      }

      const geocoder = new (window.kakao.maps as any).services.Geocoder();
      geocoder.coord2Address(lon, lat, (result: any, status: any) => {
        if (status === (window.kakao.maps as any).services.Status.OK) {
          const newAddress = result[0]?.road_address?.address_name || result[0]?.address?.address_name;
          if (newAddress) {
            setAddress(newAddress);
            log.info('Kakao reverse geocoding successful', { address: newAddress });
            resolve(newAddress);
          } else {
            log.warn('No address found for coordinates');
            resolve(null);
          }
        } else {
          log.error('Kakao reverse geocoding failed', { status });
          const geocodeError = new Error('Kakao reverse geocoding failed');
          setError(geocodeError);
          reject(geocodeError);
        }
      });
    });
  }, [isKakaoMapLoaded, kakaoMapError]);

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      log.warn('Geolocation is not supported by this browser.');
      setError(new Error('Geolocation is not supported'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        log.info('Geolocation acquired', { latitude, longitude });
        setLatitude(latitude);
        setLongitude(longitude);
        setPermissionState('granted');
        // reverseGeocode 호출을 여기서 분리합니다.
        // 로딩 상태는 새로운 useEffect에서 관리합니다.
      },
      (err) => {
        log.warn('Failed to get geolocation', { code: err.code, message: err.message });
        setError(err);
        setPermissionState('denied');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1분 캐시
      }
    );
  }, []); // reverseGeocode 의존성 제거

  useEffect(() => {
    const performGeocoding = async () => {
      if (latitude && longitude && isKakaoMapLoaded) {
        try {
          await reverseGeocode(latitude, longitude);
        } catch (e) {
          log.error('Error during reverse geocoding', e);
          // 에러는 reverseGeocode 내부에서 이미 설정됨
        } finally {
          setIsLoading(false);
        }
      } else if (latitude && longitude && !isKakaoMapLoaded) {
        // 좌표는 있으나, 아직 지도 스크립트가 로드되지 않은 경우 로딩 유지
        setIsLoading(true);
      }
    };

    performGeocoding();
  }, [latitude, longitude, isKakaoMapLoaded, reverseGeocode]);

  useEffect(() => {
    const checkPermission = async () => {
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          setPermissionState(permission.state as 'prompt' | 'granted' | 'denied')
          if (permission.state === 'granted') {
            fetchLocation()
          } else {
            setIsLoading(false) // 권한이 없으면 로딩 종료
          }
          permission.onchange = () => {
            setPermissionState(permission.state as 'prompt' | 'granted' | 'denied')
            if (permission.state === 'granted') {
              fetchLocation()
            }
          }
        } catch (error) {
          log.debug('Failed to check geolocation permission, falling back to fetch.', error)
          fetchLocation() // 권한 API 실패 시 일반적인 방법으로 시도
        }
      } else {
        fetchLocation() // permissions API 미지원 브라우저
      }
    }

    checkPermission()
  }, [fetchLocation])

  const value = {
    latitude,
    longitude,
    address,
    error,
    isLoading,
    permissionState,
    fetchLocation,
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}
