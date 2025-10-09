'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, X, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAlert } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'

interface FormData {
  name: string
  photos: File[]
  latitude?: number
  longitude?: number
  address?: string
  location?: string
}

export default function AddMealPage() {
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [gpsPermission, setGpsPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const router = useRouter()
  const { showAlert } = useAlert()
  const toast = useToast()

  // 로그인 확인
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      showAlert({
        title: '로그인 필요',
        message: '식사 기록을 추가하려면 로그인이 필요합니다.',
        type: 'warning',
        onConfirm: () => {
          router.push('/')
        }
      })
    }
  }, [router, showAlert])

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

  // GPS 위치 자동 수집
  useEffect(() => {
    const requestLocation = async () => {
      // 이미 위치 정보가 있으면 스킵
      if (formData.latitude && formData.longitude) {
        return
      }

      // 위치 서비스 지원 확인
      if (!navigator.geolocation) {
        console.log('이 브라우저는 위치 서비스를 지원하지 않습니다.')
        return
      }

      // 위치 권한 확인 (가능한 경우)
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          setGpsPermission(permission.state as 'prompt' | 'granted' | 'denied')
          
          // 이미 거부된 경우 요청하지 않음
          if (permission.state === 'denied') {
            console.log('위치 권한이 거부되었습니다.')
            return
          }
        } catch (error) {
          console.log('권한 확인 실패:', error)
        }
      }

      // 위치 정보 요청
      setIsGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          console.log('📍 GPS 위치 수집:', { latitude, longitude })
          
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }))

          // 백엔드 API를 통한 역지오코딩
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/geocode/reverse?lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            if (data.success && data.address) {
              const shortAddress = data.address.split(',').slice(0, 2).join(',')
              setFormData(prev => ({
                ...prev,
                address: data.address,
                location: shortAddress
              }))
              console.log('📍 주소:', shortAddress)
              toast.success(`현재 위치: ${shortAddress}`, '위치 정보')
            }
          } catch (error) {
            console.error('역지오코딩 실패:', error)
            toast.error('주소를 가져오는데 실패했습니다.', '위치 정보')
          }

          setGpsPermission('granted')
          setIsGettingLocation(false)
        },
        (error) => {
          console.error('위치 가져오기 실패:', error)
          setGpsPermission('denied')
          setIsGettingLocation(false)
          
          // 사용자가 명시적으로 거부한 경우만 알림
          if (error.code === error.PERMISSION_DENIED) {
            toast.warning('위치 권한이 거부되어 GPS 정보를 수집할 수 없습니다.', '위치 정보')
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }

    requestLocation()
  }, []) // 컴포넌트 마운트 시 한 번만 실행

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // 최대 5장 제한
    if (formData.photos.length + files.length > 5) {
      showAlert({
        title: '사진 개수 제한',
        message: '최대 5장까지만 업로드할 수 있습니다.',
        type: 'warning'
      })
      return
    }
    
    // 미리보기 생성
    const newPreviews: string[] = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === files.length) {
          setPhotoPreviews(prev => [...prev, ...newPreviews])
          // 마지막 추가된 사진으로 자동 이동
          setCurrentPhotoIndex(formData.photos.length + files.length - 1)
        }
      }
      reader.readAsDataURL(file)
    })
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }))
    
    // 파일 입력 초기화
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
    
    // 현재 인덱스 조정
    if (currentPhotoIndex >= photoPreviews.length - 1) {
      setCurrentPhotoIndex(Math.max(0, photoPreviews.length - 2))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 사진만 필수
    if (formData.photos.length === 0) {
      showAlert({
        title: '사진 업로드 필수',
        message: '최소 1장의 사진을 업로드해주세요.',
        type: 'warning',
        onConfirm: () => document.getElementById('photo-upload')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const { mealRecordsApi } = await import('@/lib/api/client')
      
      const data = new FormData()
      data.append('name', formData.name.trim())
      
      formData.photos.forEach((photo) => {
        data.append('photos', photo)
      })

      // GPS 정보 추가 (있을 경우)
      if (formData.latitude) {
        data.append('latitude', formData.latitude.toString())
      }
      if (formData.longitude) {
        data.append('longitude', formData.longitude.toString())
      }
      if (formData.address) {
        data.append('address', formData.address)
      }
      if (formData.location) {
        data.append('location', formData.location)
      }

      // 디버깅: FormData 내용 확인
      console.log('📤 Sending FormData:')
      console.log('  - name:', formData.name.trim())
      console.log('  - photos count:', formData.photos.length)
      console.log('  - GPS:', formData.latitude, formData.longitude)
      console.log('  - location:', formData.location)
      for (let pair of data.entries()) {
        console.log(`  - ${pair[0]}:`, pair[1])
      }

      // 식사 기록 제출 (사진, 제목, GPS 정보)
      const result = await mealRecordsApi.createWithFiles(data)
      
      if (result) {
        console.log('✅ 서버 응답 완료:', result)
        toast.success('식사 기록이 저장되었습니다! 🎉', '저장 완료')
        
        // Next.js 클라이언트 사이드 라우팅 사용 (페이지 새로고침 없음)
        router.push('/feed')
      }
    } catch (error: unknown) {
      const err = error as Error
      console.error('❌ 저장 실패:', err)
      
      showAlert({
        title: '저장 실패',
        message: err.message || '식사 기록 저장에 실패했습니다.',
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
        <h1 className="text-lg font-semibold">식사 사진 등록</h1>
        <div className="w-6" />
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* GPS 상태 표시 */}
        {isGettingLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-blue-700">현재 위치 가져오는 중...</span>
          </div>
        )}
        
        {formData.location && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-green-600" />
              <span className="text-sm text-green-700">📍 {formData.location}</span>
            </div>
          </div>
        )}
        
        {/* 제목 (자동 생성) */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            제목 <span className="text-gray-400 text-xs">(자동 생성)</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* 사진 업로드 */}
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
            
            {/* 사진이 있을 때: 캐러셀 (보기 전용) */}
            {photoPreviews.length > 0 ? (
              <div className="w-full aspect-square border-2 border-gray-300 rounded-lg overflow-hidden relative">
                {/* 현재 이미지 표시 (캐러셀) */}
                <div className="relative h-full overflow-hidden">
                  {photoPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                        index === currentPhotoIndex ? 'translate-x-0' : index < currentPhotoIndex ? '-translate-x-full' : 'translate-x-full'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
                          setCurrentPhotoIndex(prev => 
                            prev === 0 ? photoPreviews.length - 1 : prev - 1
                          )
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setCurrentPhotoIndex(prev => 
                            prev === photoPreviews.length - 1 ? 0 : prev + 1
                          )
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                              index === currentPhotoIndex ? 'border-white scale-110' : 'border-transparent opacity-60'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
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
              <label
                htmlFor="photo-upload"
                className="block w-full aspect-square border-2 border-dashed border-red-300 hover:border-red-400 bg-red-50 rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2"
                style={{ 
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  minHeight: '120px'
                }}
              >
                <Camera size={48} className="text-gray-400" />
                <p className="text-sm text-gray-500">사진을 선택하거나 촬영하세요</p>
                <p className="text-xs text-red-400">최소 1장 필수</p>
              </label>
            )}
            
            {formData.photos.length > 0 && (
              <Button
                type="button"
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              >
                📸 사진 추가하기 ({formData.photos.length}/5)
              </Button>
            )}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>간편 등록</strong>: 사진만 찍고 바로 저장하세요!
          </p>
          <p className="text-xs text-blue-600 mt-1">
            평가, 메모, 위치는 나중에 평가 페이지에서 추가할 수 있습니다.
          </p>
        </div>

        {/* 저장 버튼 */}
        <div className="pt-4 pb-8">
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 text-lg font-medium transition-colors"
            disabled={formData.photos.length === 0 || isSubmitting}
          >
            {isSubmitting ? '저장 중...' : '📸 사진 저장하기'}
          </Button>
        </div>
      </form>
    </div>
  )
}
