// 데일리밀 앱의 핵심 데이터 타입 정의

export interface MealRecord {
  id: string
  name: string
  photo?: string
  location?: string
  rating?: number
  memo?: string
  price?: number
  createdAt: string
  updatedAt: string
  userId: string
}

export interface CreateMealRequest {
  name: string
  photo: File
  location?: string
  rating?: number
  memo?: string
  price?: number
}

export interface User {
  id: string
  email: string
  name: string
  profileImage?: string
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// 위치 관련
export interface Location {
  address: string
  latitude?: number
  longitude?: number
}