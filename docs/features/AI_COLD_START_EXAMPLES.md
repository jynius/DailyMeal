// 사용 예시: frontend/src/app/(main)/page.tsx에 추가

import { useState, useEffect } from 'react'
import { OnboardingQuestionnaire } from '@/components/ai/OnboardingQuestionnaire'

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // 첫 방문 체크
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = async (data) => {
    // 사용자 취향 저장
    await saveUserPreferences(data)
    localStorage.setItem('onboarding_completed', 'true')
    setShowOnboarding(false)
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingQuestionnaire
          onComplete={handleOnboardingComplete}
          onSkip={() => {
            localStorage.setItem('onboarding_completed', 'true')
            setShowOnboarding(false)
          }}
        />
      )}
      
      {/* 기존 홈 페이지 내용 */}
    </>
  )
}
