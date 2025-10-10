'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, TrendingUp, MapPin, Users, Sparkles, ArrowRight, Zap } from 'lucide-react'
import { BottomNavigation } from "@/components/bottom-navigation";
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
  const router = useRouter()

  useEffect(() => {
    const token = tokenManager.get()
    const authenticated = !!token
    setIsAuthenticated(authenticated)
    
    // 비로그인 상태일 때 재방문자 체크
    if (!authenticated) {
      const hasVisited = localStorage.getItem('hasVisited')
      if (hasVisited === 'true') {
        // 재방문자는 바로 로그인 페이지로
        router.push('/login')
      } else {
        // 첫 방문자는 랜딩 페이지 보여주고 방문 기록
        localStorage.setItem('hasVisited', 'true')
      }
    }
    
    setIsLoading(false)
  }, [router])

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
        setMeals(result) // 전체 데이터 가져오기
      } else if (result.data) {
        setMeals(result.data) // 전체 데이터 가져오기
      }
    } catch (error) {
      console.error('식사 기록 로딩 실패:', error)
      setMeals([]) // 에러시 빈 배열
    } finally {
      setMealsLoading(false)
    }
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

  // 비로그인 상태: 랜딩 페이지 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 text-white">
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">DailyMeal</h1>
            <p className="text-xl text-blue-100">
              매일의 맛있는 순간을<br />기록하고 공유하세요
            </p>
          </div>

          <div className="space-y-4 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">식사 기록</h3>
                  <p className="text-blue-100 text-sm">사진과 함께 오늘의 식사를 남겨보세요</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">통계 분석</h3>
                  <p className="text-blue-100 text-sm">나의 식사 패턴을 한눈에 확인하세요</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">친구와 공유</h3>
                  <p className="text-blue-100 text-sm">맛집 정보를 친구들과 나눠보세요</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link 
              href="/signup"
              className="block w-full bg-white text-blue-600 text-center py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              시작하기
            </Link>
            <Link 
              href="/login"
              className="block w-full bg-white/10 backdrop-blur-sm text-white text-center py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/30"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-24">
      {/* Header with Gradient */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          {/* 장식 아이콘 */}
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          
          <h1 className="text-2xl font-bold">DailyMeal</h1>
        </div>
      </header>

      {/* 빠른 액션 카드들 */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/statistics" className="group">
            <div className="bg-white px-4 py-1 rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 pl-2">통계</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">식사 기록을 분석해보세요.</p>
            </div>
          </Link>

          <Link href="/restaurant" className="group">
            <div className="bg-white px-4 py-1 rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <MapPin size={20} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 pl-2">맛집 탐색</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">주변 음식점을 찾아보세요.</p>
            </div>
          </Link>
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
          {/* 미평가 식사 섹션 */}
          {(() => {
            // rating이 없는 항목만 미평가로 간주
            const unratedMeals = meals.filter(meal => !meal.rating);
            const unratedMeal = unratedMeals[0];
            
            if (!unratedMeal) return null;
            
            return (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900">평가 완료하기</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                      미평가 {unratedMeals.length}개
                    </span>
                    <Link
                      href="/feed?filter=unrated"
                      className="flex items-center text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      평가하기
                      <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
                  <MealCard {...unratedMeal} onEvaluated={fetchMeals} />
                </div>
              </div>
            );
          })()}
          
          {/* 최근 평가 완료된 식사 섹션 */}
          {(() => {
            // rating이 있는 항목만 평가 완료로 간주
            const ratedMeals = meals
              .filter(meal => meal.rating)
              .slice(0, 3);
            
            if (ratedMeals.length === 0) return null;
            
            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">최근 식사</h2>
                  <Link 
                    href="/feed?filter=rated" 
                    className="flex items-center text-blue-500 text-sm font-medium hover:text-blue-600"
                  >
                    전체보기
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
                
                {/* 식사 기록 리스트 (텍스트만) */}
                <div className="space-y-2">
                  {ratedMeals.map((meal) => (
                    <Link 
                      key={meal.id} 
                      href={`/feed`}
                      className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* 동행자 (맨 위) */}
                          <div className="flex items-center text-xs text-gray-700 mb-2 pb-2 border-b border-gray-100">
                            <span className="mr-1.5">
                              {meal.companionNames ? '👥' : '🙋'}
                            </span>
                            <span className="truncate">{meal.companionNames || '혼밥'}</span>
                          </div>

                          {/* 식사 이름 */}
                          <h3 className="font-bold text-gray-900 mb-1 truncate">{meal.name}</h3>
                          
                          {/* 가격 */}
                          {meal.price && (
                            <div className="text-base font-semibold text-blue-600 mb-2">
                              ₩{meal.price.toLocaleString()}
                            </div>
                          )}
                          
                          {/* 식당 이름 & 날짜 */}
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            {meal.location && (
                              <>
                                <div className="flex items-center">
                                  <MapPin size={12} className="mr-1 flex-shrink-0" />
                                  <span className="font-medium truncate">{meal.location}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                              </>
                            )}
                            <span className="whitespace-nowrap">
                              {new Date(meal.createdAt).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          {/* 별점 */}
                          {meal.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < meal.rating! ? "text-yellow-500" : "text-gray-300"}>
                                  ⭐
                                </span>
                              ))}
                              <span className="ml-1 text-sm font-semibold text-gray-700">
                                {meal.rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <ArrowRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* AI 추천 메뉴 섹션 - 맨 아래로 이동 */}
      {isAuthenticated && (
        <div className="px-6 pb-4">
          <AIMenuRecommendation />
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}