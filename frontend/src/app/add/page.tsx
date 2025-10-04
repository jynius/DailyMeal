'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, MapPin, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAlert } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'

interface FormData {
  name: string
  location: string
  price: string
  rating: number
  memo: string
  photos: File[]
  latitude: number | null
  longitude: number | null
  address: string
}

export default function AddMealPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    price: '',
    rating: 0,
    memo: '',
    photos: [],
    latitude: null,
    longitude: null,
    address: ''
  })
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [gpsLoading, setGpsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const { showAlert, showConfirm } = useAlert()
  const toast = useToast()

  // 클라이언트 사이드에서만 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    window.innerWidth <= 768
      setIsMobile(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getCurrentLocation = () => {
    setGpsLoading(true)
    
    // HTTPS가 아닌 환경에서의 안내
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setGpsLoading(false)
      showAlert({
        title: '위치 서비스 제한',
        message: 'GPS 위치 기능은 HTTPS 환경에서만 사용할 수 있습니다.',
        type: 'warning'
      })
      return
    }
    
    if (!navigator.geolocation) {
      setGpsLoading(false)
      showAlert({
        title: '위치 서비스 미지원',
        message: '이 브라우저는 위치 서비스를 지원하지 않습니다.',
        type: 'error'
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({ ...prev, latitude, longitude }))
        const address = `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`
        setFormData(prev => ({ ...prev, address }))
        setGpsLoading(false)
        toast.success('현재 위치를 성공적으로 가져왔습니다! 📍', 'GPS 위치 확인')
      },
      (error) => {
        console.error('위치 정보 가져오기 실패:', error)
        setGpsLoading(false)
        
        let errorMessage = '위치 정보를 가져올 수 없습니다.'
        let errorTitle = 'GPS 위치 오류'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorTitle = '위치 권한 거부'
            errorMessage = '위치 접근 권한이 거부되었습니다.\n브라우저 설정에서 위치 권한을 허용해주세요.'
            break
          case error.POSITION_UNAVAILABLE:
            errorTitle = '위치 서비스 불가'
            errorMessage = '현재 위치 정보를 사용할 수 없습니다.\n잠시 후 다시 시도해주세요.'
            break
          case error.TIMEOUT:
            errorTitle = '요청 시간 초과'
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.\n다시 시도해주세요.'
            break
        }
        
        showAlert({
          title: errorTitle,
          message: errorMessage,
          type: 'error'
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📷 Photo selection triggered!')
    console.log('📁 Files selected:', e.target.files?.length || 0)
    
    const files = Array.from(e.target.files || [])
    if (files.length === 0) {
      console.log('❌ No files selected')
      return
    }
    
    console.log('✅ Files to process:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))

    // 파일 검증
    const validFiles = files.filter(file => {
      // 파일 크기 검사 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(`${file.name}은(는) 5MB를 초과합니다.`, '파일 크기 초과')
        return false
      }
      
      // 파일 타입 검사
      if (!file.type.startsWith('image/')) {
        toast.warning(`${file.name}은(는) 이미지 파일이 아닙니다.`, '파일 형식 오류')
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    // 현재 사진 수 + 새로 추가할 사진 수가 5개 초과하면 제한
    const remainingSlots = 5 - formData.photos.length
    const selectedFiles = validFiles.slice(0, remainingSlots)
    
    if (validFiles.length > remainingSlots) {
      toast.info(`최대 5장까지만 업로드할 수 있습니다. ${selectedFiles.length}장이 추가됩니다.`, '파일 개수 제한')
    }

    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...selectedFiles] }))
    
    selectedFiles.forEach((file, index) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string])
        // 마지막 파일이 로드되었을 때 알림
        if (index === selectedFiles.length - 1) {
          console.log(`✅ ${selectedFiles.length}개 사진이 성공적으로 추가되었습니다!`)
        }
      }
      reader.onerror = () => {
        console.error(`❌ ${file.name} 파일 읽기 실패`)
        toast.error(`${file.name} 파일을 읽는 중 오류가 발생했습니다.`, '파일 읽기 실패')
      }
      reader.readAsDataURL(file)
    })
    
    // 파일 입력 초기화
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 폼 검증
    if (!formData.name.trim()) {
      showAlert({
        title: '메뉴 이름 필수',
        message: '메뉴 이름을 입력해주세요.',
        type: 'warning',
        onConfirm: () => document.getElementById('name')?.focus()
      })
      return
    }
    
    if (formData.photos.length === 0) {
      showAlert({
        title: '사진 업로드 필수',
        message: '최소 1장의 사진을 업로드해주세요.',
        type: 'warning',
        onConfirm: () => document.getElementById('photo-upload')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }
    
    if (formData.rating === 0) {
      showAlert({
        title: '평점 선택 필수',
        message: '평점을 선택해주세요.',
        type: 'warning',
        onConfirm: () => document.querySelector('[data-rating="1"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const { mealRecordsApi } = await import('@/lib/api/client')
      
      const data = new FormData()
      data.append('name', formData.name.trim())
      data.append('location', formData.location.trim() || '')
      data.append('price', formData.price || '')
      data.append('rating', formData.rating.toString())
      data.append('memo', formData.memo.trim() || '')
      data.append('latitude', formData.latitude?.toString() || '')
      data.append('longitude', formData.longitude?.toString() || '')
      data.append('address', formData.address || '')
      
      formData.photos.forEach((photo) => {
        data.append('photos', photo)
      })

      console.log('🚀 Submitting meal record...')
      const result = await mealRecordsApi.createWithFiles(data)
      
      if (result) {
        console.log('✅ Meal record created successfully:', result)
        toast.success('식사 기록이 성공적으로 저장되었습니다! 🎉', '저장 완료')
        // 잠시 후 페이지 이동
        setTimeout(() => {
          router.push('/feed')
        }, 1500)
      }
    } catch (error: any) {
      console.error('❌ 저장 실패:', error)
      
      let errorMessage = '저장에 실패했습니다. 다시 시도해주세요.'
      let errorTitle = '저장 실패'
      
      if (error.message?.includes('파일')) {
        errorTitle = '파일 업로드 오류'
        errorMessage = '파일 업로드 중 오류가 발생했습니다.\n파일 크기나 형식을 확인해주세요.'
      } else if (error.message?.includes('네트워크') || error.message?.includes('network')) {
        errorTitle = '네트워크 오류'
        errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.'
      } else if (error.message?.includes('권한') || error.message?.includes('unauthorized')) {
        showAlert({
          title: '인증 오류',
          message: '로그인이 필요합니다. 다시 로그인해주세요.',
          type: 'error',
          onConfirm: () => router.push('/profile')
        })
        return
      }
      
      showAlert({
        title: errorTitle,
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <Link href="/feed">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold">식사 기록 추가</h1>
        <div className="w-6" />
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            사진 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              {...(isMobile && { capture: "environment" })}
              onChange={handlePhotosChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              onClick={() => console.log('🎯 Label clicked! Device:', isMobile ? 'Mobile' : 'Desktop')}
              onTouchStart={() => console.log('📱 Touch started on label')}
              className={`block w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                formData.photos.length === 0 
                  ? 'border-red-300 hover:border-red-400 bg-red-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              style={{ 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                minHeight: '120px'
              }}
            >
              {photoPreviews.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 p-2 h-full">
                  {photoPreviews.slice(0, 3).map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`미리보기 ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          removePhoto(index)
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {photoPreviews.length > 3 && (
                    <div className="flex items-center justify-center bg-gray-200 rounded text-xs text-gray-600">
                      +{photoPreviews.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center h-full ${
                  formData.photos.length === 0 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  <Camera size={48} className="mb-2" />
                  <span className="text-sm font-medium">사진을 추가해주세요 *</span>
                  <span className="text-xs mt-1 opacity-75">(최대 5장까지 선택 가능)</span>
                  {formData.photos.length === 0 && (
                    <span className="text-xs text-red-500 mt-2 font-medium">필수 항목입니다</span>
                  )}
                </div>
              )}
            </label>
          </div>
          
          {/* 모바일 환경을 위한 대체 버튼 - hydration 후에만 표시 */}
          <div style={{ minHeight: '44px' }}>
            {isMobile && (
              <Button
                type="button"
                onClick={() => {
                  console.log('📱 Mobile button clicked!')
                  const input = document.getElementById('photo-upload') as HTMLInputElement
                  if (input) {
                    input.click()
                  }
                }}
                className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2"
              >
                📸 사진 선택하기 ({formData.photos.length}/5)
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            메뉴 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="예: 크림파스타, 김치찌개"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            장소
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="예: 홍대 이탈리안 레스토랑"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            GPS 위치 정보
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={getCurrentLocation}
              disabled={gpsLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm"
            >
              <MapPin size={16} />
              {gpsLoading ? '위치 확인 중...' : '현재 위치 가져오기'}
            </Button>
          </div>
          {(formData.latitude && formData.longitude) && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <div>위도: {formData.latitude.toFixed(6)}</div>
              <div>경도: {formData.longitude.toFixed(6)}</div>
              {formData.address && <div>주소: {formData.address}</div>}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            가격
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₩</span>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0"
              min="0"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            평점 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                data-rating={star}
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className={`p-1 rounded-full transition-colors ${
                  star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                <Star
                  size={24}
                  fill={star <= formData.rating ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="memo" className="block text-sm font-medium text-gray-700">
            메모
          </label>
          <textarea
            id="memo"
            value={formData.memo}
            onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
            placeholder="맛이나 기분, 함께한 사람 등 자유롭게 기록해보세요"
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="text-right text-xs text-gray-400">
            {formData.memo.length}/200
          </div>
        </div>

        <div className="pt-4 pb-8">
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 text-lg font-medium transition-colors"
            disabled={!formData.name || formData.photos.length === 0 || formData.rating === 0 || isSubmitting}
          >
            {isSubmitting ? '저장 중...' : '식사 기록 저장하기'}
          </Button>
        </div>
      </form>
    </div>
  )
}
