// frontend/src/components/ai/OnboardingQuestionnaire.tsx
'use client'

import { useState } from 'react'
import { Sparkles, ChevronRight, Check } from 'lucide-react'

interface OnboardingData {
  favoriteCategories: string[]
  priceRange: 'low' | 'medium' | 'high'
  dietaryPreference: string[]
  mealFrequency: 'rarely' | 'sometimes' | 'often' | 'daily'
}

interface OnboardingQuestionnaireProps {
  onComplete: (data: OnboardingData) => void
  onSkip: () => void
}

export function OnboardingQuestionnaire({ onComplete, onSkip }: OnboardingQuestionnaireProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    favoriteCategories: [],
    priceRange: 'medium',
    dietaryPreference: [],
    mealFrequency: 'sometimes',
  })

  const categories = [
    { id: 'korean', label: '한식', emoji: '🍚' },
    { id: 'chinese', label: '중식', emoji: '🥟' },
    { id: 'japanese', label: '일식', emoji: '🍱' },
    { id: 'western', label: '양식', emoji: '🍝' },
    { id: 'cafe', label: '카페/디저트', emoji: '☕' },
    { id: 'fastfood', label: '패스트푸드', emoji: '🍔' },
  ]

  const dietary = [
    { id: 'spicy', label: '매운 음식 좋아함', emoji: '🌶️' },
    { id: 'healthy', label: '건강식 선호', emoji: '🥗' },
    { id: 'meat', label: '고기 좋아함', emoji: '🥩' },
    { id: 'seafood', label: '해산물 좋아함', emoji: '🦐' },
    { id: 'vegetarian', label: '채식 지향', emoji: '🥬' },
  ]

  const toggleSelection = (key: 'favoriteCategories' | 'dietaryPreference', value: string) => {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }))
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">AI 맛집 추천을 시작해볼까요?</h2>
              <p className="text-sm text-gray-600">
                몇 가지 질문으로 당신의 취향을 알려주세요
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">좋아하는 음식 종류를 선택하세요</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleSelection('favoriteCategories', cat.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      data.favoriteCategories.includes(cat.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                    {data.favoriteCategories.includes(cat.id) && (
                      <Check size={16} className="text-purple-600 absolute top-2 right-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 mb-3">선호하는 가격대는?</h3>
            <div className="space-y-2">
              {[
                { id: 'low', label: '가성비 중시', desc: '1인당 ~10,000원' },
                { id: 'medium', label: '적당한 가격', desc: '1인당 10,000~20,000원' },
                { id: 'high', label: '가격 무관', desc: '1인당 20,000원+' },
              ].map((price) => (
                <button
                  key={price.id}
                  onClick={() => setData((prev) => ({ ...prev, priceRange: price.id as any }))}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    data.priceRange === price.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="font-medium text-gray-900">{price.label}</div>
                  <div className="text-sm text-gray-600">{price.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 mb-3">식사 스타일을 알려주세요</h3>
            <div className="grid grid-cols-2 gap-2">
              {dietary.map((diet) => (
                <button
                  key={diet.id}
                  onClick={() => toggleSelection('dietaryPreference', diet.id)}
                  className={`p-3 rounded-lg border-2 transition-all relative ${
                    data.dietaryPreference.includes(diet.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">{diet.emoji}</div>
                  <div className="text-xs font-medium text-gray-900">{diet.label}</div>
                  {data.dietaryPreference.includes(diet.id) && (
                    <Check size={16} className="text-purple-600 absolute top-2 right-2" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">외식 빈도는?</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'rarely', label: '가끔' },
                  { id: 'sometimes', label: '보통' },
                  { id: 'often', label: '자주' },
                  { id: 'daily', label: '매일' },
                ].map((freq) => (
                  <button
                    key={freq.id}
                    onClick={() => setData((prev) => ({ ...prev, mealFrequency: freq.id as any }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      data.mealFrequency === freq.id
                        ? 'border-purple-500 bg-purple-50 font-semibold'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="text-sm text-gray-900">{freq.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        {renderStep()}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            건너뛰기
          </button>
          <button
            onClick={() => {
              if (step < 3) {
                setStep(step + 1)
              } else {
                onComplete(data)
              }
            }}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            {step === 3 ? '완료' : '다음'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
