// Share API 클라이언트
import { apiRequest } from './client';

export interface CreateShareResponse {
  shareId: string;
  url: string;
  ref: string;
}

export interface PublicMealResponse {
  id: string;
  name: string;
  photos?: string[];
  location?: string;
  rating?: number;
  memo?: string;
  price?: number;
  category?: string;
  createdAt: string; // "2025년 1월" 형식
  sharerName: string;
  sharerProfileImage?: string;
  viewCount: number;
}

export interface TrackViewRequest {
  shareId: string;
  ref: string;
  sessionId: string;
}

export interface ConnectFriendRequest {
  ref: string;
}

export interface ShareStats {
  shareId: string;
  mealName: string;
  viewCount: number;
  trackingCount: number;
  conversions: number;
  createdAt: string;
}

/**
 * 공유 링크 생성 (인증 필요)
 */
export async function createShare(mealId: string): Promise<CreateShareResponse> {
  return apiRequest('/share/create', {
    method: 'POST',
    body: JSON.stringify({ mealId }),
  });
}

/**
 * 공개 Meal 조회 (인증 불필요)
 */
export async function getPublicMeal(shareId: string): Promise<PublicMealResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${API_URL}/share/meal/${shareId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch public meal: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 공유 조회 추적 (비로그인)
 */
export async function trackView(data: TrackViewRequest): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  await fetch(`${API_URL}/share/track-view`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * 공유를 통한 친구 연결 (인증 필요)
 */
export async function connectFriend(ref: string): Promise<{ success: boolean; message: string }> {
  return apiRequest('/share/connect-friend', {
    method: 'POST',
    body: JSON.stringify({ ref }),
  });
}

/**
 * 내 공유 통계 조회 (인증 필요)
 */
export async function getMyShareStats(): Promise<ShareStats[]> {
  return apiRequest('/share/my-stats', {
    method: 'GET',
  });
}

/**
 * 브라우저 고유 세션 ID 생성 또는 가져오기
 */
export function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'dailymeal_session_id';
  
  if (typeof window === 'undefined') {
    return 'ssr-session';
  }

  let sessionId = localStorage.getItem(STORAGE_KEY);
  
  if (!sessionId) {
    // UUID v4 생성
    sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
}
