'use client'

import { useEffect, useState } from "react";
import { Camera, TrendingUp, MapPin, Users, Sparkles, ArrowRight, Zap } from 'lucide-react'
import { BottomNavigation } from "@/components/bottom-navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { tokenManager, mealRecordsApi } from "@/lib/api/client";
import type { MealRecord } from "@/types";
import { MealCard } from "@/components/meal-card";
import { useSocket } from "@/contexts/socket-context";
import { AIMenuRecommendation } from "@/components/ai-menu-recommendation";
import Link from "next/link";


export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [meals, setMeals] = useState<MealRecord[]>([])
  const [mealsLoading, setMealsLoading] = useState(false)
  const { notifications, isConnected, connectedUsers } = useSocket()

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
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 safe-area">
        {/* Hero Section */}
        <div className="px-4 sm:px-6 pt-safe-top pb-6 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg touch-target">
              <Sparkles size={28} className="text-white sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">DailyMeal</h1>
            <p className="text-gray-600 text-base sm:text-lg px-2">매일의 맛있는 순간을 기록하고 공유하세요</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 touch-target">
              <Camera size={20} className="text-blue-500 mx-auto mb-2 sm:w-6 sm:h-6" />
              <p className="text-xs sm:text-sm font-medium text-gray-700">사진 기록</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 touch-target">
              <MapPin size={20} className="text-green-500 mx-auto mb-2 sm:w-6 sm:h-6" />
              <p className="text-xs sm:text-sm font-medium text-gray-700">맛집 공유</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 touch-target">
              <TrendingUp size={20} className="text-purple-500 mx-auto mb-2 sm:w-6 sm:h-6" />
              <p className="text-xs sm:text-sm font-medium text-gray-700">통계 분석</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 touch-target">
              <Users size={20} className="text-orange-500 mx-auto mb-2 sm:w-6 sm:h-6" />
              <p className="text-xs sm:text-sm font-medium text-gray-700">소셜 공유</p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="px-4 sm:px-6 pb-safe-bottom">
          <AuthForm onSuccess={handleAuthSuccess} />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      {/* Header with Gradient */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">DailyMeal</h1>
            <p className="text-blue-100 text-sm">오늘도 맛있는 하루 되세요!</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
        </div>
      </header>

      {/* 빠른 액션 카드들 */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/add" className="group">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <Camera size={20} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">식사 기록</h3>
              <p className="text-xs text-gray-500">오늘 먹은 음식을 기록해보세요</p>
            </div>
          </Link>

          <Link href="/restaurants" className="group">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <MapPin size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">맛집 탐색</h3>
              <p className="text-xs text-gray-500">주변 음식점을 찾아보세요</p>
            </div>
          </Link>
        </div>

        {/* 실시간 활동 섹션 */}
        {isConnected && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-gray-900">실시간 활동</h3>
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                <Users size={10} />
                {connectedUsers}
              </div>
            </div>
            
            {notifications.filter(n => ['NEW_MEAL', 'NEW_RESTAURANT'].includes(n.type)).slice(0, 3).length > 0 ? (
              <div className="space-y-2">
                {notifications
                  .filter(n => ['NEW_MEAL', 'NEW_RESTAURANT'].includes(n.type))
                  .slice(0, 3)
                  .map(notification => (
                    <div key={notification.id} className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {notification.type === 'NEW_MEAL' 
                            ? `새로운 식사: ${notification.data.name}` 
                            : `새로운 음식점: ${notification.data.name}`
                          }
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <Zap size={16} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">아직 실시간 활동이 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* AI 추천 메뉴 섹션 */}
        <div className="mb-6">
          <AIMenuRecommendation />
        </div>
      </div>

      {/* 최근 식사 기록 또는 시작 가이드 */}
      {mealsLoading ? (
        <div className="px-6 py-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      ) : meals.length === 0 ? (
        <div className="px-6 py-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">시작해보세요!</h3>
            <p className="text-gray-600 mb-4">
              첫 번째 식사를 기록하고<br />
              맛있는 여정을 시작해보세요
            </p>
            <Link 
              href="/add" 
              className="inline-flex items-center bg-blue-500 text-white py-2.5 px-5 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              <Camera size={18} className="mr-2" />
              첫 기록 만들기
            </Link>
          </div>
        </div>
      ) : (
        <div className="px-6 py-2">
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">최근 식사</h2>
            <Link 
              href="/feed" 
              className="flex items-center text-blue-500 text-sm font-medium hover:text-blue-600"
            >
              전체보기
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {/* 식사 기록 카드들 */}
          <div className="space-y-3">
            {meals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <MealCard {...meal} />
              </div>
            ))}
          </div>

          {/* 더 많은 액션들 */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Link 
              href="/restaurants/map/create" 
              className="bg-white p-3 rounded-xl text-center shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <MapPin size={20} className="text-purple-500 mx-auto mb-1" />
              <span className="text-xs font-medium text-gray-700">맛집맵</span>
            </Link>
            
            <Link 
              href="/search" 
              className="bg-white p-3 rounded-xl text-center shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <Users size={20} className="text-orange-500 mx-auto mb-1" />
              <span className="text-xs font-medium text-gray-700">검색</span>
            </Link>
            
            <Link 
              href="/profile" 
              className="bg-white p-3 rounded-xl text-center shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <TrendingUp size={20} className="text-green-500 mx-auto mb-1" />
              <span className="text-xs font-medium text-gray-700">통계</span>
            </Link>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}