// 데일리밀 앱의 핵심 데이터 타입 정의

export interface MealRecord {
  id: string
  name: string
  photo?: string
  photos?: string[]  // 여러 사진 지원
  location?: string
  rating?: number
  memo?: string
  price?: number
  category?: 'home' | 'delivery' | 'restaurant'  // 식사 카테고리
  companionIds?: string[]  // 같이 식사한 친구 ID
  companionNames?: string  // 같이 식사한 사람 이름 (텍스트)
  latitude?: number
  longitude?: number
  address?: string
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

// 친구 관련
export interface Friendship {
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  notificationEnabled: boolean
  createdAt: string
  updatedAt: string
  friend?: User
}

export interface Friend {
  id: string
  email: string
  name: string
  profileImage?: string
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