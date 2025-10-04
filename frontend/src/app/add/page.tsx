'use client'

import { useState } from 'react'
import { Camera, MapPin, Star, ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AddMealPage() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    rating: 0,
    memo: '',
    photo: null as File | null,
  })
  const [photoPreview, setPhotoPreview] = useState<string>('')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))
      
      // 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 실제 API 호출
      const { mealRecordsApi } = await import('@/lib/api/client')
      
      const result = await mealRecordsApi.create({
        name: formData.name,
        photo: formData.photo || undefined,
        location: formData.location || undefined,
        rating: formData.rating,
        memo: formData.memo || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
      })
      
      console.log('식사 기록 저장 성공:', result)
      alert('식사 기록이 저장되었습니다!')
      
      // 피드 페이지로 이동
      window.location.href = '/feed'
    } catch (error: any) {
      console.error('식사 기록 저장 실패:', error)
      alert(error.message || '식사 기록 저장에 실패했습니다.')
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="p-1 -ml-1">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">식사 기록하기</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            사진 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload"
              required
            />
            <label
              htmlFor="photo-upload"
              className="block w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
            >
              {photoPreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={photoPreview}
                    alt="미리보기"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="text-white" size={24} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Camera size={48} className="mb-2" />
                  <span className="text-sm">사진을 추가해주세요</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Meal Name */}
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

        {/* Location */}
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

        {/* Price */}
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
              placeholder="15000"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            별점 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  size={32}
                  className={
                    star <= formData.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Memo */}
        <div className="space-y-2">
          <label htmlFor="memo" className="block text-sm font-medium text-gray-700">
            간단 메모
          </label>
          <textarea
            id="memo"
            value={formData.memo}
            onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
            placeholder="이 식사에 대한 간단한 메모를 남겨보세요 (200자 이내)"
            maxLength={200}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="text-right text-xs text-gray-400">
            {formData.memo.length}/200
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 pb-8">
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg font-medium"
            disabled={!formData.name || !formData.photo || formData.rating === 0}
          >
            식사 기록 저장하기
          </Button>
        </div>
      </form>
    </div>
  )
}