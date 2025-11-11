'use client'

import { useState, useEffect } from 'react'
import { X, Star, MapPin, Home, Bike, UtensilsCrossed, Users, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAlert } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'
import { useLocation } from '@/contexts/location-context'
import { mealRecordsApi, friendsApi, locationsApi } from '@/lib/api'
import { formatPrice, parsePrice } from '@/lib/utils/format'
import { kakaoLocal, type RestaurantPlace } from '@/lib/kakao-local'
import type { MealRecord, Friend } from '@/types'

interface EvaluateModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly mealId: string
  readonly mealName: string
  readonly existingMeal?: MealRecord | null
  readonly onSuccess?: () => void
}

export function EvaluateModal({
  isOpen,
  onClose,
  mealId,
  mealName,
  existingMeal,
  onSuccess,
}: Readonly<EvaluateModalProps>) {
  const [formData, setFormData] = useState({
    name: '',
    rating: 0,
    location: '',
    price: '',
    memo: '',
    category: 'restaurant' as 'home' | 'delivery' | 'restaurant',
    companionIds: [] as string[],
    companionNames: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [locations, setLocations] = useState<Array<{ location: string; count: number }>>([])
  const [nearbyPlaces, setNearbyPlaces] = useState<RestaurantPlace[]>([])
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showFriendDropdown, setShowFriendDropdown] = useState(false)
  const [companionInput, setCompanionInput] = useState('')
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([])
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const { showAlert } = useAlert()
  const { success: showSuccess } = useToast()

  // Modal이 열릴 때마다 초기화 또는 기존 데이터 로드
  const {
    permissionState,
    fetchLocation,
    latitude: contextLat,
    longitude: contextLng,
  } = useLocation()

  // Context에서 위치 받아오기
  useEffect(() => {
    if (contextLat && contextLng) {
      setUserLat(contextLat)
      setUserLng(contextLng)
    }
  }, [contextLat, contextLng])

  useEffect(() => {
    if (isOpen) {
      // ✅ Context를 통한 위치 가져오기 (권한 관리 자동)
      if (globalThis.window !== undefined && permissionState !== 'denied') {
        fetchLocation() // granted면 팝업 없이, prompt면 팝업 1회
      }

      if (existingMeal) {
        // 수정 모드: 기존 데이터 불러오기
        setFormData({
          name: existingMeal.name || '',
          rating: existingMeal.rating || 0,
          location: existingMeal.location || '',
          price: existingMeal.price ? formatPrice(existingMeal.price) : '',
          memo: existingMeal.memo || '',
          category: existingMeal.category || 'restaurant',
          companionIds: existingMeal.companionIds || [],
          companionNames: existingMeal.companionNames || '',
        })
      } else {
        // 새 평가 모드: 초기화
        setFormData({
          name: mealName,
          rating: 0,
          location: '',
          price: '',
          memo: '',
          category: 'restaurant',
          companionIds: [],
          companionNames: '',
        })
      }
      // 친구 목록과 자주 가는 장소 불러오기
      loadFriends()
      loadLocations()

      // 식당 카테고리인 경우 근처 식당도 불러오기
      if (!existingMeal || existingMeal.category === 'restaurant') {
        loadNearbyPlaces()
      }
    }
  }, [isOpen, existingMeal, mealName])

  const loadFriends = async () => {
    try {
      const data = await friendsApi.getFriends()
      // friendsApi.User 타입을 Friend 타입으로 변환
      const friendData: Friend[] = data.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.username, // username을 name으로 매핑
        profileImage: user.avatar || undefined, // avatar를 profileImage로 매핑
      }))
      setFriends(friendData)
    } catch (error) {
      console.error('친구 목록 불러오기 실패:', error)
    }
  }

  const loadLocations = async () => {
    try {
      const data = await locationsApi.getFrequentLocations()
      setLocations(data)
    } catch (error) {
      console.error('장소 목록 불러오기 실패:', error)
    }
  }

  const loadNearbyPlaces = async () => {
    if (!userLat || !userLng) {
      console.log('사용자 위치 정보 없음')
      return
    }

    setIsLoadingPlaces(true)
    try {
      // 현재 위치 기준 1km 반경 내 음식점 검색
      const places = await kakaoLocal.searchByCategory(userLat, userLng, 1000, 'FD6')
      setNearbyPlaces(places.slice(0, 10)) // 최대 10개만 표시
      console.log(`✅ 근처 식당 ${places.length}개 로드 완료`)
    } catch (error) {
      console.error('근처 식당 불러오기 실패:', error)
    } finally {
      setIsLoadingPlaces(false)
    }
  }

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    globalThis.window.addEventListener('keydown', handleEsc)
    return () => globalThis.window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleRatingClick = (value: number) => {
    setFormData((prev) => ({ ...prev, rating: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.rating === 0) {
      showAlert({
        title: '평점 필수',
        message: '평점을 선택해주세요.',
        type: 'warning',
      })
      return
    }

    if (!formData.name.trim()) {
      showAlert({
        title: '이름 필수',
        message: '식사 이름을 입력해주세요.',
        type: 'warning',
      })
      return
    }

    setIsSubmitting(true)

    const updateData: any = {
      name: formData.name.trim(),
      rating: formData.rating,
      category: formData.category,
    }

    try {
      if (formData.location.trim()) {
        updateData.location = formData.location.trim()
      }
      if (formData.price) {
        const priceValue = parsePrice(formData.price)
        if (priceValue > 0) {
          updateData.price = priceValue
        }
      }
      if (formData.memo.trim()) {
        updateData.memo = formData.memo.trim()
      }
      if (formData.companionIds.length > 0) {
        updateData.companionIds = formData.companionIds
      }
      if (formData.companionNames.trim()) {
        updateData.companionNames = formData.companionNames.trim()
      }

      await mealRecordsApi.update(mealId, updateData)

      console.log('✅ 평가 저장 완료')
      showSuccess('평가가 저장되었습니다! ⭐', '완료')

      // 성공 콜백 실행 (데이터 새로고침)
      if (onSuccess) {
        onSuccess()
      }

      // Modal 닫기
      onClose()
    } catch (error: unknown) {
      const err = error as Error
      console.error('❌ 평가 저장 실패:', err)
      console.error('📦 전송 데이터:', updateData)

      showAlert({
        title: '저장 실패',
        message: err.message || '평가 저장에 실패했습니다.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePriceChange = (value: string) => {
    // 숫자와 쉼표만 허용
    const cleaned = value.replaceAll(/[^\d]/g, '')
    if (cleaned === '') {
      setFormData((prev) => ({ ...prev, price: '' }))
      return
    }
    const formatted = formatPrice(cleaned)
    setFormData((prev) => ({ ...prev, price: formatted }))
  }

  const toggleFriend = (friendId: string) => {
    setFormData((prev) => ({
      ...prev,
      companionIds: prev.companionIds.includes(friendId)
        ? prev.companionIds.filter((id) => id !== friendId)
        : [...prev.companionIds, friendId],
    }))
  }

  const handleCompanionInputChange = (value: string) => {
    setCompanionInput(value)

    // 친구 목록에서 필터링
    if (value.trim()) {
      const filtered = friends.filter(
        (f) =>
          f.name.toLowerCase().includes(value.toLowerCase()) &&
          !formData.companionIds.includes(f.id)
      )
      setFilteredFriends(filtered)
      setShowFriendDropdown(filtered.length > 0)
    } else {
      setFilteredFriends([])
      setShowFriendDropdown(false)
    }
  }

  const selectFriendFromAutocomplete = (friend: Friend) => {
    toggleFriend(friend.id)
    setCompanionInput('')
    setFilteredFriends([])
    setShowFriendDropdown(false)
  }

  const handleCompanionInputBlur = () => {
    setTimeout(() => {
      // 자동완성에서 선택하지 않은 경우, 텍스트로 저장
      if (companionInput.trim() && filteredFriends.length === 0) {
        const currentNames = formData.companionNames.trim()
        const newName = companionInput.trim()
        const updatedNames = currentNames ? `${currentNames}, ${newName}` : newName
        setFormData((prev) => ({ ...prev, companionNames: updatedNames }))
        setCompanionInput('')
      }
      setShowFriendDropdown(false)
    }, 200)
  }

  const selectedFriends = friends.filter((f) => formData.companionIds.includes(f.id))

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="모달 닫기"
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10 rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            {existingMeal ? '식사 평가 수정하기' : `${mealName} 평가하기`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* 식사 이름 */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              식사 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 마르게리따 피자"
              required
            />
          </div>

          {/* 평점 */}
          <div className="space-y-2">
            <div className="block text-sm font-medium text-gray-700">
              평점 <span className="text-red-500">*</span>
            </div>
            <div className="flex gap-2 justify-center py-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingClick(value)}
                  className="transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Star
                    size={40}
                    className={`${
                      value <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p className="text-center text-sm text-gray-600">{formData.rating}점 선택됨</p>
            )}
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <div className="block text-sm font-medium text-gray-700">식사 유형</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, category: 'home', location: '집' }))
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  formData.category === 'home'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Home size={18} />
                <span className="text-sm font-medium">집밥</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, category: 'delivery', location: '집' }))
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  formData.category === 'delivery'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Bike size={18} />
                <span className="text-sm font-medium">배달</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, category: 'restaurant' }))
                  // 식당으로 변경 시 근처 식당 로드
                  loadNearbyPlaces()
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  formData.category === 'restaurant'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <UtensilsCrossed size={18} />
                <span className="text-sm font-medium">식당</span>
              </button>
            </div>
          </div>

          {/* 장소 */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              장소
            </label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
              />
              <input
                type="text"
                id="location"
                name="location"
                autoComplete="off"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                onFocus={() => setShowLocationDropdown(true)}
                onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  formData.category === 'restaurant'
                    ? '식당 이름 또는 위치'
                    : '집, 회사, 또는 직접 입력'
                }
              />
              {showLocationDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {formData.category === 'home' || formData.category === 'delivery' ? (
                    // 집밥/배달: 집, 회사 옵션
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, location: '집' }))
                          setShowLocationDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Home size={16} className="text-blue-500" />
                        <span className="text-sm font-medium">집</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, location: '회사' }))
                          setShowLocationDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <UtensilsCrossed size={16} className="text-green-500" />
                        <span className="text-sm font-medium">회사</span>
                      </button>
                    </>
                  ) : (
                    // 식당: 근처 식당 + 자주 가는 장소 목록
                    <>
                      {/* 근처 식당 섹션 */}
                      {nearbyPlaces.length > 0 && (
                        <>
                          <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                            <Navigation size={14} className="text-blue-600" />
                            <span className="text-xs font-semibold text-blue-700">근처 식당</span>
                            {isLoadingPlaces && (
                              <span className="text-xs text-blue-500">로딩 중...</span>
                            )}
                          </div>
                          {nearbyPlaces.map((place) => (
                            <button
                              key={place.id}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, location: place.place_name }))
                                setShowLocationDropdown(false)
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {place.place_name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {place.road_address_name || place.address_name}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    {place.category_name.split(' > ').slice(-2).join(' > ')}
                                  </div>
                                </div>
                                <span className="text-xs text-blue-600 font-medium whitespace-nowrap">
                                  {kakaoLocal.formatDistance(place.distance)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* 자주 가는 장소 섹션 */}
                      {locations.length > 0 && (
                        <>
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                            <MapPin size={14} className="text-gray-600" />
                            <span className="text-xs font-semibold text-gray-700">
                              자주 가는 곳
                            </span>
                          </div>
                          {locations.map((loc) => (
                            <button
                              key={`${loc.location}-${loc.count}`}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, location: loc.location }))
                                setShowLocationDropdown(false)
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                            >
                              <span className="text-sm">{loc.location}</span>
                              <span className="text-xs text-gray-500">{loc.count}회</span>
                            </button>
                          ))}
                        </>
                      )}

                      {/* 안내 메시지 */}
                      <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500 bg-gray-50">
                        💡 또는 위 입력창에 직접 새 식당 이름을 입력하세요
                      </div>

                      {/* 로딩 중이거나 결과가 없을 때 */}
                      {isLoadingPlaces && nearbyPlaces.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          근처 식당을 찾는 중...
                        </div>
                      )}
                      {!isLoadingPlaces && nearbyPlaces.length === 0 && locations.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          💡 위 입력창에 직접 식당 이름을 입력하세요
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              💡{' '}
              {formData.category === 'restaurant'
                ? '근처 식당 또는 자주 가는 장소를 선택하거나 새 식당 이름을 직접 입력하세요'
                : '집이나 회사를 선택하거나 직접 입력하세요'}
            </p>
          </div>

          {/* 가격 */}
          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              가격
            </label>
            <div className="relative">
              <input
                type="text"
                id="price"
                name="price"
                autoComplete="off"
                value={formData.price}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full px-3 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15,000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                원
              </span>
            </div>
          </div>

          {/* 같이 먹은 사람 */}
          <div className="space-y-2">
            <div className="block text-sm font-medium text-gray-700">같이 먹은 사람</div>

            {/* 선택된 친구들 */}
            {selectedFriends.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedFriends.map((friend) => (
                  <span
                    key={friend.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {friend.name}
                    <button
                      type="button"
                      onClick={() => toggleFriend(friend.id)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 텍스트로 입력된 사람들 */}
            {formData.companionNames && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.companionNames.split(',').map((name) => {
                  const trimmedName = name.trim()
                  return (
                    <span
                      key={`companion-${trimmedName}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {trimmedName}
                      <button
                        type="button"
                        onClick={() => {
                          const names = formData.companionNames
                            .split(',')
                            .map((n) => n.trim())
                            .filter((n) => n !== trimmedName)
                            .join(', ')
                          setFormData((prev) => ({ ...prev, companionNames: names }))
                        }}
                        className="hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* 이름 입력 (자동완성) */}
            <div className="relative">
              <input
                type="text"
                name="companionName"
                autoComplete="off"
                value={companionInput}
                onChange={(e) => handleCompanionInputChange(e.target.value)}
                onBlur={handleCompanionInputBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCompanionInputBlur()
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이름 입력 (친구는 자동완성됩니다)"
              />
              {showFriendDropdown && filteredFriends.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredFriends.map((friend) => (
                    <button
                      key={friend.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        selectFriendFromAutocomplete(friend)
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Users size={16} className="text-blue-500" />
                      <span className="text-sm font-medium">{friend.name}</span>
                      <span className="text-xs text-gray-500">({friend.email})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              💡 친구는 자동완성되며, 친구가 아닌 경우 그대로 입력하세요
            </p>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700">
              메모
            </label>
            <textarea
              id="memo"
              name="memo"
              autoComplete="off"
              value={formData.memo}
              onChange={(e) => setFormData((prev) => ({ ...prev, memo: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="어땠나요? 맛, 분위기, 서비스 등을 자유롭게 기록해보세요!"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="flex-1"
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
