'use client'

import { useState, useEffect } from 'react'
import { Bell, Lock, MapPin, Home, Briefcase, Save, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { profileApi, type UserSettings } from '@/lib/api'
import { APP_CONFIG } from '@/lib/constants'

export default function SettingsPage() {
  const toast = useToast()
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    // 알림 설정
    notificationFriendRequest: true,
    notificationNewReview: true,
    notificationNearbyFriend: false,
    // 프라이버시 설정
    privacyProfilePublic: false,
    privacyShowLocation: true,
    privacyShowMealDetails: true,
    // 장소 설정
    locationHome: '',
    locationOffice: '',
    locationHomeLatitude: 0,
    locationHomeLongitude: 0,
    locationOfficeLatitude: 0,
    locationOfficeLongitude: 0,
    // AI 추천 설정
    aiRecommendationType: 'social',
    aiRecommendationMaxDistance: 5000,
    aiRecommendationMinRating: 4.0,
    aiRecommendationMaxPrice: undefined,
    aiRecommendationExcludeVisited: true,
  })

  // 설정 데이터 가져오기
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await profileApi.getSettings()
        setSettings(data)
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        toast.error('설정을 불러올 수 없습니다', '오류')
      }
    }

    fetchSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    try {
      await profileApi.updateSettings(settings)
      toast.success('설정이 저장되었습니다', '저장 완료')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('설정 저장에 실패했습니다', '오류')
    }
  }

  const handleLocationSet = async (type: 'home' | 'office') => {
    if (!navigator.geolocation) {
      toast.error('위치 서비스를 사용할 수 없습니다', '오류')
      return
    }

    toast.info('현재 위치를 가져오는 중...', '위치 확인')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // 역지오코딩 - API_BASE_URL 사용
          const response = await fetch(
            `${APP_CONFIG.API_BASE_URL}/geocode/reverse?lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()

          if (data.success && data.address) {
            const shortAddress = data.address.split(',').slice(0, 3).join(', ')
            setSettings((prev) => ({
              ...prev,
              ...(type === 'home'
                ? {
                    locationHome: shortAddress,
                    locationHomeLatitude: latitude,
                    locationHomeLongitude: longitude,
                  }
                : {
                    locationOffice: shortAddress,
                    locationOfficeLatitude: latitude,
                    locationOfficeLongitude: longitude,
                  }),
            }))
            toast.success(`${type === 'home' ? '집' : '회사'} 위치가 설정되었습니다`, '위치 저장')
          }
        } catch (error) {
          console.error('Failed to fetch address:', error)
          toast.error('주소를 가져오는데 실패했습니다', '오류')
        }
      },
      () => {
        toast.error('위치 정보를 가져올 수 없습니다', '오류')
      }
    )
  }

  return (
    <div className="pb-20">
      <div className="p-4 space-y-4 pt-safe">
        {/* 알림 설정 */}
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">알림 설정</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">친구 요청</span>
              <input
                type="checkbox"
                checked={settings.notificationFriendRequest ?? true}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationFriendRequest: e.target.checked,
                  }))
                }
                className="w-5 h-5 text-blue-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-700">새로운 평가</span>
              <input
                type="checkbox"
                checked={settings.notificationNewReview ?? true}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationNewReview: e.target.checked,
                  }))
                }
                className="w-5 h-5 text-blue-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-700">근처 친구 알림</span>
              <input
                type="checkbox"
                checked={settings.notificationNearbyFriend ?? false}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationNearbyFriend: e.target.checked,
                  }))
                }
                className="w-5 h-5 text-blue-500"
              />
            </label>
          </div>
        </section>

        {/* 프라이버시 설정 */}
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={20} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">프라이버시</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between" aria-label="프로필 공개 설정">
              <div>
                <div className="text-gray-700">프로필 공개</div>
                <div className="text-xs text-gray-500">모든 사용자에게 공개</div>
              </div>
              <input
                type="checkbox"
                checked={settings.privacyProfilePublic ?? false}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    privacyProfilePublic: e.target.checked,
                  }))
                }
                className="w-5 h-5 text-blue-500"
              />
            </label>

            <label className="flex items-center justify-between" aria-label="위치 정보 공유 설정">
              <div>
                <div className="text-gray-700">위치 정보 공유</div>
                <div className="text-xs text-gray-500">친구에게만 공개</div>
              </div>
              <input
                type="checkbox"
                checked={settings.privacyShowLocation ?? true}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    privacyShowLocation: e.target.checked,
                  }))
                }
                className="w-5 h-5 text-blue-500"
              />
            </label>

            <label className="flex items-center justify-between" aria-label="식사 상세 공유 설정">
              <div>
                <div className="text-gray-700">식사 상세 공유</div>
                <div className="text-xs text-gray-500">친구에게 사진/메모 공개</div>
              </div>
              <input
                type="checkbox"
                checked={settings.privacyShowMealDetails ?? true}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    privacyShowMealDetails: e.target.checked,
                  }))
                }
                className="w-5 h-5 text-blue-500"
              />
            </label>
          </div>
        </section>

        {/* 자주 가는 장소 */}
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">자주 가는 장소</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            친구에게 지역만 공개됩니다 (정확한 주소는 비공개)
          </p>

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Home size={16} />집
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.locationHome || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      locationHome: e.target.value,
                    }))
                  }
                  placeholder="주소를 입력하거나 현재 위치 설정"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={() => handleLocationSet('home')}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  현재 위치
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Briefcase size={16} />
                회사
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.locationOffice || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      locationOffice: e.target.value,
                    }))
                  }
                  placeholder="주소를 입력하거나 현재 위치 설정"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={() => handleLocationSet('office')}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  현재 위치
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* AI 추천 설정 */}
        <section className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-purple-600" />
            <h2 className="font-semibold text-gray-900">AI 추천 설정</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">추천 타입</label>
              <select
                title="추천 유형"
                value={settings.aiRecommendationType || 'social'}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    aiRecommendationType: e.target.value as 'social' | 'popular' | 'collaborative',
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="social">친구 추천 (친구들이 좋아한 맛집)</option>
                <option value="popular">인기 맛집 (방문 횟수 기반)</option>
                <option value="collaborative">취향 기반 (비슷한 사용자)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                최대 거리: {((settings.aiRecommendationMaxDistance || 5000) / 1000).toFixed(1)}km
              </label>
              <input
                title="최대 거리"
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={settings.aiRecommendationMaxDistance || 5000}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    aiRecommendationMaxDistance: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1km</span>
                <span>10km</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                최소 평점: {settings.aiRecommendationMinRating || 4.0}점
              </label>
              <input
                title="최소 평점"
                type="range"
                min="3.0"
                max="5.0"
                step="0.5"
                value={settings.aiRecommendationMinRating || 4.0}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    aiRecommendationMinRating: parseFloat(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3.0</span>
                <span>5.0</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block">최대 가격 (선택)</label>
              <input
                title="최대 가격"
                type="number"
                value={settings.aiRecommendationMaxPrice || ''}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    aiRecommendationMaxPrice: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                placeholder="예: 20000 (비워두면 제한 없음)"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <label className="flex items-center justify-between">
              <span className="text-gray-700">이미 방문한 곳 제외</span>
              <input
                title="이미 방문한 곳 제외"
                type="checkbox"
                checked={settings.aiRecommendationExcludeVisited ?? true}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    aiRecommendationExcludeVisited: e.target.checked,
                  }))
                }
                className="w-5 h-5 text-blue-500"
              />
            </label>
          </div>
        </section>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Save size={20} />
          설정 저장
        </button>
      </div>
    </div>
  )
}
