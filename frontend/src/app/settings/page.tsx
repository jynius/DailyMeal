'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Bell, Lock, MapPin, Home, Briefcase, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { profileApi } from '@/lib/api/profile'

export default function SettingsPage() {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(true)

  const [settings, setSettings] = useState({
    // 알림 설정
    notifications: {
      friendRequest: true,
      newReview: true,
      nearbyFriend: false,
    },
    // 프라이버시 설정
    privacy: {
      profilePublic: false,
      showLocation: true,
      showMealDetails: true,
    },
    // 장소 설정
    locations: {
      home: '',
      office: '',
      homeCoords: { lat: 0, lng: 0 },
      officeCoords: { lat: 0, lng: 0 },
    }
  })

  // 설정 데이터 가져오기
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await profileApi.getSettings()
        setSettings(data)
      } catch (error) {
        console.error('설정 로딩 실패:', error)
        toast.error('설정을 불러올 수 없습니다', '오류')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    try {
      await profileApi.updateSettings(settings)
      toast.success('설정이 저장되었습니다', '저장 완료')
    } catch (error) {
      console.error('설정 저장 실패:', error)
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
          // 역지오코딩
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/geocode/reverse?lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          
          if (data.success && data.address) {
            const shortAddress = data.address.split(',').slice(0, 3).join(', ')
            setSettings(prev => ({
              ...prev,
              locations: {
                ...prev.locations,
                [type]: shortAddress,
                [`${type}Coords`]: { lat: latitude, lng: longitude }
              }
            }))
            toast.success(`${type === 'home' ? '집' : '회사'} 위치가 설정되었습니다`, '위치 저장')
          }
        } catch (error) {
          console.error('역지오코딩 실패:', error)
          toast.error('주소를 가져오는데 실패했습니다', '오류')
        }
      },
      (error) => {
        console.error('위치 가져오기 실패:', error)
        toast.error('위치 정보를 가져올 수 없습니다', '오류')
      }
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10 flex items-center gap-3 pt-safe">
        <button onClick={() => router.back()} className="mt-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 mt-2">설정</h1>
      </header>

      <div className="p-4 space-y-4">
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
                checked={settings.notifications.friendRequest}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, friendRequest: e.target.checked }
                }))}
                className="w-5 h-5 text-blue-500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-gray-700">새로운 평가</span>
              <input
                type="checkbox"
                checked={settings.notifications.newReview}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, newReview: e.target.checked }
                }))}
                className="w-5 h-5 text-blue-500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-gray-700">근처 친구 알림</span>
              <input
                type="checkbox"
                checked={settings.notifications.nearbyFriend}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, nearbyFriend: e.target.checked }
                }))}
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
            <label className="flex items-center justify-between">
              <div>
                <div className="text-gray-700">프로필 공개</div>
                <div className="text-xs text-gray-500">모든 사용자에게 공개</div>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.profilePublic}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, profilePublic: e.target.checked }
                }))}
                className="w-5 h-5 text-blue-500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <div className="text-gray-700">위치 정보 공유</div>
                <div className="text-xs text-gray-500">친구에게만 공개</div>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.showLocation}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, showLocation: e.target.checked }
                }))}
                className="w-5 h-5 text-blue-500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <div className="text-gray-700">식사 상세 공유</div>
                <div className="text-xs text-gray-500">친구에게 사진/메모 공개</div>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.showMealDetails}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, showMealDetails: e.target.checked }
                }))}
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
                <Home size={16} />
                집
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.locations.home}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    locations: { ...prev.locations, home: e.target.value }
                  }))}
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
                  value={settings.locations.office}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    locations: { ...prev.locations, office: e.target.value }
                  }))}
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
