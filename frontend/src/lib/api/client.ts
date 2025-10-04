// 데일리밀 API 클라이언트

const API_BASE_URL = 'http://localhost:3001'
console.log('🌐 API Base URL set to:', API_BASE_URL)

export interface ApiResponse<T> {
  success?: boolean
  data?: T
  message?: string
  error?: string
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface MealRecord {
  id: string
  name: string
  photos?: string[]
  location?: string
  rating: number
  memo?: string
  price?: number
  userId: string
  latitude?: number
  longitude?: number
  address?: string
  createdAt: string
  updatedAt: string
}

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
}

// 토큰 관리
export const tokenManager = {
  get: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },
  
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  },
  
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }
}

// API 요청 헬퍼
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenManager.get()
  const isFormData = options.body instanceof FormData
  
  console.log('🔑 API Request Debug:')
  console.log('Endpoint:', endpoint)
  console.log('Full URL:', `${API_BASE_URL}${endpoint}`)
  console.log('Token exists:', !!token)
  console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null')
  console.log('Is FormData:', isFormData)
  
  const headers: Record<string, string> = {}
  
  // 파일 업로드가 아닌 경우만 Content-Type 설정
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  console.log('📤 Making request to:', `${API_BASE_URL}${endpoint}`)

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      error: '서버 오류가 발생했습니다' 
    }))
    throw new Error(error.error || error.message || '요청 실패')
  }

  return response.json()
}

// 인증 API
export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    return apiRequest<{ user: User; token: string; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  login: async (data: { email: string; password: string }) => {
    return apiRequest<{ user: User; token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// 식사 기록 API
export const mealRecordsApi = {
  create: async (data: CreateMealRecordData) => {
    const formData = new FormData()
    
    formData.append('name', data.name)
    formData.append('rating', data.rating.toString())
    
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((photo) => {
        formData.append('photos', photo)
      })
    }
    if (data.location) {
      formData.append('location', data.location)
    }
    if (data.memo) {
      formData.append('memo', data.memo)
    }
    if (data.price) {
      formData.append('price', data.price.toString())
    }
    if (data.latitude) {
      formData.append('latitude', data.latitude.toString())
    }
    if (data.longitude) {
      formData.append('longitude', data.longitude.toString())
    }
    if (data.address) {
      formData.append('address', data.address)
    }
    
    return apiRequest<MealRecord>('/meal-records', {
      method: 'POST',
      body: formData,
    })
  },

  createWithFiles: async (formData: FormData) => {
    return apiRequest<MealRecord>('/meal-records', {
      method: 'POST',
      body: formData,
    })
  },

  getAll: async (page: number = 1, limit: number = 10) => {
    return apiRequest<{
      data: MealRecord[]
      total: number
      page: number
      limit: number
      totalPages: number
    }>(`/meal-records?page=${page}&limit=${limit}`)
  },

  getOne: async (id: string) => {
    return apiRequest<MealRecord>(`/meal-records/${id}`)
  },

  update: async (id: string, data: Partial<CreateMealRecordData>) => {
    return apiRequest<MealRecord>(`/meal-records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/meal-records/${id}`, {
      method: 'DELETE',
    })
  },

  search: async (query: string, page: number = 1, limit: number = 10) => {
    return apiRequest<{
      data: MealRecord[]
      total: number
      page: number
      limit: number
      totalPages: number
    }>(`/meal-records/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
  },

  getStatistics: async () => {
    return apiRequest<{
      totalRecords: number
      avgRating: string
      uniqueLocations: number
    }>('/meal-records/statistics')
  },
}