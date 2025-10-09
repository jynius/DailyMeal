'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()
  
  return (
    <button 
      onClick={() => router.back()}
      className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
    >
      ← 뒤로 가기
    </button>
  )
}
