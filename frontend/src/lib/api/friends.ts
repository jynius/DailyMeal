import { apiRequest } from './client';

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
