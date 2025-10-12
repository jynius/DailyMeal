'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, MapPin, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAlert } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'

interface EvaluateFormData {
  rating: number
  location: string
  price: string
  memo: string
  latitude: number | null
  longitude: number | null
  address: string
}

interface MealRecord {
  id: string
  name: string
  photo?: string
  photos?: string[]
  location?: string
  rating?: number
  memo?: string
  price?: number
  createdAt: string
}

export default function EvaluatePage({ params }: { params: { id: string } }) {
  const [meal, setMeal] = useState<MealRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [formData, setFormData] = useState<EvaluateFormData>({
    rating: 0,
    location: '',
    price: '',
    memo: '',
    latitude: null,
    longitude: null,
    address: ''
  })
  
  const router = useRouter()
  const { showAlert } = useAlert()
  const toast = useToast()

  // 식사 기록 불러오기
  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const resolvedParams = await params
        const { mealRecordsApi } = await import('@/lib/api/client')
        const data = await mealRecordsApi.getOne(resolvedParams.id)
        
        if (data) {
          setMeal(data)
          // 기존 데이터가 있으면 폼에 채우기
          setFormData({
            rating: data.rating || 0,
            location: data.location || '',
            price: data.price?.toString() || '',
            memo: data.memo || '',
            latitude: null,
            longitude: null,
            address: ''
          })
        }
      } catch (error) {
        console.error('Failed to fetch meal:', error)
        showAlert({
          title: '오류',
          message: '식사 기록을 불러오는데 실패했습니다.',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchMeal()
  }, [params, showAlert])

  // GPS 위치 가져오기
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showAlert({
        title: 'GPS 미지원',
        message: '이 브라우저는 위치 정보를 지원하지 않습니다.',
        type: 'warning'
      })
      return
    }

    setGpsLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }))

        // 역지오코딩으로 주소 가져오기 (선택사항)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          if (data.display_name) {
            setFormData(prev => ({
              ...prev,
              address: data.display_name,
              location: data.display_name.split(',').slice(0, 2).join(',')
            }))
          }
        } catch (error) {
          console.error('역지오코딩 실패:', error)
        }

        setGpsLoading(false)
        toast.success('위치 정보를 가져왔습니다!', '성공')
      },
      (error) => {
        setGpsLoading(false)
        showAlert({
          title: '위치 가져오기 실패',
          message: error.message,
          type: 'error'
        })
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.rating === 0) {
      showAlert({
        title: '평점 필수',
        message: '평점을 선택해주세요.',
        type: 'warning'
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const resolvedParams = await params
      const { mealRecordsApi } = await import('@/lib/api/client')
      
      const updateData: any = {
        rating: formData.rating
      }
      
      if (formData.location.trim()) {
        updateData.location = formData.location.trim()
      }
      if (formData.price) {
        updateData.price = parseFloat(formData.price)
      }
      if (formData.memo.trim()) {
        updateData.memo = formData.memo.trim()
      }
      if (formData.latitude) {
        updateData.latitude = formData.latitude
      }
      if (formData.longitude) {
        updateData.longitude = formData.longitude
      }
      if (formData.address) {
        updateData.address = formData.address
      }

      await mealRecordsApi.update(resolvedParams.id, updateData)
      
      console.log('✅ 평가 저장 완료')
      toast.success('평가가 저장되었습니다! ⭐', '완료')
      
      // 서버 응답 완료 후 즉시 리다이렉트
      router.push(`/meal/${resolvedParams.id}`)
    } catch (error: unknown) {
      const err = error as Error
      console.error('❌ 평가 저장 실패:', err)
      
      showAlert({
        title: '저장 실패',
        message: err.message || '평가 저장에 실패했습니다.',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">식사 기록을 찾을 수 없습니다.</p>
          <Link href="/feed" className="text-blue-500 mt-4 inline-block">
            피드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <Link href={`/meal/${meal.id}`}>
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold">식사 평가하기</h1>
        <div className="w-6" />
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* 식사 사진 미리보기 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              {meal.photo || (meal.photos && meal.photos[0]) ? (
                <Image
                  src={meal.photo?.startsWith('http') ? meal.photo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${meal.photo || meal.photos![0]}`}
                  alt={meal.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🍽️
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{meal.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(meal.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* 평점 (필수) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            평점 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className={`p-2 rounded-full transition-colors ${
                  star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                <Star
                  size={32}
                  fill={star <= formData.rating ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          {formData.rating > 0 && (
            <p className="text-sm text-gray-600">
              {formData.rating === 5 && '⭐ 최고예요!'}
              {formData.rating === 4 && '😊 맛있어요'}
              {formData.rating === 3 && '🙂 괜찮아요'}
              {formData.rating === 2 && '😐 별로예요'}
              {formData.rating === 1 && '😞 최악이에요'}
            </p>
          )}
        </div>

        {/* 장소 */}
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
          <Button
            type="button"
            onClick={handleGetLocation}
            disabled={gpsLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-sm"
          >
            <MapPin size={16} className="mr-2" />
            {gpsLoading ? '위치 확인 중...' : '현재 위치 가져오기'}
          </Button>
          {(formData.latitude && formData.longitude) && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <div>📍 위치: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</div>
              {formData.address && <div className="text-xs mt-1">{formData.address}</div>}
            </div>
          )}
        </div>

        {/* 가격 */}
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

        {/* 메모 */}
        <div className="space-y-2">
          <label htmlFor="memo" className="block text-sm font-medium text-gray-700">
            메모
          </label>
          <textarea
            id="memo"
            value={formData.memo}
            onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
            placeholder="맛이나 기분, 함께한 사람 등 자유롭게 기록해보세요"
            rows={4}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="text-right text-xs text-gray-400">
            {formData.memo.length}/200
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="pt-4 pb-8">
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 text-lg font-medium transition-colors"
            disabled={formData.rating === 0 || isSubmitting}
          >
            {isSubmitting ? '저장 중...' : '⭐ 평가 저장하기'}
          </Button>
        </div>
      </form>
    </div>
  )
}
