// 데일리밀 API 클라이언트
import { APP_CONFIG } from '@/lib/constants'
import { apiMonitor } from './monitor'

const API_BASE_URL = APP_CONFIG.API_BASE_URL

import type { MealRecord, User, Friend } from '@/types'

export interface CreateMealRecordData {
  name: string
  photos?: File[]
  location?: string
  rating: number
  memo?: string
  price?: number
  latitude?: number
  longitude?: number
  address?: string
  category?: 'home' | 'delivery' | 'restaurant'
  companionIds?: string[]
  companionNames?: string
}

// 토큰 관리 (localStorage + 쿠키)
export const tokenManager = {
  get: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },
  
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      // localStorage에 저장
      localStorage.setItem('token', token)
      
      // 쿠키에도 저장 (미들웨어에서 사용)
      // HTTPS에서는 Secure 플래그 필요
      const isSecure = window.location.protocol === 'https:'
      const secureFlag = isSecure ? '; Secure' : ''
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`
    }
  },
  
  remove: () => {
    if (typeof window !== 'undefined') {
      // localStorage에서 제거
      localStorage.removeItem('token')
      
      // 쿠키에서도 제거
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }
}

// API 요청 헬퍼
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenManager.get()
  const isFormData = options.body instanceof FormData
  
  const headers: Record<string, string> = {}
  
  // 파일 업로드가 아닌 경우만 Content-Type 설정
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 성능 모니터링 시작
  const endMonitoring = apiMonitor.startRequest(endpoint, options.method || 'GET')

  // 타임아웃 설정
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.API_TIMEOUT)

  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`)
    console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'None')
    console.log('📋 Headers:', headers)
    if (isFormData) {
      console.log('📦 Body: FormData')
    } else if (options.body) {
      console.log('📦 Body:', options.body)
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    })

    clearTimeout(timeoutId) // 성공시 타임아웃 제거

    console.log(`📡 Response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      // 인증 오류 처리 (401, 403)
      if (response.status === 401 || response.status === 403) {
        // 토큰 제거
        tokenManager.remove()
        
        // 로그인 페이지로 리다이렉트 (클라이언트 사이드에서만)
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
        
        const errorMsg = '인증이 필요합니다. 로그인 페이지로 이동합니다.'
        endMonitoring(response.status, errorMsg)
        throw new Error(errorMsg)
      }
      
      const error = await response.json().catch(() => ({ 
        error: '서버 오류가 발생했습니다' 
      }))
      console.error('❌ API Error:', error)
      
      const errorMsg = error.error || error.message || '요청 실패'
      endMonitoring(response.status, errorMsg)
      throw new Error(errorMsg)
    }

    const data = await response.json()
    console.log('✅ API Success:', data)
    
    // 성공 모니터링
    endMonitoring(response.status)
    
    return data
  } catch (error: unknown) {
    const err = error as Error
    clearTimeout(timeoutId) // 오류시 타임아웃 제거
    
    if (err.name === 'AbortError') {
      endMonitoring(0, '요청 시간 초과')
      throw new Error('요청이 시간 초과되었습니다')
    }
    
    if (('code' in err && err.code === 'ECONNREFUSED') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
      endMonitoring(0, '연결 실패')
      throw new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    }
    
    // 이미 모니터링된 에러가 아니면 기록
    if (!err.message?.includes('인증이 필요') && !err.message?.includes('요청 실패')) {
      endMonitoring(0, err.message)
    }
    
    throw err
  }
}

// 인증 API
const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    return apiRequest<{ user: User; token: string; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string }) => {
    return apiRequest<{ user: User; token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 식사 기록 API
const mealRecordsApi = {
  create: async (data: CreateMealRecordData) => {
    const formData = new FormData();
    
    formData.append('name', data.name);
    formData.append('rating', data.rating.toString());
    
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }
    if (data.location) {
      formData.append('location', data.location);
    }
    if (data.memo) {
      formData.append('memo', data.memo);
    }
    if (data.price) {
      formData.append('price', data.price.toString());
    }
    if (data.latitude) {
      formData.append('latitude', data.latitude.toString());
    }
    if (data.longitude) {
      formData.append('longitude', data.longitude.toString());
    }
    if (data.address) {
      formData.append('address', data.address);
    }
    
    return apiRequest<MealRecord>('/meal-records', {
      method: 'POST',
      body: formData,
    });
  },

  createWithFiles: async (formData: FormData) => {
    return apiRequest<MealRecord>('/meal-records', {
      method: 'POST',
      body: formData,
    });
  },

  getAll: async (page: number = 1, limit: number = 10) => {
    return apiRequest<{
      data: MealRecord[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/meal-records?page=${page}&limit=${limit}`);
  },

  getOne: async (id: string) => {
    return apiRequest<MealRecord>(`/meal-records/${id}`);
  },

  update: async (id: string, data: Partial<CreateMealRecordData>) => {
    return apiRequest<MealRecord>(`/meal-records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/meal-records/${id}`, {
      method: 'DELETE',
    });
  },

  search: async (query: string, page: number = 1, limit: number = 10) => {
    return apiRequest<{
      data: MealRecord[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/meal-records/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  },

  getStatistics: async () => {
    return apiRequest<{
      totalRecords: number;
      avgRating: string;
      uniqueLocations: number;
    }>('/meal-records/statistics');
  },
};

// 친구 API
const friendsApi = {
  // 친구 목록 조회
  getFriends: async () => {
    return apiRequest<Friend[]>('/friends');
  },

  // 친구 검색
  searchUsers: async (query: string) => {
    return apiRequest<Friend[]>(`/friends/search?query=${encodeURIComponent(query)}`);
  },

  // 친구 요청 보내기
  sendRequest: async (email: string) => {
    return apiRequest<{ message: string }>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// 맛집 API
const restaurantsApi = {
  getRestaurants: async () => {
    return apiRequest<any[]>('/restaurants');
  },
};

// 장소 API (자주 가는 장소 목록 조회)
const locationsApi = {
  // 자주 가는 장소 목록 (meal-records에서 추출)
  getFrequentLocations: async () => {
    return apiRequest<Array<{
      location: string;
      count: number;
      latitude?: number;
      longitude?: number;
      address?: string;
    }>>('/meal-records/locations/frequent');
  },
};

export {
  authApi,
  mealRecordsApi,
  friendsApi,
  restaurantsApi,
  locationsApi,
}
