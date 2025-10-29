// frontend/src/lib/api/meals.ts

import type { MealRecord } from '@/types'
import { apiRequest } from './client'

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

// 식사 기록 API
export const mealRecordsApi = {
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
