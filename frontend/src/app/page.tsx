'use client'

import { useEffect, useState } from "react";
import { Camera, Plus, Star, MapPin } from "lucide-react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { tokenManager } from "@/lib/api/client";
import Link from "next/link";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = tokenManager.get()
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">DailyMeal</h1>
          <Link href="/add" className="p-2 rounded-full bg-blue-500 text-white">
            <Plus size={20} />
          </Link>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="p-6 text-center">
        <div className="mb-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera size={32} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            환영합니다!
          </h2>
          <p className="text-gray-600 mb-6">
            매일의 식사를 기록하고<br />
            소중한 추억을 남겨보세요
          </p>
        </div>
        
        <Link href="/add" className="block w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors text-center">
          첫 번째 식사 기록하기
        </Link>
      </div>

      {/* Sample Feed (Preview) */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          이런 식으로 기록해보세요
        </h3>
        
        {/* Sample Meal Card */}
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
          <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            <Camera size={48} className="text-orange-400" />
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">맛있는 파스타</h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"} 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin size={14} className="mr-1" />
              홍대 이탈리안 레스토랑
            </div>
            
            <p className="text-sm text-gray-600">
              친구들과 함께 먹은 맛있는 파스타! 
              크림소스가 정말 진했어요 🍝
            </p>
            
            <div className="mt-3 text-xs text-gray-400">
              2024년 10월 3일 오후 1:30
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}