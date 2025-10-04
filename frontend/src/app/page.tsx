'use client'

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { tokenManager, mealRecordsApi, type MealRecord } from "@/lib/api/client";
import { MealCard } from "@/components/meal-card";
import Link from "next/link";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [meals, setMeals] = useState<MealRecord[]>([])
  const [mealsLoading, setMealsLoading] = useState(false)

  useEffect(() => {
    const token = tokenManager.get()
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  // 로그인 상태일 때 식사 기록 불러오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchMeals()
    }
  }, [isAuthenticated])

  const fetchMeals = async () => {
    try {
      setMealsLoading(true)
      const result = await mealRecordsApi.getAll()
      console.log('🏠 Home - API Response:', result)
      
      if (Array.isArray(result)) {
        setMeals(result.slice(0, 3)) // 최신 3개만 표시
      } else if (result.data) {
        setMeals(result.data.slice(0, 3)) // 최신 3개만 표시
      }
    } catch (error) {
      console.error('식사 기록 로딩 실패:', error)
      setMeals([]) // 에러시 빈 배열
    } finally {
      setMealsLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    // 로그인 후 식사 기록을 불러옴 (useEffect에서 자동 실행됨)
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
        <h1 className="text-xl font-bold text-gray-900">DailyMeal</h1>
      </header>

      {/* 식사 기록이 없을 때만 Welcome Message 표시 */}
      {mealsLoading ? (
        <div className="p-6 text-center">
          <div className="text-gray-500">식사 기록을 불러오는 중...</div>
        </div>
      ) : meals.length === 0 ? (
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
      ) : (
        // 식사 기록이 있을 때 표시
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">최근 식사 기록</h2>
            <Link href="/feed" className="text-blue-500 text-sm font-medium">
              더보기 →
            </Link>
          </div>
          
          <div className="space-y-4">
            {meals.map((meal) => (
              <MealCard key={meal.id} {...meal} />
            ))}
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}