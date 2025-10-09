// API 요청 헬퍼 함수
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: '서버 오류가 발생했습니다' 
    }))
    throw new Error(error.message || '요청 실패')
  }

  return response.json()
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string | null
  bio?: string | null
  reviewsCount: number
  restaurantCount: number
  friendsCount: number
  isFriend: boolean
  isNotificationEnabled: boolean
}

export interface FriendRequest {
  id: string
  userId: string
  username: string
  email: string
  avatar?: string | null
  bio?: string | null
  reviewsCount: number
  restaurantCount: number
  friendsCount: number
  createdAt: string
}

export interface SentRequest {
  id: string
  friendId: string
  username: string
  email: string
  avatar?: string | null
  bio?: string | null
  reviewsCount: number
  restaurantCount: number
  friendsCount: number
  createdAt: string
}

export interface SearchResult {
  id: string
  username: string
  email: string
  avatar?: string | null
  bio?: string | null
  reviewsCount: number
  restaurantCount: number
  friendsCount: number
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
}

export const friendsApi = {
  // 내 친구 목록
  async getFriends(): Promise<User[]> {
    return apiRequest<User[]>('/friends')
  },

  // 받은 친구 요청 목록
  async getReceivedRequests(): Promise<FriendRequest[]> {
    return apiRequest<FriendRequest[]>('/friends/requests/received')
  },

  // 보낸 친구 요청 목록
  async getSentRequests(): Promise<SentRequest[]> {
    return apiRequest<SentRequest[]>('/friends/requests/sent')
  },

  // 사용자 검색
  async searchUsers(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return []
    return apiRequest<SearchResult[]>(`/friends/search?query=${encodeURIComponent(query)}`)
  },

  // 친구 요청 보내기
  async sendFriendRequest(email: string): Promise<void> {
    await apiRequest('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  },

  // 친구 요청 수락
  async acceptFriendRequest(friendshipId: string): Promise<void> {
    await apiRequest(`/friends/${friendshipId}/accept`, {
      method: 'POST'
    })
  },

  // 친구 요청 거절
  async rejectFriendRequest(friendshipId: string): Promise<void> {
    await apiRequest(`/friends/${friendshipId}/reject`, {
      method: 'POST'
    })
  },

  // 친구 요청 취소
  async cancelFriendRequest(friendshipId: string): Promise<void> {
    await apiRequest(`/friends/requests/${friendshipId}`, {
      method: 'DELETE'
    })
  },

  // 친구 삭제
  async removeFriend(friendId: string): Promise<void> {
    await apiRequest(`/friends/${friendId}`, {
      method: 'DELETE'
    })
  },

  // 친구 알림 설정
  async toggleNotification(friendId: string, enabled: boolean): Promise<void> {
    await apiRequest(`/friends/${friendId}/notification`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled })
    })
  },
}
