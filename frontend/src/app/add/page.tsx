'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAlert } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'

interface FormData {
  name: string
  photos: File[]
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
    photos: []
  })
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
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

      // 디버깅: FormData 내용 확인
      console.log('📤 Sending FormData:')
      console.log('  - name:', formData.name.trim())
      console.log('  - photos count:', formData.photos.length)
      for (let pair of data.entries()) {
        console.log(`  - ${pair[0]}:`, pair[1])
      }

      // 식사 기록 제출 (사진과 제목만)
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
            <label
              htmlFor="photo-upload"
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`미리보기 ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removePhoto(index)
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {photoPreviews.length > 3 && (
                    <div className="flex items-center justify-center bg-gray-100 rounded">
                      <span className="text-sm text-gray-600">+{photoPreviews.length - 3}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <Camera size={48} className="text-gray-400" />
                  <p className="text-sm text-gray-500">사진을 선택하거나 촬영하세요</p>
                  <p className="text-xs text-red-400">최소 1장 필수</p>
                </div>
              )}
            </label>
            
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
