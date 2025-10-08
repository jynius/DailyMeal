'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, MapPin, Camera } from 'lucide-react'
import Image from 'next/image'
import { LocationSelector } from '@/components/location-selector'
import { useToast } from '@/components/ui/toast'
import { APP_CONFIG } from '@/lib/constants'

export default function AddRestaurantPage() {
  const router = useRouter()
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    category: '',
    priceRange: 'mid' as 'low' | 'mid' | 'high',
    phone: '',
    description: ''
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [saving, setSaving] = useState(false)

  // 위치 선택 완료
  const handleLocationSelect = (location: { lat: number, lng: number, address?: string, placeName?: string }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address || prev.address,
      name: location.placeName || prev.name
    }))
    setShowLocationSelector(false)
    toast.success('위치가 설정되었습니다')
  }

  // 사진 선택
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const previewUrl = URL.createObjectURL(file)
      setPhotoPreview(previewUrl)
    }
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.address) {
      toast.error('음식점 이름과 주소를 입력해주세요')
      return
    }

    if (formData.latitude === 0 || formData.longitude === 0) {
      toast.error('위치를 선택해주세요')
      return
    }

    setSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('로그인이 필요합니다')
        return
      }

      // 사진 업로드 (있는 경우)
      let photoUrl = ''
      if (photo) {
        const photoFormData = new FormData()
        photoFormData.append('file', photo)

        const photoResponse = await fetch(`${APP_CONFIG.API_BASE_URL}/uploads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: photoFormData
        })

        if (photoResponse.ok) {
          const photoResult = await photoResponse.json()
          photoUrl = photoResult.filename
        }
      }

      // 음식점 생성
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/restaurants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          representativePhoto: photoUrl
        })
      })

      if (!response.ok) {
        throw new Error('음식점 등록에 실패했습니다')
      }

      const result = await response.json()
      toast.success('음식점이 등록되었습니다!')
      router.push(`/restaurants/${result.id}`)
      
    } catch (error) {
      console.error('음식점 등록 실패:', error)
      toast.error('음식점 등록에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (showLocationSelector) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white">
        <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setShowLocationSelector(false)}
              className="p-1 mr-3"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">위치 선택</h1>
          </div>
        </header>

        <div className="p-4">
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            initialLocation={formData.latitude && formData.longitude ? {
              lat: formData.latitude,
              lng: formData.longitude,
              address: formData.address,
              placeName: formData.name
            } : undefined}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-1 mr-3">
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">음식점 등록</h1>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* 대표 사진 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            대표 사진
          </label>
          <div className="flex items-center space-x-4">
            {photoPreview ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden">
                <Image 
                  src={photoPreview} 
                  alt="미리보기" 
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Camera size={24} className="text-gray-400" />
              </div>
            )}
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <Camera size={20} className="mx-auto mb-1 text-gray-400" />
                <span className="text-sm text-gray-500">사진 선택</span>
              </div>
            </label>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              음식점 이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="음식점 이름을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">카테고리 선택</option>
              <option value="한식">한식</option>
              <option value="중식">중식</option>
              <option value="일식">일식</option>
              <option value="양식">양식</option>
              <option value="카페">카페</option>
              <option value="디저트">디저트</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              가격대
            </label>
            <div className="flex gap-2">
              {[
                { value: 'low', label: '₩', desc: '1-2만원' },
                { value: 'mid', label: '₩₩', desc: '2-5만원' },
                { value: 'high', label: '₩₩₩', desc: '5만원+' }
              ].map((price) => (
                <button
                  key={price.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev,             priceRange: price.value as 'low' | 'mid' | 'high' }))}
                  className={`flex-1 p-3 rounded-lg border-2 text-center transition-colors ${
                    formData.priceRange === price.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">{price.label}</div>
                  <div className="text-xs text-gray-500">{price.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 위치 정보 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            위치 정보 *
          </label>
          
          {formData.address ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <MapPin size={16} className="text-green-600 mr-2" />
                      <span className="font-medium text-gray-900">{formData.name || '선택된 위치'}</span>
                    </div>
                    <div className="text-sm text-gray-600">{formData.address}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationSelector(true)}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-700"
              >
                위치 변경
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLocationSelector(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors text-center"
            >
              <MapPin size={24} className="mx-auto mb-2 text-gray-400" />
              <span className="text-gray-600">위치 선택하기</span>
            </button>
          )}
        </div>

        {/* 추가 정보 */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="02-000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="음식점에 대한 간단한 설명을 입력하세요"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving || !formData.name || !formData.address}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                음식점 등록
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}