'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAlert } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'
import { useLocationPermission } from '@/hooks/use-location-permission'
import AuthGuard from '@/components/auth/AuthGuard'
import { mealRecordsApi } from '@/lib/api'
import Spinner from '@/components/ui/spinner'
import { LocationSelector } from '@/components/location-selector'

const log = createLogger('AddMealPage')

// React Native WebView 타입 선언
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }
}

interface FormData {
  name: string
  photos: File[]
  latitude?: number
  longitude?: number
  address?: string
  location?: string
}

function AddMealPage() {
  // 자동으로 날짜 기반 제목 생성
  const generateMealName = () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const hour = now.getHours()

    let mealType = ''
    if (hour >= 5 && hour < 11) {
      mealType = '아침'
    } else if (hour >= 11 && hour < 15) {
      mealType = '점심'
    } else if (hour >= 15 && hour < 18) {
      mealType = '간식'
    } else {
      mealType = '저녁'
    }

    return `${month}월 ${day}일 ${mealType}`
  }

  const [formData, setFormData] = useState<FormData>({
    name: generateMealName(),
    photos: [],
    latitude: undefined,
    longitude: undefined,
    address: undefined,
    location: undefined,
  })
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isMobileApp, setIsMobileApp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const router = useRouter()
  const { showAlert } = useAlert()
  const toast = useToast()

  // 위치 권한 관리 (자동 프롬프트 표시)
  const location = useLocationPermission({
    autoPrompt: true,
  })

  // 모바일 앱 환경 감지
  useEffect(() => {
    const isApp = /DailyMeal/.test(navigator.userAgent) || window.ReactNativeWebView !== undefined
    setIsMobileApp(isApp)
    log.info('🔍 Environment check:', { isApp, userAgent: navigator.userAgent })

    if (isApp && typeof window !== 'undefined') {
      const handleMessage = (event: MessageEvent) => {
        log.info('📨 Message event received:', event.data)
        try {
          const message = JSON.parse(event.data)
          log.info('📨 Parsed message:', message.type)

          if (message.type === 'imagesSelected' && message.images) {
            log.info('✅ Images received from app:', message.images.length)
            handleNativeImages(message.images)
          }
        } catch (e) {
          log.error('❌ Message parse error:', e)
        }
      }

      log.info('👂 Adding message listeners')
      window.addEventListener('message', handleMessage)
      document.addEventListener('message', handleMessage as any)

      return () => {
        log.info('🔇 Removing message listeners')
        window.removeEventListener('message', handleMessage)
        document.removeEventListener('message', handleMessage as any)
      }
    }
  }, [])

  // 위치 컨텍스트에서 위치 정보 업데이트
  useEffect(() => {
    if (location.latitude && location.longitude && location.address) {
      const shortAddress = location.address.split(',').slice(0, 2).join(',')
      setFormData((prev) => ({
        ...prev,
        latitude: location.latitude ?? undefined,
        longitude: location.longitude ?? undefined,
        address: location.address ?? undefined,
        location: shortAddress,
      }))
      if (!location.isLoading) {
        toast.success(`현재 위치: ${shortAddress}`, '위치 정보')
      }
    }
  }, [location.latitude, location.longitude, location.address, location.isLoading, toast])

  // 위치 선택 핸들러
  const handleLocationSelect = (selectedLocation: {
    lat: number
    lng: number
    address?: string
    placeName?: string
  }) => {
    const displayAddress = selectedLocation.address || selectedLocation.placeName || '선택한 위치'
    const shortAddress = displayAddress.split(',').slice(0, 2).join(',')
    
    setFormData((prev) => ({
      ...prev,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      address: displayAddress,
      location: shortAddress,
    }))
    
    setShowLocationSelector(false)
    toast.success(`위치 선택 완료: ${shortAddress}`, '위치 정보')
  }

  // 네이티브 앱에서 선택한 이미지 처리
  const handleNativeImages = (images: Array<{ base64: string; uri: string }>) => {
    log.info(`🖼️ handleNativeImages called with ${images.length} images`)
    const newFiles: File[] = []
    const newPreviews: string[] = []

    images.forEach((img, index) => {
      log.info(`🖼️ Processing image ${index + 1}/${images.length}`)
      const base64Data = img.base64.includes(',') ? img.base64.split(',')[1] : img.base64
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      const file = new File([blob], `photo_${Date.now()}_${index}.jpg`, { type: 'image/jpeg' })

      newFiles.push(file)
      newPreviews.push(`data:image/jpeg;base64,${base64Data}`)
    })

    log.info(`✅ Created ${newFiles.length} files and ${newPreviews.length} previews`)

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newFiles],
    }))
    setPhotoPreviews((prev) => [...prev, ...newPreviews])
    setCurrentPhotoIndex(formData.photos.length + newFiles.length - 1)

    log.info('✅ State updated')
  }

  // 이미지 선택 요청 (앱에서는 네이티브 피커 실행)
  const requestImagePicker = () => {
    if (isMobileApp && window.ReactNativeWebView) {
      log.info('📱 Requesting native image picker')
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pickImage' }))
    } else {
      log.info('💻 Using web file input')
      document.getElementById('photo-upload')?.click()
    }
  }

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (formData.photos.length + files.length > 5) {
      showAlert({
        title: '사진 개수 제한',
        message: '최대 5장까지만 업로드할 수 있습니다.',
        type: 'warning',
      })
      return
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files],
    }))
    setPhotoPreviews((prev) => [...prev, ...newPreviews])
    setCurrentPhotoIndex(formData.photos.length + files.length - 1)
  }

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index)
    const newPreviews = photoPreviews.filter((_, i) => i !== index)

    setFormData((prev) => ({ ...prev, photos: newPhotos }))
    setPhotoPreviews(newPreviews)

    if (currentPhotoIndex >= newPhotos.length) {
      setCurrentPhotoIndex(Math.max(0, newPhotos.length - 1))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (formData.photos.length === 0) {
      showAlert({
        title: '사진 필수',
        message: '최소 한 장의 사진을 등록해야 합니다.',
        type: 'warning',
      })
      return
    }

    setIsSubmitting(true)

    const data = new FormData()
    data.append('name', formData.name)
    formData.photos.forEach((photo) => data.append('photos', photo))
    if (formData.latitude) data.append('latitude', formData.latitude.toString())
    if (formData.longitude) data.append('longitude', formData.longitude.toString())
    if (formData.address) data.append('address', formData.address)

    try {
      // Use centralized API client (handles base URL and auth header)
      const response = await mealRecordsApi.createWithFiles(data)

      // 경고가 있으면 표시
      if (response.warnings && response.warnings.length > 0) {
        showAlert({
          title: '⚠️ 확인 필요',
          message: response.warnings.join('\n\n'),
          type: 'warning',
        })
      }

      toast.success('식사가 성공적으로 등록되었습니다.')
      router.push('/')
    } catch (error: any) {
      log.error('Failed to create meal record', error)
      showAlert({
        title: '등록 실패',
        message: error?.message || '식사 기록 등록에 실패했습니다.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-lg">
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* GPS 상태 표시 */}
        {location.isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm text-blue-700">현재 위치 가져오는 중...</span>
          </div>
        )}

        {formData.location && (
          <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">{formData.location}</span>
          </div>
        )}

        {location.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-red-700">
                위치 정보를 가져올 수 없습니다
              </span>
            </div>
            <Button
              type="button"
              onClick={() => setShowLocationSelector(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              수동으로 위치 선택하기
            </Button>
          </div>
        )}

        {/* 위치 선택 모달 */}
        {showLocationSelector && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">위치 선택</h2>
                <button
                  type="button"
                  onClick={() => setShowLocationSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <LocationSelector
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    formData.latitude && formData.longitude
                      ? {
                          lat: formData.latitude,
                          lng: formData.longitude,
                          address: formData.address,
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            식사 이름
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">사진 (최대 5장)</label>
          <input
            type="file"
            id="photo-upload"
            multiple
            accept="image/*"
            onChange={handlePhotosChange}
            className="hidden"
          />

          <div className="space-y-2">
            {photoPreviews.length > 0 ? (
              /* 사진이 있을 때: 캐러셀 뷰 */
              <div className="relative">
                {/* 전체 화면 캐러셀 */}
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  {photoPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                        index === currentPhotoIndex
                          ? 'translate-x-0'
                          : index < currentPhotoIndex
                            ? '-translate-x-full'
                            : 'translate-x-full'
                      }`}
                    >
                      <img
                        src={preview}
                        alt={`미리보기 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}

                  {/* 삭제 버튼 */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removePhoto(currentPhotoIndex)
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors z-10"
                  >
                    <X size={20} />
                  </button>

                  {/* 좌우 네비게이션 버튼 (2장 이상일 때만) */}
                  {photoPreviews.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setCurrentPhotoIndex((prev) =>
                            prev === 0 ? photoPreviews.length - 1 : prev - 1
                          )
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setCurrentPhotoIndex((prev) =>
                            prev === photoPreviews.length - 1 ? 0 : prev + 1
                          )
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </>
                  )}

                  {/* 페이지 인디케이터 */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                    {currentPhotoIndex + 1} / {photoPreviews.length}
                  </div>

                  {/* 썸네일 미리보기 (하단) */}
                  {photoPreviews.length > 1 && (
                    <div className="absolute bottom-10 left-0 right-0 px-2">
                      <div className="flex gap-1 overflow-x-auto scrollbar-hide justify-center">
                        {photoPreviews.map((preview, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setCurrentPhotoIndex(index)
                            }}
                            className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                              index === currentPhotoIndex
                                ? 'border-white scale-110'
                                : 'border-transparent opacity-60'
                            }`}
                          >
                            <img
                              src={preview}
                              alt={`썸네일 ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 사진이 없을 때: 업로드 영역 */
              <div
                onClick={requestImagePicker}
                className="block w-full aspect-square border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2"
              >
                <Camera size={48} className="text-gray-400" />
                <p className="text-sm text-gray-500">사진을 선택하거나 촬영하세요</p>
                <p className="text-xs text-gray-400">최소 1장 필수</p>
              </div>
            )}

            {formData.photos.length > 0 && (
              <Button
                type="button"
                onClick={requestImagePicker}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              >
                📸 사진 추가하기 ({formData.photos.length}/5)
              </Button>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '식사 기록하기'}
        </Button>
      </form>
    </div>
  )
}

export default function GuardedAddMealPage() {
  return (
    <AuthGuard>
      <AddMealPage />
    </AuthGuard>
  )
}
