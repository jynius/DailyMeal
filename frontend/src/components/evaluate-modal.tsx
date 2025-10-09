'use client'

import { useState, useEffect } from 'react'
import { X, Star, MapPin, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAlert } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'
import { mealRecordsApi } from '@/lib/api/client'
import type { MealRecord } from '@/types'

interface EvaluateModalProps {
  isOpen: boolean
  onClose: () => void
  mealId: string
  mealName: string
  onSuccess?: () => void
}

export function EvaluateModal({ isOpen, onClose, mealId, mealName, onSuccess }: EvaluateModalProps) {
  const [formData, setFormData] = useState({
    rating: 0,
    location: '',
    price: '',
    memo: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showAlert } = useAlert()
  const { success: showSuccess } = useToast()

  // Modal이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        rating: 0,
        location: '',
        price: '',
        memo: '',
      })
    }
  }, [isOpen])

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
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
    setFormData(prev => ({ ...prev, rating: value }))
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
      
      showAlert({
        title: '저장 실패',
        message: err.message || '평가 저장에 실패했습니다.',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10 rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">{mealName} 평가하기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* 평점 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              평점 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 justify-center py-4">
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
                      value <= formData.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p className="text-center text-sm text-gray-600">
                {formData.rating}점 선택됨
              </p>
            )}
          </div>

          {/* 장소 */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              장소
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="식당 이름 또는 위치"
              />
            </div>
            <p className="text-xs text-gray-500">
              💡 위치 정보는 사진 찍을 때 자동으로 수집됩니다.
            </p>
          </div>

          {/* 가격 */}
          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              가격
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15000"
                min="0"
                step="100"
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
