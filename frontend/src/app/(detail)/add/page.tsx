'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAlert } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'
import { useLocation } from '@/contexts/location-context'
import AuthGuard from '@/components/auth/AuthGuard'
import { mealRecordsApi } from '@/lib/api'
import Spinner from '@/components/ui/spinner'

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
  const router = useRouter()
  const { showAlert } = useAlert()
  const toast = useToast();
  const location = useLocation()

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
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        location: location.address.split(',').slice(0, 2).join(','),
      }));
      if (!location.isLoading) {
        toast.success(`현재 위치: ${location.address.split(',').slice(0, 2).join(',')}`, '위치 정보')
      }
    }
  }, [location.latitude, location.longitude, location.address, location.isLoading, toast])

  // 네이티브 앱에서 선택한 이미지 처리
  const handleNativeImages = (images: Array<{ base64: string, uri: string }>) => {
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
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newFiles]
    }))
    setPhotoPreviews(prev => [...prev, ...newPreviews])
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
        type: 'warning'
      })
      return
    }

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }))
    setPhotoPreviews(prev => [...prev, ...newPreviews])
    setCurrentPhotoIndex(formData.photos.length + files.length - 1)
  }

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index)
    const newPreviews = photoPreviews.filter((_, i) => i !== index)
    
    setFormData(prev => ({ ...prev, photos: newPhotos }))
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
        type: 'warning'
      })
      return
    }

    setIsSubmitting(true)
    
    const data = new FormData()
    data.append('name', formData.name)
    formData.photos.forEach(photo => data.append('photos', photo))
    if (formData.latitude) data.append('latitude', formData.latitude.toString())
    if (formData.longitude) data.append('longitude', formData.longitude.toString())
    if (formData.address) data.append('address', formData.address)

    try {
      // Use centralized API client (handles base URL and auth header)
      await mealRecordsApi.createWithFiles(data)

      toast.success('식사가 성공적으로 등록되었습니다.')
      router.push('/')
    } catch (error: any) {
      log.error('Failed to create meal record', error)
      showAlert({
        title: '등록 실패',
        message: error?.message || '식사 기록 등록에 실패했습니다.',
        type: 'error'
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <span className="text-sm text-red-700">{location.error}</span>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사진 (최대 5장)
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={requestImagePicker}
              className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50"
            >
              <Camera className="w-8 h-8" />
              <span>{formData.photos.length}/5</span>
            </button>
            <input
              type="file"
              id="photo-upload"
              multiple
              accept="image/*"
              onChange={handlePhotosChange}
              className="hidden"
            />
            <div className="flex-1 flex overflow-x-auto gap-2 p-1">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative flex-shrink-0 w-24 h-24">
                  <img
                    src={preview}
                    alt={`preview ${index}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
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
